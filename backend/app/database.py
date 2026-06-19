from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings
import certifi

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db():
    """Initialize MongoDB connection and create indexes."""
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_uri, tlsCAFile=certifi.where())
    db = client[settings.database_name]

    # Create indexes for performance
    await db.tasks.create_index([("status", 1), ("priority", 1)])
    await db.tasks.create_index([("deadline", 1)])
    await db.tasks.create_index([("tags", 1)])

    await db.timetable.create_index([("day", 1), ("start_time", 1)])

    await db.attendance.create_index([("subject", 1)], unique=True)

    await db.chat_history.create_index([("created_at", -1)])

    await db.links.create_index([("category", 1)])
    await db.links.create_index(
        [("title", "text"), ("description", "text")]
    )

    await db.reminders.create_index([("remind_at", 1), ("is_triggered", 1)])

    print("Connected to MongoDB and indexes created")


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return db
