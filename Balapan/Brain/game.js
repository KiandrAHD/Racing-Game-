// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROAD_WIDTH = 300;
const LANE_COUNT = 3;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;
const OBSTACLE_HEIGHT = 60;
const COIN_SIZE = 25;

// Game variables
let canvas, ctx;
let gameRunning = false;
let score = 0;
let coins = 0;
let gameTime = 0;
let timeOfDay = 'morning';
let language = 'en';
let currentPath = 'city';
let roadMarkings = [];
let obstacles = [];
let coinsArray = [];
let playerLane = 1; // Middle lane
let frameCount = 0;
let roadX = 0;
let baseSpeed = 3;
let currentSpeed = baseSpeed;
let gameStartTime;

// Text elements in both languages
const translations = {
    en: {
        title: "Racing Game",
        score: "Score: ",
        coins: "Coins: ",
        time: "Time: ",
        speed: "Speed: ",
        gameOver: "Game Over!",
        finalScore: "Your score: ",
        finalCoins: "Coins collected: ",
        playAgain: "Play Again",
        switchLang: "Switch to Bahasa",
        startGame: "Start Game",
        pathSelect: "Select Path:",
        pathCity: "City Highway",
        pathDesert: "Desert Road",
        pathForest: "Forest Trail",
        controlsText: "Controls: A/D keys to move left/right",
        helpTitle: "Game Instructions",
        helpControls: "Use A and D keys to control your car",
        helpCoins: "Collect gold coins for bonus points",
        helpObstacles: "Avoid red obstacles",
        helpSpeed: "Speed increases with your score",
        helpTime: "Time of day changes every 300 points"
    },
    id: {
        title: "Game Balapan",
        score: "Skor: ",
        coins: "Koin: ",
        time: "Waktu: ",
        speed: "Kecepatan: ",
        gameOver: "Game Over!",
        finalScore: "Skor anda: ",
        finalCoins: "Koin terkumpul: ",
        playAgain: "Main Lagi",
        switchLang: "Ganti ke English",
        startGame: "Mulai Game",
        pathSelect: "Pilih Jalur:",
        pathCity: "Jalan Tol Kota",
        pathDesert: "Jalan Gurun",
        pathForest: "Jalur Hutan",
        controlsText: "Kontrol: Tombol A/D untuk bergerak kiri/kanan",
        helpTitle: "Petunjuk Permainan",
        helpControls: "Gunakan tombol A dan D untuk mengontrol mobil",
        helpCoins: "Kumpulkan koin emas untuk poin bonus",
        helpObstacles: "Hindari rintangan merah",
        helpSpeed: "Kecepatan meningkat dengan skor anda",
        helpTime: "Waktu berubah setiap 300 poin"
    }
};

// Time of day information
const timesOfDay = [
    { name: 'morning', color: 'gold', nextAt: 300 },
    { name: 'afternoon', color: 'orange', nextAt: 600 },
    { name: 'evening', color: 'darkorange', nextAt: 900 },
    { name: 'night', color: 'navy', nextAt: 1200 }
];

// Path settings
const pathSettings = {
    city: { color: '#555', markings: 'white' },
    desert: { color: '#D2B48C', markings: '#8B4513' },
    forest: { color: '#228B22', markings: '#006400' }
};

// Initialize game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Initialize road markings
    for (let y = -50; y < CANVAS_HEIGHT + 50; y += 100) {
        roadMarkings.push({ x: CANVAS_WIDTH / 2 - 5, y, width: 10, height: 50 });
    }

    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('help-btn').addEventListener('click', showHelp);
    document.getElementById('start-btn').addEventListener('click', startGameFromButton);
    document.querySelector('.close').addEventListener('click', closeHelp);

    // Set up language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            language = btn.dataset.lang;
            updateLanguage();
        });
    });

    // Set up path selection
    document.querySelectorAll('.path-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.path-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            currentPath = option.dataset.path;
        });
    });

    // Set default selected path
    document.querySelector('.path-option[data-path="city"]').classList.add('selected');

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('help-modal')) {
            closeHelp();
        }
    });

    updateLanguage();
}

// Start game from button click
function startGameFromButton() {
    document.getElementById('start-screen').style.display = 'none';
    startGame();
}

