// 游戏配置
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// 游戏状态
let board = [];
let score = 0;
let level = 1;
let lines = 0;
let dropTime = 0;
let lastTime = 0;
let gameRunning = false;
let gamePaused = false;

// Canvas 元素
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

// 缩放画布以适应实际像素
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

// 俄罗斯方块形状定义
const TETROMINOS = [
    {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00FFFF' // I型 - 青色
    },
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000FF' // J型 - 蓝色
    },
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FFA500' // L型 - 橙色
    },
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00' // O型 - 黄色
    },
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00FF00' // S型 - 绿色
    },
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080' // T型 - 紫色
    },
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF0000' // Z型 - 红色
    }
];

// 当前方块和下一个方块
let currentPiece = null;
let nextPiece = null;

// 初始化游戏板
function createBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// 创建新方块
function createPiece() {
    const type = Math.floor(Math.random() * TETROMINOS.length);
    return {
        x: Math.floor(COLS / 2) - Math.floor(TETROMINOS[type].shape[0].length / 2),
        y: 0,
        shape: TETROMINOS[type].shape,
        color: TETROMINOS[type].color
    };
}

// 绘制方块
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.05;
    ctx.strokeRect(x, y, 1, 1);
}

// 绘制游戏板
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, COLS, ROWS);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

// 绘制当前方块
function drawPiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                drawBlock(piece.x + x, piece.y + y, piece.color);
            }
        }
    }
}

// 绘制下一个方块
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, 4, 4);
    
    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(offsetX + x, offsetY + y, 1, 1);
                    nextCtx.strokeStyle = '#000';
                    nextCtx.lineWidth = 0.05;
                    nextCtx.strokeRect(offsetX + x, offsetY + y, 1, 1);
                }
            }
        }
    }
}

// 检查碰撞
function isValidMove(piece, dx, dy, rotation = null) {
    const shape = rotation || piece.shape;
    const newX = piece.x + dx;
    const newY = piece.y + dy;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = newX + x;
                const boardY = newY + y;
                
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return false;
                }
                
                if (boardY >= 0 && board[boardY][boardX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 旋转方块
function rotatePiece(piece) {
    const rotated = [];
    const N = piece.shape.length;
    
    for (let i = 0; i < N; i++) {
        rotated[i] = [];
        for (let j = 0; j < N; j++) {
            rotated[i][j] = piece.shape[N - 1 - j][i];
        }
    }
    
    return rotated;
}

// 放置方块到游戏板
function placePiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const boardY = piece.y + y;
                if (boardY >= 0) {
                    board[boardY][piece.x + x] = piece.color;
                }
            }
        }
    }
}

// 清除完整的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // 重新检查这一行
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        updateDisplay();
    }
}

// 更新显示
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 游戏结束检查
function isGameOver() {
    return !isValidMove(currentPiece, 0, 0);
}

// 获取新方块
function getNewPiece() {
    if (!nextPiece) {
        nextPiece = createPiece();
    }
    
    currentPiece = nextPiece;
    nextPiece = createPiece();
    
    if (isGameOver()) {
        gameOver();
        return false;
    }
    
    return true;
}

// 方块下落
function dropPiece() {
    if (isValidMove(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        placePiece(currentPiece);
        clearLines();
        if (!getNewPiece()) {
            return;
        }
    }
}

// 移动方块
function movePiece(dx) {
    if (isValidMove(currentPiece, dx, 0)) {
        currentPiece.x += dx;
    }
}

// 旋转方块
function rotatePieceIfValid() {
    const rotated = rotatePiece(currentPiece);
    if (isValidMove(currentPiece, 0, 0, rotated)) {
        currentPiece.shape = rotated;
    }
}

// 游戏主循环
function gameLoop(time = 0) {
    if (!gameRunning || gamePaused) {
        return;
    }
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropTime += deltaTime;
    
    // 根据等级调整下落速度
    const dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    
    if (dropTime > dropInterval) {
        dropPiece();
        dropTime = 0;
    }
    
    // 绘制游戏
    drawBoard();
    if (currentPiece) {
        drawPiece(currentPiece);
    }
    drawNextPiece();
    
    requestAnimationFrame(gameLoop);
}

// 开始游戏
function startGame() {
    createBoard();
    score = 0;
    level = 1;
    lines = 0;
    gameRunning = true;
    gamePaused = false;
    
    currentPiece = null;
    nextPiece = null;
    
    getNewPiece();
    updateDisplay();
    
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    
    gameLoop();
}

// 暂停游戏
function pauseGame() {
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        document.getElementById('pauseBtn').textContent = '继续';
    } else {
        document.getElementById('pauseBtn').textContent = '暂停';
        requestAnimationFrame(gameLoop);
    }
}

// 重置游戏
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '暂停';
    document.getElementById('gameOver').style.display = 'none';
    
    createBoard();
    drawBoard();
    
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, 4, 4);
    
    score = 0;
    level = 1;
    lines = 0;
    updateDisplay();
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused || !currentPiece) return;
    
    switch (e.code) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            dropPiece();
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePieceIfValid();
            break;
        case 'Space':
            e.preventDefault();
            pauseGame();
            break;
    }
});

// 按钮事件
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    resetGame();
});