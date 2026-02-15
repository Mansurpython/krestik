import aiosqlite
import asyncio

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

async def get_user(user_id):
    async with aiosqlite.connect(DB_FILE) as db:
        cursor = await db.execute("SELECT id, nickname, bot_score FROM users WHERE id=?;", (user_id,))
        row = await cursor.fetchone()
        if row:
            return {"id": row[0], "nickname": row[1], "bot_score": row[2]}
        else:
            await db.execute("INSERT INTO users(id) VALUES(?);", (user_id,))
            await db.commit()
            return {"id": user_id, "nickname": "Игрок", "bot_score": 0}

async def update_nickname(user_id, nickname):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute("UPDATE users SET nickname=? WHERE id=?;", (nickname, user_id))
        await db.commit()

async def increment_bot_score(user_id):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute("UPDATE users SET bot_score = bot_score + 1 WHERE id=?;", (user_id,))
        await db.commit()

async def increment_win(user_id, friend_id):
    async with aiosqlite.connect(DB_FILE) as db:
        cursor = await db.execute("SELECT wins FROM stats WHERE user_id=? AND friend_id=?;", (user_id, friend_id))
        row = await cursor.fetchone()
        if row:
            await db.execute("UPDATE stats SET wins=wins+1 WHERE user_id=? AND friend_id=?;", (user_id, friend_id))
        else:
            await db.execute("INSERT INTO stats(user_id, friend_id, wins) VALUES(?,?,1);", (user_id, friend_id))
        await db.commit()

async def get_stats(user_id, friend_id):
    async with aiosqlite.connect(DB_FILE) as db:
        cursor = await db.execute("SELECT wins FROM stats WHERE user_id=? AND friend_id=?;", (user_id, friend_id))
        row = await cursor.fetchone()
        return row[0] if row else 0

asyncio.run(init_db())
