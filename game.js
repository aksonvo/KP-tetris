const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const nextCanvas = document.getElementById('nextPieceCanvas');
const nextContext = nextCanvas.getContext('2d');

// Set the size of each grid cell
let grid = 30;
let rows = 20;
let cols = 10;

// Responsive design adjustments
function adjustCanvasSize() {
  if (window.innerWidth < 600) {
    grid = (window.innerWidth * 0.9) / cols;
    canvas.width = grid * cols;
    canvas.height = grid * rows;
  } else {
    grid = 30;
    canvas.width = grid * cols;
    canvas.height = grid * rows;
  }
}

window.addEventListener('resize', () => {
  adjustCanvasSize();
  drawBoard();
  drawPiece();
  drawNextPiece();
});

adjustCanvasSize();

// Load the pixel image once
const pixelImage = new Image();
pixelImage.src = 'images/pixel.png';

// Assign the same image to all tetrominoes
const images = {
  I: pixelImage,
  J: pixelImage,
  L: pixelImage,
  O: pixelImage,
  S: pixelImage,
  T: pixelImage,
  Z: pixelImage,
};

// Tetromino shapes
const tetrominoes = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};

// Game board
let board = [];
for (let row = 0; row < rows; row++) {
  board[row] = [];
  for (let col = 0; col < cols; col++) {
    board[row][col] = 0;
  }
}

// Game States
const GAME_STATE = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  OVER: 'over',
};

let currentState = GAME_STATE.START;

// Scoring variables
let score = 0;
const lineClearPoints = [0, 10, 20, 30, 40];

// Level variables
let level = 1;
const linesPerLevel = 5;
let linesClearedInLevel = 0;

// Timer variables
let startTime = null;
let elapsedTime = 0;
let timerInterval = null;

let currentPiece = null;
let nextPiece = null;
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;

let playerName = '';
let holdUsed = false;

// Function to create a new piece
function newPiece() {
  if (!nextPiece) {
    nextPiece = createRandomPiece();
  }
  currentPiece = nextPiece;
  currentPiece.x = Math.floor(cols / 2) - Math.ceil(currentPiece.shape[0].length / 2);
  currentPiece.y = -1;
  nextPiece = createRandomPiece();
}

// Function to create a random piece
function createRandomPiece() {
  const pieces = 'IJLOSTZ';
  const random = pieces[Math.floor(Math.random() * pieces.length)];
  const shape = tetrominoes[random];
  return {
    x: 0,
    y: 0,
    shape: shape,
    image: images[random],
  };
}

// Function to draw the board
function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col]) {
        context.drawImage(board[row][col], col * grid, row * grid, grid, grid);
      }
    }
  }
}

// Function to draw the current piece
function drawPiece() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        context.drawImage(
          currentPiece.image,
          (currentPiece.x + col) * grid,
          (currentPiece.y + row) * grid,
          grid,
          grid
        );
      }
    }
  }
  drawGhostPiece();
}

// Function to draw the next piece
function drawNextPiece() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const scale = grid / 2;
  for (let row = 0; row < nextPiece.shape.length; row++) {
    for (let col = 0; col < nextPiece.shape[row].length; col++) {
      if (nextPiece.shape[row][col]) {
        nextContext.drawImage(
          nextPiece.image,
          col * scale + 20,
          row * scale + 20,
          scale,
          scale
        );
      }
    }
  }
}

// Collision detection
function collision(x, y, shape) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        let newX = x + col;
        let newY = y + row;
        if (
          newX < 0 ||
          newX >= cols ||
          newY >= rows ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Move piece down
function moveDown() {
  if (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
    currentPiece.y++;
  } else {
    // Lock the piece and generate a new one
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          if (currentPiece.y + row < 0) {
            // Game over
            currentState = GAME_STATE.OVER;
            clearInterval(timerInterval); // Stop the timer
            showGameOverScreen();
            return;
          }
          board[currentPiece.y + row][currentPiece.x + col] = currentPiece.image;
        }
      }
    }
    clearLines();
    holdUsed = false; // Reset hold
    newPiece();
    updateLevel();
    drawNextPiece();
  }
}

// Clear completed lines
function clearLines() {
  let linesCleared = 0;
  for (let row = rows - 1; row >= 0; row--) {
    let complete = true;
    for (let col = 0; col < cols; col++) {
      if (!board[row][col]) {
        complete = false;
        break;
      }
    }
    if (complete) {
      linesCleared++;
      linesClearedInLevel++;
      for (let y = row; y > 0; y--) {
        for (let col = 0; col < cols; col++) {
          board[y][col] = board[y - 1][col];
        }
      }
      for (let col = 0; col < cols; col++) {
        board[0][col] = 0;
      }
      row++;
    }
  }
  if (linesCleared > 0) {
    // Update the score
    score += lineClearPoints[linesCleared];
    updateScoreDisplay();
  }
}

