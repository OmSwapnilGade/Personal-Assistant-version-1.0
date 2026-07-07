import os
from groq import AsyncGroq
from ..config import settings


# SYSTEM_PROMPT = """You are an AI assistant for a student developer. You help with:
# 1. **Study help** — explain concepts, summarize topics, help with homework
# 2. **Coding help** — debug code, explain algorithms, suggest solutions
# 3. **Competitive programming** — explain problems, provide hints (not full solutions first), analyze time/space complexity, suggest similar problems
# 4. **General queries** — answer any question a student might have

# Guidelines:
# - Be concise but thorough
# - For coding questions, always include complexity analysis
# - For CP problems, give hints first, then solution if asked
# - Use markdown formatting for code blocks, lists, and emphasis
# - If asked about a specific programming language, use that language in examples
# - Be encouraging and educational in tone"""


class GroqService:
    """Wrapper around Groq API for AI chat functionality."""

    def __init__(self):
        self.client = None
        self._initialized = False

    def _ensure_initialized(self):
        """Lazy initialization of Groq client."""
        if not self._initialized:
            if not settings.groq_api_key:
                raise ValueError(
                    "GROQ_API_KEY not set. Add it to your .env file."
                )
            self.client = AsyncGroq(api_key=settings.groq_api_key)
            self._initialized = True

    async def chat(
        self,
        message: str,
        recent_history: list[dict] | None = None,
    ) -> str:
        """
        Send a message to Groq with optional recent chat history for context.

        Args:
            message: The user's current message
            recent_history: Last N messages as [{"role": "user"/"assistant", "content": "..."}]

        Returns:
            The AI response as a string
        """
        self._ensure_initialized()

        # Build conversation context from recent history
        messages = []
        if recent_history:
            for msg in recent_history:
                # Map role "model" to "assistant" since Groq expects "assistant"
                role = "assistant" if msg["role"] == "model" else msg["role"]
                messages.append({
                    "role": role,
                    "content": msg["content"],
                })
        
        messages.append({
            "role": "user",
            "content": message
        })

        try:
            chat_completion = await self.client.chat.completions.create(
                messages=messages,
                model=settings.groq_model,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return "⚠️ API rate limit reached. Please check your Groq billing or try a different API key."
            else:
                return f"⚠️ AI service error: {error_msg}"


# Singleton service instance
groq_service = GroqService()
