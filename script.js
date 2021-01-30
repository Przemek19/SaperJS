const startGameButton = document.getElementById('startGameButton');
const boardBox = document.getElementById('boardBox');
const xInput = document.getElementById('x');
const yInput = document.getElementById('y');
const bombsInput = document.getElementById('bombsCount');

//Stats
const statsBombsToFind = document.getElementById('statsBombsToFind');
const statsBombs = document.getElementById('statsBombs');
const statsFieldsToReveal = document.getElementById('statsFieldsToReveal');
const statsFields = document.getElementById('statsFields');
const statsTime = document.getElementById('statsTime');
// / //

const difficulty = {
  easy: {
    x: 9,
    y: 9,
    bombs: 10,
  },
  medium: {
    x: 16,
    y: 16,
    bombs: 40
  },
  hard: {
    x: 24,
    y: 20,
    bombs: 99
  },
  'hard+': {
    x: 50,
    y: 50,
    bombs: 500
  },
  impossible: {
    x: 100,
    y: 100,
    bombs: 2000
  }
}
xInput.value = difficulty.easy.x;
yInput.value = difficulty.easy.y;
bombsInput.value = difficulty.easy.bombs;

const GAME = {
  x: 0,
  y: 0,
  buttons: [],
  bombsPosition: [],
  bombsToFind: 0,
  blocksToRemove: 0,
  time: 0,
  timer: undefined
};

for (let i in difficulty) {
  document.getElementById(`${i}ModeButton`).onclick = () => {
    xInput.value = difficulty[i].x;
    yInput.value = difficulty[i].y;
    bombsInput.value = difficulty[i].bombs;
  }
}

const getRandomNumber = (a, b) => {
  return Math.floor(Math.random() * (b - a + 1) + a);
}
const getRandomNumbersFromRange = (a, b, count, excludedNumbers = []) => {
  let numbersTable = [];
  let drawnNumbers = [];
  for (let i = a; i <= b; i++) {
    if (!excludedNumbers.find(eN => eN == i)) numbersTable.push(i);
  }
  for (let i = 0; i < count; i++) {
    let randomIndex = getRandomNumber(0, numbersTable.length - 1);
    drawnNumbers.push(numbersTable[randomIndex]);
    numbersTable.splice(randomIndex, 1);
  }
  return drawnNumbers;
}

startGameButton.onclick = () => {
  let x = xInput.value;
  let y = yInput.value;
  let bombs = bombsInput.value;
  if (x < 1) {
    alert("You need to set/increase bombfield size!");
    return false;
  } 
  if (y < 1) {
    alert("You need to set/increase bombfield size!");
    return false;
  }
  if (x * y <= bombs) {
    alert("Too many bombs! Try reducing the amount of bombs or increasing the bombfield size.");
    return false;
  }
  if (bombs < 1) {
    alert("You need more bombs!");
    return false;
  }
  createGame(x, y, bombs);
}

const convertPositionToID = (xPos, yPos, xSize, ySize) => {
  let i = 1;
  for (let y = 1; y <= ySize; y++) {
    for (let x = 1; x <= xSize; x++) {
      if (x == xPos && y == yPos) {
        return i;
      }
      i++;
    }
  }
}

const createGame = (xSize, ySize, bombsCount, safeStartPointX, safeStartPointY) => {
  restartTimer();
  let safeCoords = [];
  stopTimer();
  GAME.isNewGame = true;
  if (safeStartPointX && safeStartPointY) {
    for (let y = safeStartPointY - 1; y <= safeStartPointY + 1; y++) {
      for (let x = safeStartPointX - 1; x <= safeStartPointX + 1; x++) {
        if (x > 0 && y > 0) {
          safeCoords.push(convertPositionToID(x, y, xSize, ySize));
        }
      }
    }
  }
  boardBox.innerHTML = '';
  boardBox.style.width = `${xSize * 32}px`;
  delete GAME.buttons;
  delete GAME.bombsPosition;
  GAME.buttons = [];
  GAME.bombsPosition = [];
  delete GAME.end;
  GAME.x = xSize;
  GAME.y = ySize;
  
  GAME.bombsToFind = bombsCount;
  statsBombsToFind.innerHTML = bombsCount;
  statsBombs.innerHTML = bombsCount;

  GAME.blocksToRemove = xSize * ySize - bombsCount;
  statsFieldsToReveal.innerHTML = GAME.blocksToRemove;
  statsFields.innerHTML = GAME.blocksToRemove;
  
  let i = 1;
  let bombPositions = getRandomNumbersFromRange(1, xSize * ySize, bombsCount, safeCoords);
  let bombsHTMLCode = '';
  for (let y = 1; y <= ySize; y++) {
    for (let x = 1; x <= xSize; x++) {
      let isBomb = false;
      if (safeStartPointX) {
        isBomb = bombPositions.find(pos => pos == i) ? true : false;
      }
      let func = '';
      if (isBomb) {
        func = `lostGame(${x}, ${y});`;
        GAME.bombsPosition.push({x: x, y: y, id: i}); 
      } else {
        func = `clickOn(${x}, ${y})`;
      }
      bombsHTMLCode += `<button id='${x}|${y}' class='boardButton' oncontextmenu='setFlag(${x}, ${y});return false' onclick='${func}'><span>&nbsp</span></button>`;
      GAME.buttons.push({
        x: x,
        y: y,
      });
      i++;
    }
    boardBox.innerHTML += '<br>';
  }
  boardBox.innerHTML = bombsHTMLCode;
  if (safeStartPointX && safeStartPointY) {
    GAME.isNewGame = false;
    clickOn(safeStartPointX, safeStartPointY);
    setTimer();
  }
}

