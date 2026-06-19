import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class RouteResult:
    """Result of command routing."""
    action: str
    requires_ai: bool
    extracted_data: dict | None = None
    confidence: float = 1.0


# Priority-ordered patterns — first match wins
ROUTE_PATTERNS = [
    # Task creation
    (
        r"(?:add|create|new|make)\s+(?:a\s+)?(?:task|todo|to-do)",
        "task_create",
        False,
    ),
    # Task listing
    (
        r"(?:show|list|view|get|my|all|pending|completed)\s+(?:tasks?|todos?|to-dos?)",
        "task_list",
        False,
    ),
    # Task completion
    (
        r"(?:complete|done|finish|mark\s+done|mark\s+complete)\s+(?:task|todo)",
        "task_complete",
        False,
    ),
    # Timetable / schedule
    (
        r"(?:class|classes|schedule|timetable|lecture|lectures)(?:\s+(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday))?",
        "timetable_query",
        False,
    ),
    (
        r"(?:what|which)\s+(?:class|classes|lecture|lectures)",
        "timetable_query",
        False,
    ),
    (
        r"(?:add|create|new)\s+(?:a\s+)?(?:class|lecture|schedule)",
        "timetable_add",
        False,
    ),
    # Attendance marking
    (
        r"(?:present|absent|attended|mark\s+attend|mark\s+present|mark\s+absent)",
        "attendance_mark",
        False,
    ),
    # Attendance check
    (
        r"(?:attendance|percentage|how\s+many\s+class|attendance\s+status)",
        "attendance_check",
        False,
    ),
    # Links
    (
        r"(?:add|save|create|new)\s+(?:a\s+)?(?:link|bookmark|url)",
        "link_add",
        False,
    ),
    (
        r"(?:show|list|view|my|all)\s+(?:links?|bookmarks?)",
        "link_list",
        False,
    ),
    # Reminders
    (
        r"(?:remind\s+me|set\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder|alarm|alert\s+me)",
        "reminder_create",
        False,
    ),
    (
        r"(?:show|list|view|my|upcoming)\s+(?:reminders?|alerts?)",
        "reminder_list",
        False,
    ),
]


class CommandRouter:
    """
    Routes user input to the appropriate service based on keyword patterns.
    Falls back to AI chat when no pattern matches.
    """

    def __init__(self):
        self.patterns = [
            (re.compile(pattern, re.IGNORECASE), action, requires_ai)
            for pattern, action, requires_ai in ROUTE_PATTERNS
        ]

    def route(self, input_text: str) -> RouteResult:
        """
        Classify user input and return routing result.
        Returns action name and whether AI is required.
        """
        normalized = input_text.strip()
        if not normalized:
            return RouteResult(
                action="ai_chat",
                requires_ai=True,
                confidence=0.0,
            )

        for pattern, action, requires_ai in self.patterns:
            if pattern.search(normalized):
                # Extract the remainder after the matched pattern as potential data
                extracted = pattern.sub("", normalized).strip()
                return RouteResult(
                    action=action,
                    requires_ai=requires_ai,
                    extracted_data={"text": extracted} if extracted else None,
                    confidence=0.9,
                )

        # No pattern matched — route to AI
        return RouteResult(
            action="ai_chat",
            requires_ai=True,
            confidence=0.5,
        )


# Singleton router instance
command_router = CommandRouter()
