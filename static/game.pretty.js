/*
    Assingment by Michal Anisimow SID: 201362335
    In this assingment I've decided not to use classes as IE11 doesn't support them as described below:
    https://kangax.github.io/compat-table/es6/
*/ 
//Default variable names
gameBoardID = "gameBoard";
var userEntity = "Submarine";
var playerID = "U", enemyID = "K", obstacleID = "O", emptySpaceID = " ",pointID="5";
var allowedInput = [0,1,2,3,4,5,6,7,8,9];

var stage = "setup";
var stage0 = "setup",stage1 = "play", stage2 = "end";

var playerX, playerY;
var enemies = new Array();
var obstacles = new Array();
var points = new Array();
var isObstacle = false;
var isEnemy = false;
var boardY = 9,
  boardX = 9;
var currentRound = 0;
var msg = "messageBox";
var msgEnd = "theEndMessageH1";
var tmpYX;
var board,unedtiableBoard,table,distanceFromPointY,distanceFromPointX,movePlayer,tmpPlayerX
,tmpPlayerY,messageBox;
var obj,obj1,isValidBoard,validityCheck,didnAskedForSolutions = true;

//structure the gameboard
game(boardY, boardX);
newBoard(40)

function waitForApiBoard(){
  if(typeof obj !== "undefined"){
    for (let i = 0; i < boardX; i++) {
      for (let j = 0; j < boardY; j++) {
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

function isBoardValidAPICheck() {
  stringToSend = enocdePuzzle();
  fetch('http://127.0.0.1:5000/valid?puzzle='+stringToSend)
    .then(response => response.json())
    .then(data => isValidBoard = data)
    .then(() => console.log(isValidBoard))
    function waitForAPIValidCheck(){
      if(typeof isValidBoard !== "undefined"){
        if(isValidBoard['isValid'] == true && didnAskedForSolutions == true){
          setMessage("Congratulations! You have solved the challenge", msg);
        } if(isValidBoard['isValid'] == true && didnAskedForSolutions == false){
          setMessage("You will always be a winner in my heart. :P  <button onclick=\"location.reload();\">Next Puzzle?</button>", msg);
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

function clearBoard(){
    for (let i = 0; i < boardX; i++) {
      for (let j = 0; j < boardY; j++) {
        board[i][j] = 0;
        //drawTextInCell("", i, j, null, null)
        document.getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerText = emptySpaceID;

      }
    }
  }


function newBoard(difficulty) {
  clearBoard();
  var difficultyString = 40;
  if(difficulty != null && difficulty > 0 && difficulty < boardX*boardY-1){
    difficultyString = difficulty;
  }
    fetch('http://127.0.0.1:5000/new?keepCells='+difficultyString.toString())
    .then(response => response.json())
    .then(data => obj = data)
    .then(() => console.log(obj))
    waitForApiBoard()
}

function game(boardY, boardX) {
  board = createBoardArray(boardY, boardX);
  unedtiableBoard = createBoardArray(boardY, boardX);
  table = document.getElementById(gameBoardID);
  init(table);
}

//create the board as array
function createBoardArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

//initialize the board array
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


function play(y, x, event) {
  //capture the keypresses
  document.onkeypress = function (e) {
    e || window.event;
    var pressed = String.fromCharCode(e.charCode);
    setMessage("", msg);
    console.log(pressed + " =" + x + ":" + y);
    //if still in setup
    if (stage == stage0) {
      //if clicked on empty cell
      if (unedtiableBoard[y][x] == 0) {
        //if inputted player and player doesn't exist
        if (pressed == "1" || pressed == "2" || pressed == "3" || pressed == "4" || pressed == "5" || pressed == "6" || pressed == "7" || pressed == "8" || pressed == "9") {
          //drawTextInCell(pressed, y, x, null, null);
          drawImageInCell(pressed+".png", y, x, null, null)
          board[y][x] = pressed;
        } else {
          setMessage("Unrecognized character!", msg);
        }
        //else the cell is already occupied.
      } else {
        if (pressed == "1" || pressed == "2" || pressed == "3" || pressed == "4" || pressed == "5" || pressed == "6" || pressed == "7" || pressed == "8" || pressed == "9"){
          setMessage("This cell was pre-set and cannot be edited!", msg);
        }
        
        
        //setMessage("That cell is already occupied!", msg);
      }
      //if "play" stage and one player is alive
    } else if (stage == stage1 && playersCount == 1) {
      userMove(pressed);
      showStatistics(true);
    }
  };
}

//end() was clicked by the user
function end(){
  if(stage==stage1){
    stage = stage2;
    totalPoints = userPointsCount+enemyPointsCount;
    pointsCheck();  
  } 
}

//push new element used in user input of the elements
function pushNewElement(type,entity,pressed,y,x){
  entity.push([y, x]);
  board[y][x] = pressed;
  var pictureType;
  if ((type == "0" || type == "1" || type == "2" || type == "3" || type == "4" || type == "5" || type == "6" || type == "7" || type == "8" || type == "9")) {
    pictureType = "obstacle.png";
  } 
  drawImageInCell(pictureType, y, x, null, null);

}

function drawImageInCell(imageName, y, x, oldY, oldX) {
    document.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].innerHTML =
    '<img src="img/' + imageName +'" draggable="false" height="32" width="32">';
    if (oldY != null && oldX != null) {
      document.getElementsByTagName("tr")[oldY].getElementsByTagName("td")[oldX].innerText = emptySpaceID;
    }
  }

function drawTextInCell(value, y, x, oldY, oldX) {
  document.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].innerHTML =
  value;
  if (oldY != null && oldX != null) {
    document.getElementsByTagName("tr")[oldY].getElementsByTagName("td")[oldX].innerText = emptySpaceID;
  }
}

//show statistics (left header side of the game.html)
function showStatistics(show) {
  if (show == true) {
    setMessage(
      "Round: " +
        currentRound +
        "<br>User Score: " +
        userPointsCount +
        "/" +
        totalPoints +
        "<br>Enemy Score:" +
        enemyPointsCount +
        "/" +
        totalPoints +
        "<br>Fuel: " +
        currentFuel +
        "<br>Enemies: " +
        enemiesCount +
        "<br>" +
        "Obstacles: " +
        obstaclesCount,
      "liveStatistics"
    );
  } else {
    setMessage("", "liveStatistics");
  }
}

  function enocdePuzzle(){
    var solutionEncoded = "";
    for (let i = 0; i < boardX; i++) {
      for (let j = 0; j < boardY; j++) {
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

  function findSolutions(){
    didnAskedForSolutions = false;
    /*
    for (let i = 0; i < boardX; i++) {
      for (let j = 0; j < boardY; j++) {
        board[i][j] = 0
        unedtiableBoard[i][j] = 0
        drawTextInCell("", i, j, null, null);  
      }
    }*/
    stringToSend = enocdePuzzle();
    console.log(stringToSend);
    fetch('http://127.0.0.1:5000/solve?puzzle='+stringToSend)
    .then(response => response.json())
    .then(data => obj1 = data)
    .then(() => console.log(obj1))
    function waitForApiCallBack(){
      if(typeof obj1 !== "undefined"){
        for (let i = 0; i < boardX; i++) {
          for (let j = 0; j < boardY; j++) {
              board[i][j] = obj1['board'][i][j]
              unedtiableBoard[i][j] = obj1['board'][i][j]
              drawTextInCell(obj1['board'][i][j], i, j, null, null);  
          }
          
        }
      }
      else{
          setTimeout(waitForApiCallBack, 250);
      }
      
    }
    waitForApiCallBack()
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