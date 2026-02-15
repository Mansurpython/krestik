const cells = document.querySelectorAll('.cell');
let turn = 'X';
let board = Array(9).fill('');

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.dataset.index;
        if (board[index] === '') {
            board[index] = turn;
            cell.textContent = turn;
            cell.style.color = turn === 'X' ? '#ff4444' : '#44ff44';
            turn = turn === 'X' ? 'O' : 'X';
            checkWin();
        }
    });
});

function checkWin() {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWin(pattern);
            setTimeout(resetBoard, 1000);
            break;
        }
    }
}

function highlightWin(pattern) {
    pattern.forEach(i => cells[i].style.backgroundColor = '#ff0');
}

function resetBoard() {
    board.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = '#222';
    });
}

// Модальное окно для приглашений
const inviteBtn = document.getElementById('invite');
const modal = document.getElementById('invite-modal');
const closeBtn = modal.querySelector('.close');

inviteBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target == modal) modal.style.display = 'none'; }

// Кнопки “Пригласить” в списке друзей
const friendButtons = document.querySelectorAll('.invite-btn');
friendButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const user = btn.dataset.user;
        // Генерация ссылки для друга
        const link = `${WEBAPP_URL}?invite=${user}`;
        alert(`Скопируйте ссылку и отправьте другу: ${link}`);
        // Можно добавить copy-to-clipboard:
        navigator.clipboard.writeText(link);
    });
});
