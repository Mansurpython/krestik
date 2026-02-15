// ====== Инициализация WebSocket и gameId ======
let params = new URLSearchParams(window.location.search);
let gameId = params.get('gameId');
if(!gameId){
    gameId = Math.random().toString(36).substring(2,8);
    window.history.replaceState(null, '', `?gameId=${gameId}`);
}

const ws = new WebSocket(`wss://${window.location.host}/ws/${gameId}`);
const cells = document.querySelectorAll('.cell');
let myTurn = true;

// ====== Обновление поля ======
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    data.board.forEach((val, i) => cells[i].textContent = val);
    myTurn = data.turn === 'X';
};

// ====== Клик по клетке ======
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = parseInt(cell.dataset.index);
        if(myTurn && cell.textContent === ''){
            ws.send(JSON.stringify({index}));
        }
    });
});

// ====== Модальное окно приглашения ======
const inviteBtn = document.getElementById('invite');
const modal = document.getElementById('invite-modal');
const closeBtn = modal.querySelector('.close');
const inviteLinkInput = document.getElementById('invite-link');
const copyBtn = document.getElementById('copy-link');

const inviteLink = `${window.location.origin}${window.location.pathname}?gameId=${gameId}`;
inviteLinkInput.value = inviteLink;

inviteBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target == modal) modal.style.display = 'none'; }

copyBtn.onclick = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Ссылка скопирована!");
};
