import asyncio
from aiogram import Bot, Dispatcher
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import CommandStart

# Вставь сюда токен своего бота
TOKEN = "8445500914:AAEq9lvI2YGz4iZiR0Ih5bMsnuW9I0omudE"

# Сюда вставь ссылку от LocalTunnel, которую выдаст команда npx localtunnel --port 8000
WEBAPP_URL = "https://krestik-production-5fd9.up.railway.app"

bot = Bot(TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🎮 Играть", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])
    await message.answer("🖤 Krestik Nolik\nИграй, прокачивайся, зарабатывай ⭐", reply_markup=kb)

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
