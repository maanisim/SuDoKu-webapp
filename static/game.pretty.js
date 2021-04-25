/*
    In this project I've decided not to use classes as IE11 doesn't support them as described below:
    https://kangax.github.io/compat-table/es6/
    However later on one of the code optimizations I've added has broken the support for IE11 anyways.. 
    so now I am left without IE11 support :/
*/ 

//Default variable names
gameBoardID = "gameBoard";
var emptySpaceID = " ";
var allowedInput = ["1","2","3","4","5","6","7","8","9"];
var stage = "setup";
var stage0 = "setup",stage1 = "play", stage2 = "end";
var boardSize = 9;
var msg = "messageBox";
var board,unedtiableBoard,table,messageBox;
var obj,solvedBoardObj,isValidBoard,didnAskedForSolutions = true;
var serverDomain = "http://127.0.0.1:5000/";

//structure the gameboard
game(boardSize,boardSize);
newBoard(40)

//setBoard() creates a board from the input given by the API
function waitForApiBoard(){
  if(typeof obj !== "undefined"){
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if(obj['board'][i][j] == 0){
          board[i][j] = 0
          unedtiableBoard[i][j] = 0
        } else{
          board[i][j] = obj['board'][i][j]
          unedtiableBoard[i][j] = obj['board'][i][j]
          drawTextInCell(obj['board'][i][j], i, j, null, null);  
        }
      }
      
    }
  }
  else{
      setTimeout(waitForApiBoard, 250);
  }
}

// Check whether board has only valid answers by fetching it to API
function isBoardValidAPICheck() {
  stringToSend = encodeBoard();
  fetch(serverDomain+'valid?puzzle='+stringToSend)
    .then(response => response.json())
    .then(data => isValidBoard = data)
    .then(() => console.log(isValidBoard))
    function waitForAPIValidCheck(){
      if(typeof isValidBoard !== "undefined"){
        if(isValidBoard['isValid'] == true && didnAskedForSolutions == true){
          setMessage("Congratulations!", msg);
        } if(isValidBoard['isValid'] == true && didnAskedForSolutions == false){
          setMessage("<button class=\"buttonPop\" onclick=\"location.reload();\">Next Puzzle?</button>   Better luck next time!", msg);
        }else {
          setMessage("Your solution is not valid! Try again.", msg);
        }
      }
      else{
          setTimeout(waitForAPIValidCheck, 250);
      }
    }
    waitForAPIValidCheck()
}

// Clear whole board visually and on board 
function setBoardClear(){
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        board[i][j] = 0;
        //drawTextInCell("", i, j, null, null)
        document.getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerText = emptySpaceID;
        document.getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML = emptySpaceID;

      }
    }
  }

// Generate a brand new board
function newBoard(difficulty) {
  setBoardClear();
  var difficultyString = 40;
  if(difficulty != null && difficulty > 0 && difficulty < boardSize*boardSize-1){
    difficultyString = difficulty;
  }
  // Fetch board with only "keepCells" of numbers
    fetch(serverDomain+'new?keepCells='+difficultyString.toString())
    .then(response => response.json())
    .then(data => obj = data)
    .then(() => console.log(obj))
    waitForApiBoard()
    
    // So we abuse browser cache to do our bidding by preloading all the pictures of the numbers
    var i;
    for (i = 0; i < allowedInput.length; i++) {
      drawImageInCell(allowedInput[i]+".png", 0, 0, null, null);
    }
    document.getElementsByTagName("tr")[0].getElementsByTagName("td")[0].innerHTML = '';
    
}

// Creates a structure for the gameboard
function game(boardSize, boardSize) {
  board = createBoardArray(boardSize, boardSize);
  unedtiableBoard = createBoardArray(boardSize, boardSize);
  table = document.getElementById(gameBoardID);
  init(table);
}

// Create the board as array
function createBoardArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

// Initialize the board array
function init(table) {
  for (var y = 0; y < board.length; y++) {
    var tr = document.createElement("tr");
    table.appendChild(tr);
    for (var x = 0; x < board[y].length; x++) {
      var td = document.createElement("td");
      var txt = document.createTextNode(emptySpaceID);
      td.appendChild(txt);
      td.addEventListener("click", play.bind(null, y, x), false);
      tr.appendChild(td);
    }
  }
}

