// ===== Инициализация gameId =====
let params = new URLSearchParams(window.location.search);
let gameId = params.get('gameId');
if(!gameId){
    gameId = Math.random().toString(36).substring(2,8);
    window.history.replaceState(null, '', `?gameId=${gameId}`);
}

const cells = document.querySelectorAll('.cell');
let myRole = '';
let myTurn = false;
let board = Array(9).fill('');

// ===== Модалки =====
const inviteBtn = document.getElementById('invite');
const modal = document.getElementById('invite-modal');
const closeBtn = modal.querySelector('.close');
const inviteLinkInput = document.getElementById('invite-link');
const copyBtn = document.getElementById('copy-link');
const readyModal = document.getElementById('ready-modal');
const readyBtn = document.getElementById('ready-btn');

// ===== Генерация ссылки приглашения =====
const inviteLink = `${window.location.origin}${window.location.pathname}?gameId=${gameId}`;
inviteLinkInput.value = inviteLink;

// Открытие и закрытие модалки
inviteBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target==modal || e.target==readyModal) { modal.style.display='none'; readyModal.style.display='none'; } }

// Копирование ссылки
copyBtn.onclick = () => { navigator.clipboard.writeText(inviteLink); alert("Ссылка скопирована!"); }

// ===== WebSocket =====
const ws = new WebSocket(`wss://${window.location.host}/ws/${gameId}`);

// Нажатие готовности
readyBtn.onclick = () => {
    ws.send(JSON.stringify({type:"ready"}));
    readyModal.style.display='none';
}

// ===== WebSocket события =====
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if(data.type==="start"){
        myRole = data.role;
        myTurn = data.turn===myRole;
        document.querySelector('.role').textContent = `Вы: ${myRole}`;
        document.querySelector('.turn').textContent = `Ход: ${data.turn}`;
        alert(`Игра началась! Вы ${myRole}, ход ${data.turn}`);
    }

    if(data.type==="update"){
        board = data.board;
        board.forEach((v,i)=>cells[i].textContent=v);
        myTurn = data.turn===myRole;
        document.querySelector('.turn').textContent = `Ход: ${data.turn}`;
    }

    if(data.type==="game_over"){
        board.fill('');
        cells.forEach(c=>c.textContent='');
        if(data.winner==='draw') alert("Ничья!");
        else if(data.winner===myRole) alert("Вы выиграли!");
        else alert("Вы проиграли!");
    }
};

// ===== Клик по клетке =====
cells.forEach(cell=>{
    cell.addEventListener('click', ()=>{
        const index = parseInt(cell.dataset.index);
        if(myTurn && board[index]===''){
            ws.send(JSON.stringify({type:"move", index}));
        }
    });
});