// Update all text elements based on current language
function updateLanguage() {
    const lang = translations[language];
    document.getElementById('title').textContent = lang.title;
    document.getElementById('game-over-text').textContent = lang.gameOver;
    document.getElementById('restart-btn').textContent = lang.playAgain;
    document.getElementById('lang-toggle').textContent = lang.switchLang;
    document.getElementById('start-btn').textContent = lang.startGame;
    document.getElementById('path-select-text').textContent = lang.pathSelect;
    document.getElementById('path-city').textContent = lang.pathCity;
    document.getElementById('path-desert').textContent = lang.pathDesert;
    document.getElementById('path-forest').textContent = lang.pathForest;
    document.getElementById('controls-text').textContent = lang.controlsText;
    document.getElementById('help-title').textContent = lang.helpTitle;
    document.getElementById('help-controls').textContent = lang.helpControls;
    document.getElementById('help-coins').textContent = lang.helpCoins;
    document.getElementById('help-obstacles').textContent = lang.helpObstacles;
    document.getElementById('help-speed').textContent = lang.helpSpeed;
    document.getElementById('help-time').textContent = lang.helpTime;

    document.querySelectorAll('.language-btn').forEach(btn => {
        if (btn.dataset.lang === 'en') btn.textContent = 'English';
        else if (btn.dataset.lang === 'id') btn.textContent = 'Bahasa Indonesia';
    });

    updateScoreDisplay();
    updateCoinsDisplay();
    updateSpeedDisplay();
}

// Show help modal
function showHelp() {
    document.getElementById('help-modal').style.display = 'block';
}

// Close help modal
function closeHelp() {
    document.getElementById('help-modal').style.display = 'none';
}

// Toggle between languages
function toggleLanguage() {
    language = language === 'en' ? 'id' : 'en';
    updateLanguage();
}

// Start the game
function startGame() {
    gameRunning = true;
    score = 0;
    coins = 0;
    gameTime = 0;
    timeOfDay = 'morning';
    playerLane = 1;
    obstacles = [];
    coinsArray = [];
    roadX = 0;
    baseSpeed = 3;
    currentSpeed = baseSpeed;
    frameCount = 0;

    // Set time of day class
    document.getElementById('game-container').className = timeOfDay;

    gameStartTime = Date.now();
    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    frameCount++;
    update();
    render();

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Update speed based on score
    currentSpeed = baseSpeed + (Math.floor(score / 50) * 0.5);

    // Update road position
    roadX += currentSpeed;
    if (roadX >= 100) roadX = 0;

    // Update road markings
    for (let marking of roadMarkings) {
        marking.y += currentSpeed;
        if (marking.y > CANVAS_HEIGHT) {
            marking.y = -50;
        }
    }

    // Generate obstacles
    if (frameCount % 100 === 0) {
        const randomLane = Math.floor(Math.random() * LANE_COUNT);
        const obstacle = {
            x: (CANVAS_WIDTH - ROAD_WIDTH) / 2 + randomLane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2,
            y: -OBSTACLE_HEIGHT,
            width: CAR_WIDTH,
            height: OBSTACLE_HEIGHT,
            lane: randomLane,
            type: 'obstacle'
        };
        obstacles.push(obstacle);
    }

    // Generate coins
    if (frameCount % 150 === 0) {
        const randomLane = Math.floor(Math.random() * LANE_COUNT);
        const coin = {
            x: (CANVAS_WIDTH - ROAD_WIDTH) / 2 + randomLane * LANE_WIDTH + LANE_WIDTH / 2 - COIN_SIZE / 2,
            y: -COIN_SIZE,
            width: COIN_SIZE,
            height: COIN_SIZE,
            lane: randomLane,
            type: 'coin',
            collected: false
        };
        coinsArray.push(coin);
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += currentSpeed;

        // Check if obstacle is out of bounds
        if (obstacles[i].y > CANVAS_HEIGHT) {
            obstacles.splice(i, 1);
        }

        // Check collision
        if (checkCollision(obstacles[i])) {
            gameOver();
            return;
        }
    }

    // Update coins
    for (let i = coinsArray.length - 1; i >= 0; i--) {
        coinsArray[i].y += currentSpeed;

        // Check if coin is out of bounds
        if (coinsArray[i].y > CANVAS_HEIGHT) {
            coinsArray.splice(i, 1);
        }

        // Check coin collection
        if (!coinsArray[i].collected && checkCollision(coinsArray[i])) {
            coinsArray[i].collected = true;
            coins++;
            score += 10; // Bonus points for coins
            updateCoinsDisplay();
            updateScoreDisplay();
            coinsArray.splice(i, 1);
        }
    }

    // Update game time
    gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    updateTimeDisplay();
    updateSpeedDisplay();

    // Change time of day based on score
    checkTimeOfDay();
}

