from fastapi import APIRouter
from pydantic import BaseModel
from ..services.command_router import command_router

router = APIRouter()


class CommandInput(BaseModel):
    text: str


class CommandResponse(BaseModel):
    action: str
    requires_ai: bool
    extracted_data: dict | None = None
    confidence: float


@router.post("/route", response_model=CommandResponse)
async def route_command(command: CommandInput):
    """
    Route a user command (text or voice-transcribed) to the appropriate service.
    Returns the action to take and whether AI is required.
    """
    result = command_router.route(command.text)
    return CommandResponse(
        action=result.action,
        requires_ai=result.requires_ai,
        extracted_data=result.extracted_data,
        confidence=result.confidence,
    )