// Update score display
function updateScoreDisplay() {
  document.getElementById('score').textContent = score;
}

// Update level display
function updateLevelDisplay() {
  document.getElementById('level').textContent = level;
}

// Update time display
function updateTimeDisplay() {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById('time').textContent = `${minutes}:${seconds}`;
}

// Rotate the piece
function rotatePiece() {
  const shape = currentPiece.shape;
  // Transpose the shape
  const transposedShape = shape[0].map((_, colIndex) =>
    shape.map(row => row[colIndex])
  );
  // Reverse each row to get the rotated shape
  const rotatedShape = transposedShape.map(row => row.reverse());

  if (!collision(currentPiece.x, currentPiece.y, rotatedShape)) {
    currentPiece.shape = rotatedShape;
  }
}

// Update level based on lines cleared
function updateLevel() {
  if (linesClearedInLevel >= linesPerLevel) {
    level++;
    linesClearedInLevel = 0;
    dropInterval = Math.max(100, dropInterval - 100); // Increase speed
    updateLevelDisplay();
  }
}

// Draw ghost piece
function drawGhostPiece() {
  let ghostY = currentPiece.y;
  while (!collision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
    ghostY++;
  }
  context.globalAlpha = 0.3;
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        context.drawImage(
          currentPiece.image,
          (currentPiece.x + col) * grid,
          (ghostY + row) * grid,
          grid,
          grid
        );
      }
    }
  }
  context.globalAlpha = 1;
}

