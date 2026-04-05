from __future__ import annotations

import os
import sys
from pathlib import Path
from types import SimpleNamespace
import unittest

from fastapi import HTTPException


sys.path.append(str(Path(__file__).resolve().parents[2]))
os.environ["DEBUG"] = "True"

from app.ai.schemas.schemas import FeedbackRequest
from app.routers import ai_router


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
    def __init__(self, execute_results):
        self._results = list(execute_results)
        self.added = []
        self.committed = False

    async def execute(self, *_args, **_kwargs):
        if not self._results:
            raise AssertionError("Unexpected execute call")
        return _FakeResult(self._results.pop(0))

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        self.committed = True


class AIRouterWave2Tests(unittest.IsolatedAsyncioTestCase):
    async def test_get_messages_returns_latest_window_in_chronological_order(self):
        thread = SimpleNamespace(id="thread-1", user_id=1)
        # Simulate DB rows from DESC+LIMIT query order.
        latest_desc = [
            SimpleNamespace(
                id="m5",
                role="assistant",
                text="latest",
                created_at=SimpleNamespace(isoformat=lambda: "2026-04-06T10:05:00"),
                structured_json={},
            ),
            SimpleNamespace(
                id="m4",
                role="tool",
                text=None,
                created_at=SimpleNamespace(isoformat=lambda: "2026-04-06T10:04:00"),
                structured_json={},
            ),
            SimpleNamespace(
                id="m3",
                role="user",
                text="older",
                created_at=SimpleNamespace(isoformat=lambda: "2026-04-06T10:03:00"),
                structured_json={},
            ),
        ]
        db = _FakeDB([thread, latest_desc])
        user = SimpleNamespace(id=1)

        response = await ai_router.get_messages("thread-1", limit=3, db=db, user=user)
        self.assertEqual(response["thread_id"], "thread-1")
        # tool/system artifacts filtered and remaining messages returned oldest->newest.
        self.assertEqual([m["id"] for m in response["messages"]], ["m3", "m5"])

    async def test_feedback_rejects_message_thread_mismatch(self):
        thread = SimpleNamespace(id="thread-1", user_id=1)
        other_thread_msg = SimpleNamespace(id="msg-1", thread_id="thread-2", role="assistant")
        db = _FakeDB([thread, other_thread_msg])
        user = SimpleNamespace(id=1)
        payload = FeedbackRequest(thread_id="thread-1", message_id="msg-1", rating=4)

        with self.assertRaises(HTTPException) as ctx:
            await ai_router.feedback(payload=payload, db=db, user=user)

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("does not belong", ctx.exception.detail)

    async def test_feedback_accepts_valid_assistant_message(self):
        thread = SimpleNamespace(id="thread-1", user_id=1)
        msg = SimpleNamespace(id="msg-1", thread_id="thread-1", role="assistant")
        db = _FakeDB([thread, msg])
        user = SimpleNamespace(id=1)
        payload = FeedbackRequest(thread_id="thread-1", message_id="msg-1", rating=5)

        response = await ai_router.feedback(payload=payload, db=db, user=user)
        self.assertEqual(response, {"status": "ok"})
        self.assertTrue(db.committed)
        self.assertEqual(len(db.added), 1)


if __name__ == "__main__":
    unittest.main()
