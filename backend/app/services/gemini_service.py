import google.generativeai as genai
from ..config import settings


SYSTEM_PROMPT = """You are an AI assistant for a student developer. You help with:
1. **Study help** — explain concepts, summarize topics, help with homework
2. **Coding help** — debug code, explain algorithms, suggest solutions
3. **Competitive programming** — explain problems, provide hints (not full solutions first), analyze time/space complexity, suggest similar problems
4. **General queries** — answer any question a student might have

Guidelines:
- Be concise but thorough
- For coding questions, always include complexity analysis
- For CP problems, give hints first, then solution if asked
- Use markdown formatting for code blocks, lists, and emphasis
- If asked about a specific programming language, use that language in examples
- Be encouraging and educational in tone"""


class GeminiService:
    """Wrapper around Google Gemini API for AI chat functionality."""

    def __init__(self):
        self.model = None
        self._initialized = False

    def _ensure_initialized(self):
        """Lazy initialization of Gemini client."""
        if not self._initialized:
            if not settings.gemini_api_key:
                raise ValueError(
                    "GEMINI_API_KEY not set. Add it to your .env file."
                )
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(
                model_name=settings.gemini_model,
                system_instruction=SYSTEM_PROMPT,
            )
            self._initialized = True

    async def chat(
        self,
        message: str,
        recent_history: list[dict] | None = None,
    ) -> str:
        """
        Send a message to Gemini with optional recent chat history for context.

        Args:
            message: The user's current message
            recent_history: Last N messages as [{"role": "user"/"model", "parts": ["..."]}]

        Returns:
            The AI response as a string
        """
        self._ensure_initialized()

        # Build conversation context from recent history
        history = []
        if recent_history:
            for msg in recent_history:
                history.append({
                    "role": msg["role"],
                    "parts": [msg["content"]],
                })

        try:
            chat_session = self.model.start_chat(history=history)
            response = chat_session.send_message(message)
            return response.text
        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return "⚠️ API rate limit reached. Your project might not have free tier access (limit: 0). Please check your Google Cloud billing or try a different API key."
            elif "safety" in error_msg.lower():
                return "⚠️ The response was blocked by safety filters. Please rephrase your question."
            else:
                return f"⚠️ AI service error: {error_msg}"


# Singleton service instance
gemini_service = GeminiService()