const setTimer = () => {
  GAME.time = 0;
  clearInterval(GAME.timer);
  GAME.timer = setInterval(() => {
    GAME.time++;
    statsTime.innerHTML = GAME.time;
  }, 1000);
}
const restartTimer = () => {
  GAME.time = 0;
  clearInterval(GAME.timer);
  statsTime.innerHTML = 0;
}
const stopTimer = () => {
  clearInterval(GAME.timer);
}

const clickOn = (x, y, nextClick) => {
  if (GAME.end) return;

  if (GAME.isNewGame) {
    createGame(GAME.x, GAME.y, GAME.bombsToFind, x, y);
    return;
  }

  let bttn = getButtonByPosition(x, y);
  if (!bttn) return;
  if (bttn.innerHTML.search('🚩') != -1) return;
  if (bttn.className.search('clicked') != -1) return;
  GAME.blocksToRemove--;
  statsFieldsToReveal.innerHTML = GAME.blocksToRemove;
  bttn.className += ' clicked';
  let bombsCount = getBombsNextToButton(x, y);
  GAME.isNewGame = false;
  if (GAME.blocksToRemove == 0) {
    alert("You've won!");
    GAME.end = true;
    stopTimer();
    return;
  }
  if (bombsCount != 0) {
    bttn.innerHTML = colourNumber(bombsCount);
    return;
  }
  if (nextClick) return;

  for (let y2 = y - 1; y2 <= y + 1; y2++) {
    for (let x2 = x - 1; x2 <= x + 1; x2++) {
      if (getButtonByPosition(x2, y2)) {
        document.getElementById(`${x2}|${y2}`).click();
      }
    }
  }
}

const setFlag = (x, y) => {
  if (GAME.end) return;
  let bttn = getButtonByPosition(x, y);
  if (bttn.className.search('clicked') != -1) return;
  if (bttn.innerHTML.search('🚩') != -1) {
    bttn.innerHTML = '<span>&nbsp</span>';
    GAME.bombsToFind++;
  } else {
    bttn.innerHTML = '<span class="emoji">🚩</span>';
    GAME.bombsToFind--;
  }
  statsBombsToFind.innerHTML = GAME.bombsToFind;
}

const getButtonByPosition = (x, y) => {
  return document.getElementById(`${x}|${y}`);
}
const getBombsNextToButton = (xPosition, yPosition) => {
  let bombsCount = 0;
  for (let y = yPosition - 1; y <= yPosition + 1; y++) {
    for (let x = xPosition - 1; x <= xPosition + 1; x++) {
      if (GAME.bombsPosition.find(bttn => bttn.x == x && bttn.y == y) ? true : false) {
        if (!(x == xPosition && y == yPosition)) bombsCount++;
      }
    }
  }
  return bombsCount;
}

const colourNumber = number => {
  if (number == 1) {
    number = `<span style='color: blue;'>${number}</span>`;
  } else if (number == 2) {
    number = `<span style='color: green'>${number}</span>`;
  } else if (number == 3) {
    number = `<span style='color: red'>${number}</span>`;
  } else if (number == 4) {
    number = `<span style='color: #0FF'>${number}</span>`;
  } else if (number == 5) {
    number = `<span style='color: #F80'>${number}</span>`;
  } else if (number == 6) {
    number = `<span style='color: #000'>${number}</span>`;
  } else if (number == 7) {
    number = `<span style='color: #000'>${number}</span>`;
  } else if (number == 8) {
    number = `<span style='color: #000'>${number}</span>`;
  }
  return number;
}

const lostGame = (x, y) => {
  if (GAME.isNewGame) {
    createGame(GAME.x, GAME.y, GAME.bombsToFind, x, y);
    return;
  }
  if (getButtonByPosition(x, y).innerHTML.search('🚩') != -1) return;
  GAME.end = true;
  stopTimer();
  console.log('lost');
  for (let i in GAME.bombsPosition) {
    let bp = GAME.bombsPosition[i];
    getButtonByPosition(bp.x, bp.y).innerHTML = '<span class="emoji">💣</span>';
  }
}

createGame(9, 9, 10);

