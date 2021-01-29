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
    x: 30,
    y: 16,
    bombs: 99
  }
}

const GAME = {
  buttons: [],
  bombsPosition: [],
  bombsToFind: 0,
  blocksToRemove: 0
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
const getRandomNumbersFromRange = (a, b, count) => {
  let numbersTable = [];
  let drawnNumbers = [];
  for (let i = a; i <= b; i++) {
    numbersTable.push(i);
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
  // TODO: Sprawdzenie poprawności wpisanych pól
  createGame(x, y, bombs);
}

const createGame = (xSize, ySize, bombsCount) => {
  boardBox.innerHTML = '';
  delete GAME.buttons;
  delete GAME.bombsPosition;
  GAME.buttons = [];
  GAME.bombsPosition = [];
  delete GAME.lost;
  
  GAME.bombsToFind = bombsCount;
  statsBombsToFind.innerHTML = bombsCount;
  statsBombs.innerHTML = bombsCount;

  GAME.blocksToRemove = xSize * ySize - bombsCount;
  statsFieldsToReveal.innerHTML = GAME.blocksToRemove;
  statsFields.innerHTML = GAME.blocksToRemove;
  
  let i = 1;
  let bombPositions = getRandomNumbersFromRange(1, xSize * ySize, bombsCount);
  for (let y = 1; y <= ySize; y++) {
    for (let x = 1; x <= xSize; x++) {
      let isBomb = bombPositions.find(pos => pos == i) ? true : false;
      let func = '';
      //let element = document.createElement('button');
      //element.id = `${x}|${y}`;
      //element.className = 'boardButton';
      //boardBox.appendChild(element);
      if (isBomb) {
        func = `lostGame(${x}, ${y})`;
        GAME.bombsPosition.push({x: x, y: y, id: i}); 
      } else {
        func = `clickOn(${x}, ${y})`;
      }
      boardBox.innerHTML += `<button id='${x}|${y}' class='boardButton' oncontextmenu='setFlag(${x}, ${y});return false' onclick='${func}'><span>&nbsp</span></button>`;
      //if (isBomb) document.getElementById(`${x}|${y}`).style['box-shadow'] = 'inset 0 0 6px red';
      GAME.buttons.push({
        id: i,
        x: x,
        y: y,
        isClicked: false,
        isBomb: isBomb
      });
      i++;
    }
    boardBox.innerHTML += '<br>';
  }
  let possibleStarts = [];
  for (let y = 1; y <= ySize; y++) {
    for (let x = 1; x <= xSize; x++) {
      if (getBombsNextToButton(x, y) == 0 && !GAME.bombsPosition.find(bp => bp.x == x && bp.y == y)) {
        possibleStarts.push({x: x, y: y});
      }
    }
  }
  let randomPossibleStart = possibleStarts[getRandomNumber(0, possibleStarts.length - 1)];
  clickOn(randomPossibleStart.x, randomPossibleStart.y);
}

const clickOn = (x, y, nextClick) => {
  if (GAME.lost) return;

  let bttn = getButtonByPosition(x, y);
  if (!bttn) return;
  if (bttn.innerHTML == '🚩') return;
  if (bttn.className.search('clicked') != -1) return;
  GAME.blocksToRemove--;
  statsFieldsToReveal.innerHTML = GAME.blocksToRemove;
  bttn.className += ' clicked';
  let bombsCount = getBombsNextToButton(x, y);
  if (bombsCount != 0) {
    bttn.innerHTML = colourNumber(bombsCount);
    return;
  }
  if (nextClick) return;

  /*if (getButtonByPosition(x - 1, y)) clickOn(x - 1, y);
  if (getButtonByPosition(x + 1, y)) clickOn(x + 1, y);
  if (getButtonByPosition(x, y - 1)) clickOn(x, y - 1);
  if (getButtonByPosition(x, y + 1)) clickOn(x, y + 1);

  if (!(getBombsNextToButton(x - 1, y) && getBombsNextToButton(x, y - 1))) {
    if (getButtonByPosition(x - 1, y - 1)) clickOn(x - 1, y - 1); // L T
  } else {
    if (getButtonByPosition(x - 1, y - 1)) clickOn(x - 1, y - 1, true); // L T
  }
  if (!(getBombsNextToButton(x - 1, y) && getBombsNextToButton(x, y + 1))) {
    if (getButtonByPosition(x - 1, y + 1)) clickOn(x - 1, y + 1); // L B
  } else {
    if (getButtonByPosition(x - 1, y + 1)) clickOn(x - 1, y + 1, true); // L B
  }
  if (!(getBombsNextToButton(x + 1, y) && getBombsNextToButton(x, y - 1))) {
    if (getButtonByPosition(x + 1, y - 1)) clickOn(x + 1, y - 1); // R T
  } else {
    if (getButtonByPosition(x + 1, y - 1)) clickOn(x + 1, y - 1, true); // R T
  }
  if (!(getBombsNextToButton(x + 1, y) && getBombsNextToButton(x, y + 1))) {
    if (getButtonByPosition(x + 1, y + 1)) clickOn(x + 1, y + 1, true); // R T
  } else {
    if (getButtonByPosition(x + 1, y + 1)) clickOn(x + 1, y + 1, true); // R T
  }*/

  for (let y2 = y - 1; y2 <= y + 1; y2++) {
    for (let x2 = x - 1; x2 <= x + 1; x2++) {
      if (getButtonByPosition(x2, y2)) {
        clickOn(x2, y2);
      }
    }
  }
}

const setFlag = (x, y) => {
  if (GAME.lost) return;
  let bttn = getButtonByPosition(x, y);
  if (bttn.className.search('clicked') != -1) return;
  if (bttn.innerHTML == '🚩') {
    bttn.innerHTML = '<span>&nbsp</span>'
    GAME.bombsToFind++;
  } else {
    bttn.innerHTML = '🚩'
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
    number = `<span style='color: blue'>${number}</span>`;
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
  if (getButtonByPosition(x, y).innerHTML == '🚩') return;
  GAME.lost = true;
  console.log('przegrana');
  for (let i in GAME.bombsPosition) {
    let bp = GAME.bombsPosition[i];
    getButtonByPosition(bp.x, bp.y).innerHTML = '<span style="font-size: 14px">💣</span>';
  }
}

createGame(9, 9, 10);