// Main user places number in cell logic
function play(y, x, event) {
  // Capture the keypresses
  document.onkeypress = function (e) {
    e || window.event;
    var pressed = String.fromCharCode(e.charCode);
    setMessage("", msg);
    console.log(pressed + " =" + x + ":" + y);
    // If clicked on empty cell
    if (unedtiableBoard[y][x] == 0) {
      // If inputted player and player doesn't exist
      if (allowedInput.includes(pressed)) {
        //drawTextInCell(pressed, y, x, null, null);
        drawImageInCell(pressed+".png", y, x, null, null)
        board[y][x] = parseInt(pressed);
      } else if(pressed == 0){
        board[y][x] = 0;
        document.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].innerText = "";
        document.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].innerHTML = "";
      } else {
        setMessage("Unrecognized character!", msg);
      }
      // Else the cell is already occupied.
    } else {
      if (allowedInput.includes(pressed) || pressed == 0){
        setMessage("This cell was pre-set and cannot be edited!", msg);
      }
    }
    }
}

// Used to draw Images in desired cell
function drawImageInCell(imageName, y, x, oldY, oldX) {
    document.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].innerHTML =
    '<img src="img/' + imageName +'" draggable="false" height="25" width="18">';
    if (oldY != null && oldX != null) {
      document.getElementsByTagName("tr")[oldY].getElementsByTagName("td")[oldX].innerText = emptySpaceID;
    }
  }

// Used to draw Text in desired cell
function drawTextInCell(value, y, x, oldY, oldX) {
  document.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].innerHTML =
  value;
  if (oldY != null && oldX != null) {
    document.getElementsByTagName("tr")[oldY].getElementsByTagName("td")[oldX].innerText = emptySpaceID;
  }
}

  // Encodes the board string into query friendly format.
  function encodeBoard(){
    var solutionEncoded = "";
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if(unedtiableBoard[i][j] == 0){
          solutionEncoded = solutionEncoded+".";
        }
        else{
          solutionEncoded = solutionEncoded+unedtiableBoard[i][j];
        }
      }
    }
    return(solutionEncoded)
  }
// setSolveBoard() sets the board to solved by asking the API for how to solve it.
  function setSolveBoard(){
    didnAskedForSolutions = false;
    /*

    // Debuging
    for (let i = 0; i < boardX; i++) {
      for (let j = 0; j < boardY; j++) {
        board[i][j] = 0
        unedtiableBoard[i][j] = 0
        drawTextInCell("", i, j, null, null);  
      }
    }*/
    
    // 1. encode puzzle
    stringToSend = encodeBoard();
    console.log(stringToSend);
    // 2. send it
    fetch(serverDomain+'solve?puzzle='+stringToSend)
    .then(response => response.json())
    .then(data => solvedBoardObj = data)
    .then(() => console.log(solvedBoardObj))
    

    // Checks whether the api gave the solved data.
    function isSolvedAPI(){
      if(typeof solvedBoardObj !== "undefined"){
        for (let i = 0; i < boardSize; i++) {
          for (let j = 0; j < boardSize; j++) {
              board[i][j] = solvedBoardObj['board'][i][j]
              unedtiableBoard[i][j] = solvedBoardObj['board'][i][j]
              drawTextInCell(solvedBoardObj['board'][i][j], i, j, null, null);  
              //setMessage("<button class=\"buttonPop\" onclick=\"location.reload();\">Next Puzzle?</button>", msg);
          }
          
        }
      }
      else{
          // Try again javascript loads it faster then network provides data
          setTimeout(isSolvedAPI, 250);
      }
      
    }
    // In function since the data takes forever to arrive..
    isSolvedAPI()
  }

  

/*
    First argument message, second argument is the element id used in html
    show message:
    setMessage("Example", msg);
    clear message:
    setMessage("", msg);
*/
function setMessage(message, messegeElementID) {
  messageBox = document.getElementById(messegeElementID);
  messageBox.innerHTML = message;
  messageBox.style.display = "block";
}