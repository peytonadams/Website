const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Scale up the canvas for better resolution
context.scale(20, 20);

// Function to draw a matrix (Tetris block) on the canvas
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = 'green';
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Function to clear the canvas
function clearCanvas() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to drop the piece down periodically
function update(time = 0) {
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            resetPlayer();
            sweepArena();
        }
        dropCounter = 0;
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

// Function to check for collisions
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Function to merge the player's piece into the arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Function to clear completed rows
function sweepArena() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;
    }
}

// Function to create a matrix for a Tetris piece
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Function to create a Tetris block
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [1, 1],
            [1, 1],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ];
    }
}

// Function to reset the player's piece
function resetPlayer() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
    }
}

// Function to draw the game
function draw() {
    clearCanvas();
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

// Arena (game field) setup
const arena = createMatrix(12, 20);

// Player setup
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
};

// Timing and animation variables
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Input controls
document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        player.pos.x--;
        if (collide(arena, player)) {
            player.pos.x++;
        }
    } else if (event.key === 'ArrowRight') {
        player.pos.x++;
        if (collide(arena, player)) {
            player.pos.x--;
        }
    } else if (event.key === 'ArrowDown') {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
        }
        dropCounter = 0;
    } else if (event.key === 'q') {
        player.matrix = rotate(player.matrix, -1);
        if (collide(arena, player)) {
            player.matrix = rotate(player.matrix, 1);
        }
    } else if (event.key === 'w') {
        player.matrix = rotate(player.matrix, 1);
        if (collide(arena, player)) {
            player.matrix = rotate(player.matrix, -1);
        }
    }
});

// Function to rotate a Tetris piece
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }

    return matrix;
}

// Start the game
resetPlayer();
update();
