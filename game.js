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

// Current piece
let currentPiece = null;

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
            alert('Game Over');
            document.location.reload();
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
  for (let row = rows - 1; row >= 0; row--) {
    let complete = true;
    for (let col = 0; col < cols; col++) {
      if (!board[row][col]) {
        complete = false;
        break;
      }
    }
    if (complete) {
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
  }
});

// Game loop
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

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

function startGame() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  currentState = GAME_STATE.PLAYING;
  newPiece();
  lastTime = performance.now();
  update();
}

function pauseGame() {
  currentState = GAME_STATE.PAUSED;
  document.getElementById('pauseScreen').style.display = 'flex';
}

function resumeGame() {
  currentState = GAME_STATE.PLAYING;
  document.getElementById('pauseScreen').style.display = 'none';
  // Reset timing variables
  lastTime = performance.now();
  dropCounter = 0;
  update();
}

// Initialize the game (do not start yet)
drawBoard();