# Kraft Tetris Game

Welcome to **Kraft Tetris**, a modern take on the classic Tetris game with additional features and responsive design for both desktop and mobile devices.

![Game Screenshot](images/screenshot.png)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [How to Run](#how-to-run)
- [Gameplay](#gameplay)
  - [Controls](#controls)
  - [Scoring](#scoring)
  - [Levels](#levels)
- [Responsive Design](#responsive-design)
- [High Scores](#high-scores)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **Responsive Design**: Play on any device, whether desktop or mobile.
- **Mobile Controls**: Swipe gestures for intuitive gameplay on touch devices.
- **Next Piece Preview**: See which tetromino is coming up next.
- **Soft and Hard Drops**: Control the speed at which pieces fall.
- **Pause Menu**: Pause the game and resume, restart, or return to the main menu.
- **Levels and Difficulty**: Progress through levels with increasing difficulty.
- **High Score Table**: Keep track of your best times and scores.
- **Custom Player Name**: Personalize your game by entering your name.

---

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/kraft-tetris-game.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd kraft-tetris-game
   ```

3. **Optional: Set Up a Local Server**

   It's recommended to use a local server to run the game smoothly.

   - Using Python 3:

     ```bash
     python -m http.server 8000
     ```

   - Using Node.js with `http-server`:

     ```bash
     npm install -g http-server
     http-server -p 8000
     ```

---

## How to Run

1. **Open `index.html`**

   - If using a local server, navigate to `http://localhost:8000` in your web browser.
   - If not using a server, you can open `index.html` directly in your browser, but some features might not work due to browser security restrictions.

2. **Start Playing**

   - Enter your name and click **"Start Game"** or press the **Spacebar**.

---

## Gameplay

### Controls

**Desktop Controls:**

- **Left Arrow (`←`)**: Move tetromino left
- **Right Arrow (`→`)**: Move tetromino right
- **Up Arrow (`↑`)**: Rotate tetromino
- **Down Arrow (`↓`)**: Soft drop (increase falling speed)
- **Spacebar**: Hard drop (instantly drop tetromino)
- **Escape (`Esc`)**: Pause/Resume game
- **Enter (`↵`)**: Restart game after game over

**Mobile Controls:**

- **Swipe Left**: Move tetromino left
- **Swipe Right**: Move tetromino right
- **Swipe Up**: Rotate tetromino
- **Swipe Down**: Soft drop
- **Tap "Pause" Button**: Pause the game

### Scoring

- **Line Clears:**

  - 1 Line: 10 points
  - 2 Lines: 20 points
  - 3 Lines: 30 points
  - 4 Lines: 40 points

- **Score Display:**

  - Your current score is displayed under **"Modules"** in the game header.

### Levels

- **Advancement:**

  - Level increases every 5 lines cleared.
  - Each new level increases the falling speed of tetrominoes.

- **Level Display:**

  - Current level is shown under **"Level"** in the game header.

---

## Responsive Design

- The game layout adjusts automatically to fit different screen sizes.
- On mobile devices:
  - The game canvas resizes to fit the viewport.
  - Controls are adapted for touch input.

---

## High Scores

- **Local Storage:**

  - The game stores high scores in your browser's local storage.

- **High Score Table:**

  - After a game over, your time and score are saved if they're among the top 5.
  - The high score table displays the top 5 scores with player names and times.

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the Repository**

   Click the **"Fork"** button at the top right of the repository page.

2. **Create a Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes**

   ```bash
   git commit -am 'Add some feature'
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

   Submit your changes for review and merging.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

- **Inspired by the Classic Tetris Game**
- **Special Thanks to All Contributors**

---

**Enjoy playing Kraft Tetris! If you have any feedback or issues, please open an issue on GitHub.**
