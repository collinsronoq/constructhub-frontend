# # app/ai/providers/openai_provider.py
# import os
# from typing import Any
# from app.ai.providers.base import LLMProvider

# # You will: pip install openai
# from openai import AsyncOpenAI


# class OpenAIProvider(LLMProvider):
#     def __init__(self) -> None:
#         self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
#         self.model = os.getenv("OPENAI_MODEL", "gpt-5-mini")

#     async def generate(self, *, system_prompt: str, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> dict[str, Any]:
#         """
#         This is intentionally a thin wrapper.
#         You can evolve it to support:
#           - tool calls loop
#           - structured outputs schema
#           - streaming
#         """
#         resp = await self.client.responses.create(
#             model=self.model,
#             input=[
#                 {"role": "system", "content": system_prompt},
#                 *messages,
#             ],
#             tools=tools,
#             # store=False is often preferred when you store conversations yourself.
#             store=False,
#         )

#         # The OpenAI response object is structured; you will parse outputs here.
#         # For now, return the raw response and parse it in service.py.
#         return {"raw": resp}
