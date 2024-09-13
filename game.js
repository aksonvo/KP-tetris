const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Set the size of each grid cell
const grid = 30;
const rows = 20;
const cols = 10;

// Load product images
const images = {
  I: 'images/I.png',
  J: 'images/J.png',
  L: 'images/L.png',
  O: 'images/O.png',
  S: 'images/S.png',
  T: 'images/T.png',
  Z: 'images/Z.png',
};

// Tetromino shapes
const tetrominoes = {
  I: [[1, 1, 1, 1]],
  J: [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  L: [
    [1, 0],
    [1, 0],
    [1, 1],
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
    [1, 1, 1],
    [0, 1, 0],
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

// Current piece
let currentPiece = null;

// Function to create a new piece
function newPiece() {
  const pieces = 'IJLOSTZ';
  const random = pieces[Math.floor(Math.random() * pieces.length)];
  const shape = tetrominoes[random];
  currentPiece = {
    x: Math.floor(cols / 2) - Math.ceil(shape[0].length / 2),
    y: 0,
    shape: shape,
    image: new Image(),
  };
  currentPiece.image.src = images[random];
}

// Function to draw the board
function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col]) {
        context.drawImage(board[row][col], col * grid, row * grid, grid, grid);
      } else {
        context.clearRect(col * grid, row * grid, grid, grid);
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
            alert('Game Over');
            document.location.reload();
            return;
          }
          board[currentPiece.y + row][currentPiece.x + col] =
            currentPiece.image;
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
      row++;
    }
  }
}

// Rotate the piece
function rotatePiece() {
  const shape = currentPiece.shape;
  const N = shape.length;
  let newShape = [];
  for (let row = 0; row < N; row++) {
    newShape[row] = [];
    for (let col = 0; col < N; col++) {
      newShape[row][col] = shape[N - col - 1][row];
    }
  }
  if (!collision(currentPiece.x, currentPiece.y, newShape)) {
    currentPiece.shape = newShape;
  }
}

// Key controls
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 37) {
    // Left arrow
    if (!collision(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
      currentPiece.x--;
    }
  } else if (e.keyCode === 39) {
    // Right arrow
    if (!collision(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
      currentPiece.x++;
    }
  } else if (e.keyCode === 40) {
    // Down arrow
    moveDown();
  } else if (e.keyCode === 38) {
    // Up arrow
    rotatePiece();
  }
});

// Game loop
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
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

newPiece();
update();