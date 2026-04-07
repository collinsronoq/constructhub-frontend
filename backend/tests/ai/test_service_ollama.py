from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch


sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.ai.providers.ollama_provider import OllamaProvider
from app.ai.schemas.schemas import ChatRequest
from app.ai.service import service_ollama


class _FakeScalars:
    def __init__(self, value):
        self._value = value

    def first(self):
        return self._value

    def all(self):
        if isinstance(self._value, list):
            return self._value
        if self._value is None:
            return []
        return [self._value]


class _FakeResult:
    def __init__(self, value):
        self._value = value

    def scalars(self):
        return _FakeScalars(self._value)


class _FakeDB:
    def __init__(self, thread):
        self.thread = thread
        self.added = []

    async def execute(self, *_args, **_kwargs):
        return _FakeResult(self.thread)

    def add(self, obj):
        self.added.append(obj)

    async def flush(self):
        return None


class _FakeProvider:
    def __init__(self, responses, stream_chunks=None):
        self.responses = list(responses)
        self.stream_chunks = list(stream_chunks or [])
        self.calls = []
        self.stream_calls = []

    async def generate(self, *, system_prompt, messages, tools=None, num_predict=None):
        self.calls.append({"system_prompt": system_prompt, "messages": messages, "tools": tools})
        if not self.responses:
            raise AssertionError("Provider called more times than expected")
        return self.responses.pop(0)

    async def stream_generate(self, *, system_prompt, messages, num_predict=None):
        self.stream_calls.append({"system_prompt": system_prompt, "messages": messages})
        for chunk in self.stream_chunks:
            yield chunk