// Key controls
document.addEventListener('keydown', (e) => {
  if (currentState === GAME_STATE.START) {
    if (e.code === 'Space') {
      // Start the game
      startGame();
    }
  } else if (currentState === GAME_STATE.PLAYING) {
    if (e.code === 'Escape') {
      // Pause the game
      pauseGame();
    } else if (e.code === 'ArrowLeft') {
      // Left arrow
      if (!collision(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x--;
      }
    } else if (e.code === 'ArrowRight') {
      // Right arrow
      if (!collision(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x++;
      }
    } else if (e.code === 'ArrowDown') {
      // Soft drop
      moveDown();
    } else if (e.code === 'ArrowUp') {
      // Rotate
      rotatePiece();
    } else if (e.code === 'Space') {
      // Hard drop
      while (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
      }
      moveDown();
    }
  } else if (currentState === GAME_STATE.PAUSED) {
    if (e.code === 'Escape') {
      // Resume the game
      resumeGame();
    }
  } else if (currentState === GAME_STATE.OVER) {
    if (e.code === 'Enter') {
      // Restart the game
      restartGame();
    }
  }
});

// Add event listeners for pause menu buttons
document.getElementById('resumeButton').addEventListener('click', resumeGame);
document.getElementById('restartButton').addEventListener('click', restartGame);
document.getElementById('mainMenuButton').addEventListener('click', returnToMainMenu);

// Add event listener for pause button (for mobile devices)
document.getElementById('pauseButton').addEventListener('click', pauseGame);

// Touch controls for mobile devices
let touchStartX = null;
let touchStartY = null;
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(evt) {
  const firstTouch = evt.touches[0];
  touchStartX = firstTouch.clientX;
  touchStartY = firstTouch.clientY;
  evt.preventDefault();
}

function handleTouchMove(evt) {
  if (!touchStartX || !touchStartY) {
    return;
  }

  let touchEndX = evt.touches[0].clientX;
  let touchEndY = evt.touches[0].clientY;

  let diffX = touchEndX - touchStartX;
  let diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > 10) {
      // Swipe right
      if (!collision(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x++;
      }
    } else if (diffX < -10) {
      // Swipe left
      if (!collision(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x--;
      }
    }
  } else {
    // Vertical swipe
    if (diffY > 10) {
      // Swipe down (soft drop)
      moveDown();
    } else if (diffY < -10) {
      // Swipe up (rotate)
      rotatePiece();
    }
  }

  touchStartX = null;
  touchStartY = null;
  evt.preventDefault();
}

function startGame() {
  const playerNameInput = document.getElementById('playerName');
  playerName = playerNameInput.value.trim() || 'Player'; // Default to 'Player' if name is empty

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'flex';
  document.getElementById('gameHeader').style.display = 'flex';

  currentState = GAME_STATE.PLAYING;
  score = 0;
  level = 1;
  linesClearedInLevel = 0;
  dropInterval = 1000;
  updateScoreDisplay();
  updateLevelDisplay();
  newPiece();
  lastTime = performance.now();
  startTime = performance.now();
  timerInterval = setInterval(() => {
    elapsedTime = performance.now() - startTime;
    updateTimeDisplay();
  }, 1000);
  update();
}

function pauseGame() {
  if (currentState !== GAME_STATE.PLAYING) return;
  currentState = GAME_STATE.PAUSED;
  document.getElementById('pauseScreen').style.display = 'flex';
  clearInterval(timerInterval); // Stop the timer
}

function resumeGame() {
  if (currentState !== GAME_STATE.PAUSED) return;
  currentState = GAME_STATE.PLAYING;
  document.getElementById('pauseScreen').style.display = 'none';
  // Adjust the startTime to account for the paused duration
  startTime += performance.now() - lastTime;
  lastTime = performance.now();
  // Restart the timer
  timerInterval = setInterval(() => {
    elapsedTime = performance.now() - startTime;
    updateTimeDisplay();
  }, 1000);
  update(); // Resume the game loop
}

function returnToMainMenu() {
  currentState = GAME_STATE.START;
  clearInterval(timerInterval);
  elapsedTime = 0;
  score = 0;
  level = 1;
  linesClearedInLevel = 0;
  document.getElementById('pauseScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('gameHeader').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartGameOverButton').addEventListener('click', restartGame);

function showGameOverScreen() {
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('gameHeader').style.display = 'none';
  document.getElementById('gameOverScreen').style.display = 'flex';

  // Format the elapsed time
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const finalTime = `${minutes}:${seconds}`;

  // Display the final message
  const finalMessage = document.getElementById('finalMessage');
  finalMessage.innerHTML = `
    <p>${playerName}, you procrastinated for ${finalTime} with collecting ${score} modules!</p>
    <p>KraftPowercon. We won't let you bore down!</p>
  `;

  // Update high score table
  updateHighScores(playerName, finalTime);
}

function restartGame() {
  // Reset game variables
  board = [];
  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      board[row][col] = 0;
    }
  }

  currentState = GAME_STATE.PLAYING;
  elapsedTime = 0;
  score = 0;
  level = 1;
  linesClearedInLevel = 0;
  dropInterval = 1000;
  updateScoreDisplay();
  updateLevelDisplay();
  document.getElementById('gameOverScreen').style.display = 'none';
  document.getElementById('highScoreTable').style.display = 'none';
  document.getElementById('pauseScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'flex';
  document.getElementById('gameHeader').style.display = 'flex';

  newPiece();
  lastTime = performance.now();
  startTime = performance.now();
  timerInterval = setInterval(() => {
    elapsedTime = performance.now() - startTime;
    updateTimeDisplay();
  }, 1000);
  update();
}

function updateHighScores(name, time) {
  // Retrieve high scores from localStorage
  let highScores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];

  // Convert time to seconds for sorting
  const [minutes, seconds] = time.split(':').map(Number);
  const totalSeconds = minutes * 60 + seconds;

  // Add new score
  highScores.push({ name, time, totalSeconds });

  // Sort high scores by totalSeconds in descending order (longer times first)
  highScores.sort((a, b) => b.totalSeconds - a.totalSeconds);

  // Keep only top 5 scores
  highScores = highScores.slice(0, 5);

  // Save back to localStorage
  localStorage.setItem('tetrisHighScores', JSON.stringify(highScores));

  // Display high scores
  displayHighScores(highScores);
}

function displayHighScores(highScores) {
  const highScoresBody = document.getElementById('highScoresBody');
  highScoresBody.innerHTML = ''; // Clear existing rows

  highScores.forEach((entry, index) => {
    const row = document.createElement('tr');
    const rankCell = document.createElement('td');
    const nameCell = document.createElement('td');
    const timeCell = document.createElement('td');

    rankCell.textContent = index + 1;
    nameCell.textContent = entry.name;
    timeCell.textContent = entry.time;

    row.appendChild(rankCell);
    row.appendChild(nameCell);
    row.appendChild(timeCell);

    highScoresBody.appendChild(row);
  });

  // Show the high score table
  document.getElementById('highScoreTable').style.display = 'block';
}

// Game loop
function update(time = 0) {
  if (currentState !== GAME_STATE.PLAYING) {
    return; // Exit the game loop if not playing
  }

  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    moveDown();
    dropCounter = 0;
  }
  drawBoard();
  drawPiece();
  requestAnimationFrame(update);
}

// Initialize the game (do not start yet)
document.getElementById('gameHeader').style.display = 'none';
drawBoard();