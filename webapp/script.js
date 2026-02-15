let board = ["","","","","","","","",""];
let current = "X";

function checkWinner(){
  const w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(let a of w){
    if(board[a[0]] && board[a[0]]===board[a[1]] && board[a[1]]===board[a[2]]){
      a.forEach(i => document.getElementById("c"+i).classList.add("win"));
      setTimeout(()=>alert("Победа "+board[a[0]]), 100);
      setTimeout(()=>location.reload(), 1500);
    }
  }
  if(!board.includes("")){
    setTimeout(()=>alert("Ничья"), 100);
    setTimeout(()=>location.reload(), 1500);
  }
}

function move(i){
  if(board[i] !== "") return;
  board[i] = current;
  document.getElementById("c"+i).innerText = current;
  checkWinner();
  current = current === "X" ? "O" : "X";
}

function render(){
  const b = document.getElementById("board");
  for(let i=0;i<9;i++){
    let d = document.createElement("div");
    d.className="cell";
    d.id="c"+i;
    d.onclick = ()=>move(i);
    b.appendChild(d);
  }
}

render();
