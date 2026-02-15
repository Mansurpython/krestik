import aiosqlite

DB_FILE = "krestik.db"

async def init_db():
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                nickname TEXT DEFAULT 'Игрок',
                bot_score INTEGER DEFAULT 0
            );
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS stats (
                user_id TEXT,
                friend_id TEXT,
                wins INTEGER DEFAULT 0,
                PRIMARY KEY (user_id, friend_id)
            );
        """)
        await db.commit()
