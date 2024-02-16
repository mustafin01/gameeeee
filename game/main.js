let intervalId;
let monsterIntervalId;
let trapIntervalId;
let startTime;
let lives = 5;
let monsters = [];
let traps = [];
let gameMap;
let player;
let playerPosition = { x: 0, y: 0 };
let playerSize = 50; // Set the player size
let gameOver = false; // Initialize gameOver variable

window.addEventListener('DOMContentLoaded', function() {
    gameMap = document.getElementById('game-map');
    player = document.createElement('div');
    player.id = 'player';
    player.style.width = playerSize + 'px';
    player.style.height = playerSize + 'px';
    player.style.position = 'absolute';
    player.style.backgroundColor = 'blue';
    gameMap.appendChild(player);
    showLoginScreen();


function showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const usernameInput = document.getElementById('username');
    const startBtn = document.getElementById('start-btn');

    startBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const username = usernameInput.value;
        if (username) {
            startGame(username);
        }
    });

    loginScreen.classList.remove('hidden');
}

function showGameScreen(username) {
    const gameScreen = document.getElementById('game-screen');
    const usernameDisplay = document.getElementById('username-display');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const timeSpentDisplay = document.getElementById('time-spent-display');
    const livesCounter = document.getElementById('lives-counter');

    usernameDisplay.textContent = username;
    currentTimeDisplay.textContent = new Date().toLocaleTimeString();
    timeSpentDisplay.textContent = '00:00';
    livesCounter.textContent = lives;

    gameScreen.classList.remove('hidden');
    startGameLoop();
}

function startGame(username) {
    showGameScreen(username);
    startTime = Date.now();
    intervalId = setInterval(updateTime, 1000);
    monsterIntervalId = setInterval(generateMonsters, 3000);
    trapIntervalId = setInterval(generateTraps, 3000);
    window.addEventListener('keydown', movePlayer);
}

function startGameLoop() {
    // Game loop logic goes here
}

function updateTime() {
    const currentTimeDisplay = document.getElementById('current-time-display');
    const timeSpentDisplay = document.getElementById('time-spent-display');
    currentTimeDisplay.textContent = new Date().toLocaleTimeString();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60).toString().padStart(2, '0');
    const seconds = (timeSpent % 60).toString().padStart(2, '0');
    timeSpentDisplay.textContent = `${minutes}:${seconds}`;
}

function generateMonsters() {
    if (gameOver) return;

    const monster = document.createElement('div');
    monster.classList.add('monster');
    monster.style.width = '50px';
    monster.style.height = '50px';
    monster.style.backgroundColor = 'red';
    monster.style.position = 'absolute';
    monster.style.left = Math.random() * (gameMap.offsetWidth - playerSize) + 'px';
    monster.style.top = Math.random() * (gameMap.offsetHeight - playerSize) + 'px';
    gameMap.appendChild(monster);
    monsters.push(monster);

    // Start moving the monster towards the player
    moveMonsterTowardsPlayer(monster);
}

function moveMonsterTowardsPlayer(monster) {
    const monsterRect = monster.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const speed = 1; // Adjust the speed of the monster

    // Calculate the direction vector towards the player
    const direction = {
        x: playerRect.left + playerRect.width / 2 - (monsterRect.left + monsterRect.width / 2),
        y: playerRect.top + playerRect.height / 2 - (monsterRect.top + monsterRect.height / 2)
    };

    // Normalize the direction vector
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    const normalizedDirection = {
        x: direction.x / length,
        y: direction.y / length
    };

    // Move the monster towards the player
    monster.style.left = monsterRect.left + normalizedDirection.x * speed + 'px';
    monster.style.top = monsterRect.top + normalizedDirection.y * speed + 'px';

    // If the monster is not at the player's position, continue moving
    if (length > 1) { // Only move if the monster is not already on top of the player
        requestAnimationFrame(() => moveMonsterTowardsPlayer(monster));
    }
}


function generateTraps() {
  if (gameOver) return;
  const trap = document.createElement('div');
  trap.classList.add('trap');
  trap.style.width = '50px';
  trap.style.height = '50px';
  trap.style.backgroundColor = 'green';
  trap.style.position = 'absolute';
  trap.style.left = Math.random() * (gameMap.offsetWidth - playerSize) + 'px';
  trap.style.top = Math.random() * (gameMap.offsetHeight - playerSize) + 'px';
  gameMap.appendChild(trap);
  traps.push(trap);
}

function movePlayer(event) {
  if (gameOver) return; // Check if the game is over

  const step = 10; // Adjust the step size as needed
  const mapWidth = gameMap.offsetWidth - playerSize;
  const mapHeight = gameMap.offsetHeight - playerSize;

  switch (event.key) {
      case 'ArrowUp':
          playerPosition.y = Math.max(playerPosition.y - step, 0);
          break;
      case 'ArrowDown':
          playerPosition.y = Math.min(playerPosition.y + step, mapHeight);
          break;
      case 'ArrowLeft':
          playerPosition.x = Math.max(playerPosition.x - step, 0);
          break;
      case 'ArrowRight':
          playerPosition.x = Math.min(playerPosition.x + step, mapWidth);
          break;
      default:
          return; // Do nothing if it's not an arrow key
  }

  // Update the player's position
  player.style.left = playerPosition.x + 'px';
  player.style.top = playerPosition.y + 'px';

  // Check for collisions after moving
  checkCollisions();
}

// ... (other functions remain the same)

// Add an event listener for the keydown event on the entire document
document.addEventListener('keydown', movePlayer);

function checkCollisions() {
  monsters.forEach((monster, index) => {
      if (isCollision(player, monster)) {
          handleMonsterCollision();
          gameMap.removeChild(monster);
          monsters.splice(index, 1);
      }
  });

  traps.forEach((trap, index) => {
      if (isCollision(player, trap)) {
          handleTrapCollision();
          gameMap.removeChild(trap);
          traps.splice(index, 1);
      }
  });
}

function isCollision(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  return !(
      rect1.top > rect2.bottom ||
      rect1.right < rect2.left ||
      rect1.bottom < rect2.top ||
      rect1.left > rect2.right
  );
}

function handleMonsterCollision() {
  lives--;
  document.getElementById('lives-counter').textContent = lives;
  if (lives <= 0) {
      endGame();
  }
}

function handleTrapCollision() {
  lives--;
  document.getElementById('lives-counter').textContent = lives;
  if (lives <= 0) {
      endGame();
  }
}

function endGame() {
  gameOver = true;
  clearIntervals();
  showResultsScreen();
}

function showResultsScreen() {
  const resultsScreen = document.getElementById('results-screen');
  const resultsText = document.getElementById('results-text');
  const timeSpentDisplay = document.getElementById('time-spent-display');
  resultsText.textContent = `Time Spent: ${timeSpentDisplay.textContent}, Lives Left: ${lives}`;
  resultsScreen.classList.remove('hidden');
}

function restartGame() {
  gameOver = false;
  lives = 5;
  document.getElementById('lives-counter').textContent = lives;
  timeSpentDisplay.textContent = '00:00';
  monsters = [];
  traps = [];
  gameMap.innerHTML = '';
  playerPosition = { x: 0, y: 0 };
  player.style.left = playerPosition.x + 'px';
  player.style.top = playerPosition.y + 'px';
  gameMap.appendChild(player);
  startGameLoop();
}
});