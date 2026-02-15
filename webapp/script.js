let params = new URLSearchParams(window.location.search);
let gameId = params.get('gameId');
let vsBot = false;

if(!gameId){
    gameId = Math.random().toString(36).substring(2,8);
    window.history.replaceState(null, '', `?gameId=${gameId}`);
}

const cells = document.querySelectorAll('.cell');
let myRole = '';
let myTurn = false;
let board = Array(9).fill('');
let ws = null;

// ===== Модалки =====
const inviteBtn = document.getElementById('invite');
const modal = document.getElementById('invite-modal');
const closeBtn = modal.querySelector('.close');
const inviteLinkInput = document.getElementById('invite-link');
const copyBtn = document.getElementById('copy-link');
const readyModal = document.getElementById('ready-modal');
const readyBtn = document.getElementById('ready-btn');
const playBotBtn = document.getElementById('play-bot');

inviteLinkInput.value = `${window.location.origin}${window.location.pathname}?gameId=${gameId}`;

inviteBtn.onclick = ()=>modal.style.display='block';
closeBtn.onclick = ()=>modal.style.display='none';
window.onclick = e=>{if(e.target==modal||e.target==readyModal) modal.style.display='none';}

copyBtn.onclick=()=>{navigator.clipboard.writeText(inviteLinkInput.value); alert("Ссылка скопирована!");}

// ===== Функция подключения WebSocket =====
function connectWS(){
    ws = new WebSocket(`wss://${window.location.host}/ws/${gameId}`);
    ws.onmessage = handleMessage;
}

// ===== Обработка сообщений =====
function handleMessage(event){
    const data = JSON.parse(event.data);

    if(data.type==="start"){
        myRole = data.role;
        myTurn = data.turn===myRole;
        document.querySelector('.role').textContent=`Вы: ${myRole}`;
        document.querySelector('.turn').textContent=`Ход: ${data.turn}`;
        if(myTurn) alert("Ваш ход!");
        else alert("Ход противника!");
    }

    if(data.type==="update"){
        board = data.board;
        board.forEach((v,i)=>cells[i].textContent=v);
        myTurn = data.turn===myRole;
        document.querySelector('.turn').textContent=`Ход: ${data.turn}`;
        if(myTurn) alert("Ваш ход!");
    }

    if(data.type==="game_over"){
        board.fill(''); cells.forEach(c=>c.textContent='');
        if(data.winner==='draw') alert("Ничья!");
        else if(data.winner===myRole) alert("Вы выиграли!");
        else alert("Вы проиграли!");
    }
}

// ===== Клик по клетке =====
cells.forEach(cell=>{
    cell.addEventListener('click',()=>{
        const index = parseInt(cell.dataset.index);
        if(board[index]==='' && myTurn){
            if(vsBot){
                board[index] = myRole;
                cell.textContent = myRole;
                myTurn=false;
                alert("Ход противника...");
                setTimeout(botMove, 500);
            } else {
                ws.send(JSON.stringify({type:"move", index}));
            }
        }
    });
});

// ===== Бот =====
function botMove(){
    let empty = board.map((v,i)=>v===''?i:null).filter(v=>v!==null);
    let choice = empty[Math.floor(Math.random()*empty.length)];
    board[choice] = myRole==='X'?'O':'X';
    cells[choice].textContent = board[choice];
    myTurn=true;
    alert("Ваш ход!");
    checkWinner();
}

function checkWinner(){
    const patterns=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,c] of patterns){
        if(board[a] && board[a]===board[b] && board[b]===board[c]){
            alert(board[a]===myRole ? "Вы выиграли!" : "Вы проиграли!");
            board.fill(''); cells.forEach(c=>c.textContent='');
            return;
        }
    }
    if(board.every(c=>c!=='')){
        alert("Ничья!");
        board.fill(''); cells.forEach(c=>c.textContent='');
    }
}

// ===== Подтверждение готовности =====
readyBtn.onclick=()=>{
    readyModal.style.display='none';
    if(!vsBot) ws.send(JSON.stringify({type:"ready"}));
    else startBotGame();
}

// ===== Играть с ботом =====
playBotBtn.onclick=()=>{
    vsBot=true;
    myRole='X';
    myTurn=true;
    document.querySelector('.role').textContent=`Вы: ${myRole}`;
    document.querySelector('.turn').textContent=`Ход: ${myRole}`;
    alert("Игра с ботом! Ваш ход.");
}

// ===== Начало игры с ботом =====
function startBotGame(){
    myRole=Math.random()<0.5?'X':'O';
    myTurn=myRole==='X';
    document.querySelector('.role').textContent=`Вы: ${myRole}`;
    document.querySelector('.turn').textContent=`Ход: ${myTurn?myRole:'Противника'}`;
    if(!myTurn) setTimeout(botMove, 500);
}

// ===== Подключение к WebSocket для мультиплеера =====
if(!vsBot) connectWS();