// Render the game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    const leftEdge = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
    ctx.fillStyle = pathSettings[currentPath].color;
    ctx.fillRect(leftEdge, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    // Draw road markings
    ctx.fillStyle = pathSettings[currentPath].markings;
    for (let marking of roadMarkings) {
        ctx.fillRect(marking.x, marking.y, marking.width, marking.height);
    }

    // Draw lane markings
    ctx.strokeStyle = pathSettings[currentPath].markings;
    ctx.lineWidth = 2;
    for (let i = 1; i < LANE_COUNT; i++) {
        const laneX = leftEdge + i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, CANVAS_HEIGHT);
        ctx.stroke();
    }

    // Draw obstacles
    ctx.fillStyle = 'red';
    for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Draw obstacle details
        ctx.fillStyle = 'black';
        ctx.fillRect(obstacle.x + 10, obstacle.y + 15, 30, 15);
        ctx.fillStyle = 'red';
    }

    // Draw coins
    for (let coin of coinsArray) {
        if (!coin.collected) {
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(coin.x + COIN_SIZE / 2, coin.y + COIN_SIZE / 2, COIN_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Draw player car
    const playerX = (CANVAS_WIDTH - ROAD_WIDTH) / 2 + playerLane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
    const playerY = CANVAS_HEIGHT - CAR_HEIGHT - 50;

    ctx.fillStyle = 'blue';
    ctx.fillRect(playerX, playerY, CAR_WIDTH, CAR_HEIGHT);
    // Draw car details
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(playerX + 10, playerY + 15, 30, 20);
    ctx.fillRect(playerX + 10, playerY + 45, 30, 20);
}

// Check for collisions
function checkCollision(object) {
    const playerX = (CANVAS_WIDTH - ROAD_WIDTH) / 2 + playerLane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
    const playerY = CANVAS_HEIGHT - CAR_HEIGHT - 50;

    return !(
        playerX + CAR_WIDTH < object.x ||
        playerX > object.x + object.width ||
        playerY + CAR_HEIGHT < object.y ||
        playerY > object.y + object.height
    );
}

// Handle key presses (A/D keys for controls)
function handleKeyPress(e) {
    if (!gameRunning) {
        // Start game if not running and Enter pressed
        if (e.key === 'Enter') {
            startGameFromButton();
        }
        return;
    }

    switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
            if (playerLane > 0) playerLane--;
            break;
        case 'd':
        case 'arrowright':
            if (playerLane < LANE_COUNT - 1) playerLane++;
            break;
    }
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('score-display').textContent =
        translations[language].score + score;

    // Also update final score text if game over screen is visible
    if (!gameRunning) {
        document.getElementById('final-score-text').textContent =
            translations[language].finalScore + score;
    }
}

// Update coins display
function updateCoinsDisplay() {
    document.getElementById('coins-display').textContent =
        translations[language].coins + coins;

    // Also update final coins text if game over screen is visible
    if (!gameRunning) {
        document.getElementById('final-coins-text').textContent =
            translations[language].finalCoins + coins;
    }
}

// Update speed display
function updateSpeedDisplay() {
    document.getElementById('speed-display').textContent =
        translations[language].speed + currentSpeed.toFixed(1);
}

// Update time display
function updateTimeDisplay() {
    const hours = Math.floor(gameTime / 3600);
    const minutes = Math.floor((gameTime % 3600) / 60);
    const seconds = gameTime % 60;

    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('time-display').textContent =
        translations[language].time + timeString;
}

// Check and update time of day
function checkTimeOfDay() {
    for (let i = 0; i < timesOfDay.length; i++) {
        if (score >= timesOfDay[i].nextAt) {
            const nextTimeIndex = (i + 1) % timesOfDay.length;
            timeOfDay = timesOfDay[nextTimeIndex].name;
            document.getElementById('game-container').className = timeOfDay;
        }
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('final-score-text').textContent =
        translations[language].finalScore + score;
    document.getElementById('final-coins-text').textContent =
        translations[language].finalCoins + coins;
    document.getElementById('game-over-screen').style.display = 'flex';
}

// Restart game
function restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}

// Initialize game when loaded
window.onload = init;