class ServiceOllamaTests(unittest.IsolatedAsyncioTestCase):
    async def test_current_turn_message_not_duplicated(self):
        thread = SimpleNamespace(id="thread-1", user_id=1, project_id=None, last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        provider = _FakeProvider(
            [
                {
                    "assistant_text": '{"type":"final","text":"ok","confidence":0.9,"citations":[],"cards":[],"next_actions":[]}',
                    "usage": {},
                }
            ]
        )
        saved_messages = []

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            msg = SimpleNamespace(
                id=f"m{len(saved_messages) + 1}",
                thread_id=thread_id,
                role=role,
                text=text,
                structured_json=structured_json,
            )
            saved_messages.append(msg)
            return msg

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "hello"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
        ):
            payload = ChatRequest(thread_id="thread-1", message="hello")
            await service_ollama.handle_chat(db, user_id=1, payload=payload)

        sent_messages = provider.calls[0]["messages"]
        hello_user_messages = [m for m in sent_messages if m.get("role") == "user" and m.get("content") == "hello"]
        self.assertEqual(len(hello_user_messages), 1)

    async def test_assistant_history_persists_final_normalized_text(self):
        thread = SimpleNamespace(id="thread-2", user_id=1, project_id=None, last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        provider = _FakeProvider(
            [
                {
                    "assistant_text": '{"type":"tool_call","tool_name":"rough_cost_estimate","args":{"bedrooms":3}}',
                    "usage": {},
                }
            ]
        )
        saved_messages = []

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            msg = SimpleNamespace(
                id=f"m{len(saved_messages) + 1}",
                thread_id=thread_id,
                role=role,
                text=text,
                structured_json=structured_json,
            )
            saved_messages.append(msg)
            return msg

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "How much will it cost?"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
            patch.object(service_ollama, "_run_tool", new=AsyncMock(return_value={"total_kes": {"mid": 100}})),
            patch.object(service_ollama, "_log_tool_call", new=AsyncMock()),
        ):
            _message_id, assistant_payload, _usage = await service_ollama.handle_chat(
                db, user_id=1, payload=ChatRequest(thread_id="thread-2", message="How much will it cost?")
            )

        assistant_entries = [m for m in saved_messages if m.role == "assistant"]
        self.assertEqual(len(assistant_entries), 1)
        self.assertIn("rough cost range", assistant_entries[0].text.lower())
        self.assertIn("kes 100", assistant_payload.text.lower())
        self.assertTrue(all(not ((m.text or "").strip().startswith("{")) for m in assistant_entries))

        tool_entries = [m for m in saved_messages if m.role == "tool"]
        self.assertEqual(len(tool_entries), 1)
        self.assertIsNone(tool_entries[0].text)

    async def test_thread_project_id_used_when_context_project_missing(self):
        thread = SimpleNamespace(id="thread-3", user_id=1, project_id="thread-project-123", last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        provider = _FakeProvider(
            [
                {
                    "assistant_text": '{"type":"tool_call","tool_name":"get_estimate_summary","args":{}}',
                    "usage": {},
                },
                {
                    "assistant_text": '{"type":"final","text":"Summary ready.","confidence":0.7,"citations":[],"cards":[],"next_actions":[]}',
                    "usage": {},
                },
            ]
        )
        saved_messages = []
        run_tool_mock = AsyncMock(return_value={"summary": {"total_cost": 1}})

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            msg = SimpleNamespace(
                id=f"m{len(saved_messages) + 1}",
                thread_id=thread_id,
                role=role,
                text=text,
                structured_json=structured_json,
            )
            saved_messages.append(msg)
            return msg

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "Summarize my estimate"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
            patch.object(service_ollama, "_run_tool", new=run_tool_mock),
            patch.object(service_ollama, "_log_tool_call", new=AsyncMock()),
        ):
            await service_ollama.handle_chat(
                db,
                user_id=1,
                payload=ChatRequest(thread_id="thread-3", message="Summarize my estimate"),
            )

        called_tool_args = run_tool_mock.await_args.args[1]
        self.assertEqual(called_tool_args.get("project_id"), "thread-project-123")

    async def test_placeholder_project_id_is_replaced_by_thread_project_id(self):
        thread = SimpleNamespace(id="thread-3b", user_id=1, project_id="thread-project-xyz", last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        provider = _FakeProvider(
            [
                {
                    "assistant_text": '{"type":"tool_call","tool_name":"get_estimate_summary","args":{"project_id":"your_project_id"}}',
                    "usage": {},
                },
                {
                    "assistant_text": '{"type":"final","text":"Summary ready.","confidence":0.7,"citations":[],"cards":[],"next_actions":[]}',
                    "usage": {},
                },
            ]
        )
        run_tool_mock = AsyncMock(return_value={"summary": {"total_cost": 1}})

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            return SimpleNamespace(
                id="msg",
                thread_id=thread_id,
                role=role,
                text=text,
                structured_json=structured_json,
            )

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "Summarize my estimate"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
            patch.object(service_ollama, "_run_tool", new=run_tool_mock),
            patch.object(service_ollama, "_log_tool_call", new=AsyncMock()),
        ):
            await service_ollama.handle_chat(
                db,
                user_id=1,
                payload=ChatRequest(thread_id="thread-3b", message="Summarize my estimate"),
            )

        called_tool_args = run_tool_mock.await_args.args[1]
        self.assertEqual(called_tool_args.get("project_id"), "thread-project-xyz")

    async def test_provider_factory_falls_back_to_ollama_for_non_ollama_name(self):
        service_ollama._CACHED_PROVIDER = None
        service_ollama._WARNED_UNSUPPORTED_PROVIDER = False

        provider = service_ollama._provider_factory(provider_name="openai")
        self.assertIsInstance(provider, OllamaProvider)

    async def test_invalid_output_repaired_with_retry(self):
        thread = SimpleNamespace(id="thread-4", user_id=1, project_id=None, last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        provider = _FakeProvider(
            [
                {"assistant_text": "not-json", "usage": {}},
                {
                    "assistant_text": '{"type":"final","text":"Recovered response.","confidence":0.6,"citations":[],"cards":[],"next_actions":[]}',
                    "usage": {},
                },
            ]
        )

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            return SimpleNamespace(id="msg", thread_id=thread_id, role=role, text=text, structured_json=structured_json)

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "hello"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
        ):
            _mid, assistant_payload, _usage = await service_ollama.handle_chat(
                db, user_id=1, payload=ChatRequest(thread_id="thread-4", message="hello")
            )

        self.assertEqual(assistant_payload.text, "Recovered response.")
        self.assertEqual(len(provider.calls), 2)

    async def test_grounded_tool_result_is_synthesized_without_second_llm_call(self):
        thread = SimpleNamespace(id="thread-4b", user_id=1, project_id="thread-project-123", last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        provider = _FakeProvider(
            [
                {
                    "assistant_text": '{"type":"tool_call","tool_name":"get_estimate_summary","args":{"project_id":"thread-project-123"}}',
                    "usage": {},
                },
            ]
        )
        run_tool_mock = AsyncMock(return_value={"summary": {"total_cost": 1}})
        saved_messages = []

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            msg = SimpleNamespace(
                id=f"m{len(saved_messages) + 1}",
                thread_id=thread_id,
                role=role,
                text=text,
                structured_json=structured_json,
            )
            saved_messages.append(msg)
            return msg

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "Summarize my estimate"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
            patch.object(service_ollama, "_run_tool", new=run_tool_mock),
            patch.object(service_ollama, "_log_tool_call", new=AsyncMock()),
        ):
            _mid, assistant_payload, _usage = await service_ollama.handle_chat(
                db, user_id=1, payload=ChatRequest(thread_id="thread-4b", message="Summarize my estimate")
            )

        self.assertIn("estimate summary", assistant_payload.text.lower())
        self.assertEqual(run_tool_mock.await_count, 1)
        self.assertEqual(len(provider.calls), 1)

    async def test_stream_chat_events_falls_back_to_non_stream_for_grounded_requests(self):
        thread = SimpleNamespace(id="thread-5", user_id=1, project_id="proj-1", last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        payload = ChatRequest(thread_id="thread-5", message="Summarize my estimate")

        with patch.object(
            service_ollama,
            "handle_chat",
            new=AsyncMock(
                return_value=(
                    "msg-1",
                    SimpleNamespace(model_dump=lambda: {"text": "Summary", "cards": [], "citations": [], "next_actions": []}),
                    SimpleNamespace(model_dump=lambda: {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2}),
                )
            ),
        ):
            events = []
            async for evt in service_ollama.stream_chat_events(db, user_id=1, payload=payload):
                events.append(evt)

        self.assertTrue(any(e.get("event") == "status" for e in events))
        self.assertTrue(any(e.get("event") == "fallback" for e in events))
        done = [e for e in events if e.get("event") == "done"]
        self.assertEqual(len(done), 1)
        self.assertEqual(done[0]["data"].get("mode"), "non_stream_tool")
        self.assertIn("timing", done[0]["data"])
        self.assertIn("grounded_total_ms", done[0]["data"]["timing"])

    async def test_stream_chat_events_emits_chunks_for_non_grounded_requests(self):
        thread = SimpleNamespace(id="thread-6", user_id=1, project_id=None, last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        payload = ChatRequest(thread_id="thread-6", message="hello there")
        provider = _FakeProvider(responses=[], stream_chunks=["Hel", "lo"])
        saved_messages = []

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            msg = SimpleNamespace(
                id=f"m{len(saved_messages) + 1}",
                thread_id=thread_id,
                role=role,
                text=text,
                structured_json=structured_json,
            )
            saved_messages.append(msg)
            return msg

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "hello there"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
        ):
            events = []
            async for evt in service_ollama.stream_chat_events(db, user_id=1, payload=payload):
                events.append(evt)

        self.assertEqual([e["data"]["delta"] for e in events if e["event"] == "chunk"], ["Hel", "lo"])
        done = [e for e in events if e["event"] == "done"]
        self.assertEqual(len(done), 1)
        self.assertEqual(done[0]["data"].get("mode"), "stream_text")
        self.assertEqual(done[0]["data"]["assistant"]["text"], "Hello")
        self.assertIn("timing", done[0]["data"])
        self.assertIn("total_ms", done[0]["data"]["timing"])

    async def test_stream_chat_events_general_question_still_streams_with_thread_project(self):
        thread = SimpleNamespace(id="thread-7", user_id=1, project_id="proj-1", last_message_at=None, updated_at=None)
        db = _FakeDB(thread)
        payload = ChatRequest(thread_id="thread-7", message="What is plaster ratio?")
        provider = _FakeProvider(responses=[], stream_chunks=["Use ", "1:4"])
        saved_messages = []

        async def fake_save_message(*_args, thread_id, role, text, structured_json=None, **_kwargs):
            msg = SimpleNamespace(
                id=f"m{len(saved_messages) + 1}",
                thread_id=thread_id,
                role=role,
                text=text,
                structured_json=structured_json,
            )
            saved_messages.append(msg)
            return msg

        with (
            patch.object(service_ollama, "_provider_factory", return_value=provider),
            patch.object(
                service_ollama,
                "_load_recent_messages",
                new=AsyncMock(return_value=[{"role": "user", "content": "What is plaster ratio?"}]),
            ),
            patch.object(service_ollama, "_save_message", new=AsyncMock(side_effect=fake_save_message)),
            patch.object(service_ollama, "handle_chat", new=AsyncMock()),
        ):
            events = []
            async for evt in service_ollama.stream_chat_events(db, user_id=1, payload=payload):
                events.append(evt)

        self.assertFalse(any(e.get("event") == "fallback" for e in events))
        done = [e for e in events if e["event"] == "done"]
        self.assertEqual(len(done), 1)
        self.assertEqual(done[0]["data"].get("mode"), "stream_text")
        self.assertEqual(done[0]["data"]["assistant"]["text"], "Use 1:4")

    def test_requires_grounded_tool_detects_mason_lookup(self):
        thread = SimpleNamespace(project_id=None)
        payload = ChatRequest(thread_id="thread-8", message="Find a mason in Nakuru")
        self.assertTrue(service_ollama._requires_grounded_tool(payload, thread))

    def test_requires_grounded_tool_false_for_general_question_with_thread_project(self):
        thread = SimpleNamespace(project_id="proj-9")
        payload = ChatRequest(thread_id="thread-9", message="What is plaster ratio?")
        self.assertFalse(service_ollama._requires_grounded_tool(payload, thread))

    def test_tool_synthesis_surfaces_material_price_and_vendor(self):
        synthesized = service_ollama._synthesize_tool_result(
            "search_material_listings",
            {"material": "cement", "location": "Nairobi"},
            {
                "query": {"material": "cement", "location": "Nairobi"},
                "results": [
                    {
                        "id": "item-1",
                        "name": "Cement 50kg",
                        "price": 780,
                        "unit": "bag",
                        "vendor": {"id": "vendor-1", "name": "BuildMart", "location": "Nairobi"},
                    }
                ],
            },
        )

        self.assertIsNotNone(synthesized)
        self.assertIn("cement 50kg", synthesized.text.lower())
        self.assertIn("kes 780", synthesized.text.lower())
        self.assertTrue(any(c.id == "vendor-1" for c in synthesized.citations))

    def test_estimate_summary_synthesis_hides_internal_id_and_adds_interpretation(self):
        estimate_id = "16e1d353-1ca0-4966-af48-cf41ef925632"
        synthesized = service_ollama._synthesize_tool_result(
            "get_estimate_summary",
            {"project_id": estimate_id},
            {
                "estimate_id": estimate_id,
                "summary": {
                    "total_cost": 6657781.0,
                    "material_cost": 5163528.0,
                    "labour_cost": 618301.0,
                    "other_cost": 875952.0,
                    "phases_count": 9,
                },
                "project_details": {"project_name": "Bungalow Home", "location": "Nakuru"},
                "phase_insights": [
                    {
                        "phase": "finishes",
                        "share_of_total": 0.35,
                        "note": "Finishes dominate cost and should be reviewed item by item.",
                        "top_materials": [{"name": "Main Floor Finish", "total": 562500.0}],
                        "top_labour": [{"name": "Tiler", "total": 30000.0}],
                    },
                    {
                        "phase": "external_works",
                        "share_of_total": 0.17,
                        "note": "External works are meaningful due to walling and concrete.",
                        "top_materials": [{"name": "Wall Blocks", "total": 245980.0}],
                        "top_labour": [{"name": "Mason (Wall)", "total": 30000.0}],
                    },
                ],
            },
        )

        self.assertIsNotNone(synthesized)
        self.assertNotIn(estimate_id, synthesized.text)
        self.assertIn("estimate summary", synthesized.text.lower())
        self.assertIn("what stands out", synthesized.text.lower())
        self.assertIn("planning notes", synthesized.text.lower())
        self.assertIn("limitation note", synthesized.text.lower())
        self.assertIn("kes 6,657,781", synthesized.text.lower())
        self.assertTrue(any(c.id == "Current project estimate data" for c in synthesized.citations))
        self.assertTrue(any("Review full estimate" == a.label for a in synthesized.next_actions))
        self.assertTrue(any("Inspect cost breakdown" == a.label for a in synthesized.next_actions))


if __name__ == "__main__":
    unittest.main()
