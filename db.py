import aiosqlite

DB = "game.db"

async def init_db():
    async with aiosqlite.connect(DB) as db:
        await db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            level INTEGER,
            points INTEGER,
            stars INTEGER,
            rating INTEGER,
            skin TEXT
        )
        """)
        await db.commit()


async def get_user(user_id):
    async with aiosqlite.connect(DB) as db:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = await cursor.fetchone()

        if not user:
            await db.execute(
                "INSERT INTO users VALUES (?,1,0,0,1000,'default')",
                (user_id,)
            )
            await db.commit()
            return (user_id,1,0,0,1000,"default")

        return user


async def update_user(user_id, level, points, stars, rating, skin):
    async with aiosqlite.connect(DB) as db:
        await db.execute("""
        UPDATE users SET level=?, points=?, stars=?, rating=?, skin=? 
        WHERE id=?
        """, (level, points, stars, rating, skin, user_id))
        await db.commit()