const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Set the size of each grid cell
const grid = 30;
const rows = 20;
const cols = 10;

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
const lineClearPoints = [0, 100, 300, 500, 800];

// Timer variables
let startTime = null;
let elapsedTime = 0;
let timerInterval = null;

let currentPiece = null;
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;

let playerName = '';

// Function to create a new piece
function newPiece() {
  const pieces = 'IJLOSTZ';
  const random = pieces[Math.floor(Math.random() * pieces.length)];
  const shape = tetrominoes[random];
  currentPiece = {
    x: Math.floor(cols / 2) - Math.ceil(shape[0].length / 2),
    y: -1, // Start above the board
    shape: shape,
    image: images[random], // Use the preloaded pixel image
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
    newPiece();
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

// Key controls
document.addEventListener('keydown', (e) => {
  if (currentState === GAME_STATE.START) {
    if (e.code === 'Space') {
      // Start the game
      startGame();
    }
  } else if (currentState === GAME_STATE.PLAYING) {
    if (e.code === 'Space') {
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
      // Down arrow
      moveDown();
    } else if (e.code === 'ArrowUp') {
      // Up arrow
      rotatePiece();
    }
  } else if (currentState === GAME_STATE.PAUSED) {
    if (e.code === 'Space') {
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

function startGame() {
  const playerNameInput = document.getElementById('playerName');
  playerName = playerNameInput.value.trim() || 'Player'; // Default to 'Player' if name is empty

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  document.getElementById('gameHeader').style.display = 'flex';

  currentState = GAME_STATE.PLAYING;
  score = 0;
  updateScoreDisplay();
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
  currentState = GAME_STATE.PAUSED;
  document.getElementById('pauseScreen').style.display = 'flex';
  clearInterval(timerInterval);
}

function resumeGame() {
  currentState = GAME_STATE.PLAYING;
  document.getElementById('pauseScreen').style.display = 'none';
  // Adjust the startTime to account for the paused duration
  startTime += performance.now() - lastTime;
  lastTime = performance.now();
  timerInterval = setInterval(() => {
    elapsedTime = performance.now() - startTime;
    updateTimeDisplay();
  }, 1000);
  update();
}

function showGameOverScreen() {
  document.getElementById('gameCanvas').style.display = 'none';
  document.getElementById('gameHeader').style.display = 'none';
  document.getElementById('gameOverScreen').style.display = 'flex';

  // Format the elapsed time
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const finalTime = `${minutes}:${seconds}`;

  // Display the final message
  const finalMessage = document.getElementById('finalMessage');
  finalMessage.textContent = `${playerName}, you survived for ${finalTime} with a score of ${score}!`;

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

  currentState = GAME_STATE.START;
  elapsedTime = 0;
  score = 0;

  // Hide game over and high score screens, show start screen
  document.getElementById('gameOverScreen').style.display = 'none';
  document.getElementById('highScoreTable').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
}

function updateTimeDisplay() {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById('time').textContent = `${minutes}:${seconds}`;
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