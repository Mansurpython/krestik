from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import random
from db import get_user, increment_win, increment_bot_score, init_db

app = FastAPI()
app.mount("/webapp", StaticFiles(directory="webapp"), name="webapp")

# Инициализация БД при старте
@app.on_event("startup")
async def startup_event():
    await init_db()

games = {}

@app.get("/")
async def index():
    with open("webapp/index.html") as f:
        return HTMLResponse(f.read())

@app.websocket("/ws/{game_id}/{user_id}")
async def ws_endpoint(websocket: WebSocket, game_id: str, user_id: str):
    await websocket.accept()
    if game_id not in games:
        games[game_id] = {
            "players": {},
            "board": ['']*9,
            "turn": "",
            "ready": {},
            "roles": {}
        }
    game = games[game_id]
    game["players"][user_id] = websocket
    game["ready"][user_id] = False

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type")=="ready":
                game["ready"][user_id] = True
                if len(game["players"])==2 and all(game["ready"].values()):
                    u1, u2 = list(game["players"].keys())
                    if random.choice([True, False]):
                        game["roles"][u1]='X'; game["roles"][u2]='O'
                    else:
                        game["roles"][u1]='O'; game["roles"][u2]='X'
                    game["turn"]='X'
                    for uid, ws in game["players"].items():
                        await ws.send_json({"type":"start","role":game["roles"][uid],"turn":game["turn"]})
            
            elif data.get("type")=="move":
                index = data["index"]
                if game["board"][index]=='' and game["roles"][user_id]==game["turn"]:
                    game["board"][index]=game["turn"]
                    winner = check_winner(game["board"])
                    if winner:
                        for uid, ws in game["players"].items():
                            await ws.send_json({"type":"game_over","winner":winner})
                        if winner != "draw":
                            u1, u2 = list(game["players"].keys())
                            if winner==game["roles"][u1]:
                                await increment_win(u1, u2)
                            else:
                                await increment_win(u2, u1)
                        game["board"]=['']*9
                    else:
                        game["turn"] = 'O' if game["turn"]=='X' else 'X'
                        for uid, ws in game["players"].items():
                            await ws.send_json({"type":"update","board":game["board"],"turn":game["turn"]})
    except WebSocketDisconnect:
        if user_id in game["players"]:
            del game["players"][user_id]
            del game["ready"][user_id]
            if user_id in game["roles"]:
                del game["roles"][user_id]

def check_winner(board):
    patterns=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for a,b,c in patterns:
        if board[a] and board[a]==board[b]==board[c]:
            return board[a]
    if '' not in board:
        return "draw"
    return None
