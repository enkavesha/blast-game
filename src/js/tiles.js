class Tile {
    constructor(row, col) {
        this._row = row;
        this._col = col;
        this.color = Math.floor(Math.random() * settings.levels[level].colorNumber);
        this.bgColor = settings.colors[this.color];
    }

    set row(value) {
        this._row = value;
    }

    get row() {
        return this._row;
    }

    get col() {
        return this._col;
    }
}

function generateTile(row, col) {
    tiles[row][col] = new Tile(row, col);
}

function renderTile(row, col) {
    ctx.fillStyle = tiles[row][col].bgColor;
    ctx.fillRect(tileSize * col, tileSize * row, tileSize, tileSize);
}

function clickTile(x, y) {
    var row, col;
    row = Math.floor(y / tileSize);
    col = Math.floor(x / tileSize);

    findArea(row, col);
}

function findArea(row, col) {
    var color, blastMatrix, i, j;

    color = tiles[row][col].color;
    blastMatrix = [];
    blastCount = 1;

    for (i = 0; i < settings.levels[level].rows; i++) {
        if (!blastMatrix[i]) blastMatrix[i] = [];
        for (j = 0; j < settings.levels[level].cols; j++) {
            blastMatrix[i].push(0);
        }
    }

    blastMatrix[row][col] = 1;

    findMatchingNeighbours(row, col, color, blastMatrix);

    if (blastCount >= settings.levels[level].minBlastCount) {
        controlsDisabled = true;
        blastArea(blastMatrix);
        setCounters(--movesLeft, score);
        updateScore();
        setTimeout(function () {
            dropTiles();

            if (score >= settings.levels[level].goal) {
                level++;
                if (level >= settings.levelNumber) {
                    level = 0;
                    Nodes.game.classList.add('super-win');
                } else {
                    Nodes.game.classList.add('win');
                }
                return;
            } else if (!movesLeft) {
                Nodes.game.classList.add('lose');
                return;
            }

            setTimeout(function () {
                generateNewTiles();
                controlsDisabled = false;
            }, 250)
        }, 250)
    }
}

function isMatching(row, col, color, matrix) {
    return (col >= 0 && col < settings.levels[level].cols && row >= 0 && row < settings.levels[level].rows) &&
        tiles[row][col].color === color && !matrix[row][col];
}

function findMatchingNeighbours(i, j, color, matrix) {
    //top cell
    if (isMatching(i - 1, j, color, matrix)) {
        matrix[i - 1][j] = 1;
        blastCount++;
        findMatchingNeighbours(i - 1, j, color, matrix);
    }
    //left cell
    if (isMatching(i, j - 1, color, matrix)) {
        matrix[i][j - 1] = 1;
        blastCount++;
        findMatchingNeighbours(i, j - 1, color, matrix);
    }
    //right cell
    if (isMatching(i, j + 1, color, matrix)) {
        matrix[i][j + 1] = 1;
        blastCount++;
        findMatchingNeighbours(i, j + 1, color, matrix);
    }
    //bottom cell
    if (isMatching(i + 1, j, color, matrix)) {
        matrix[i + 1][j] = 1;
        blastCount++;
        findMatchingNeighbours(i + 1, j, color, matrix);
    }
}

function blastArea(matrix, isCompleteBlast) {
    var row, col;
    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if (isCompleteBlast || matrix[row][col]) destroyTile(row, col);
        }
    }
}

function destroyTile(row, col) {
    tiles[row][col] = 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(tileSize * col, tileSize * row, tileSize, tileSize);
}

function moveTile(row, col, destRow) {
    tiles[destRow][col] = tiles[row][col];
    tiles[destRow][col].row = destRow;
    destroyTile(row, col);
    renderTile(destRow, col);
}

function dropTiles() {
    var row, col, prevRow, curRow;
    for (row = settings.levels[level].rows - 1; row > 0; row--) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if (tiles[row][col]) continue;
            prevRow = row - 1;
            curRow = row;
            while (prevRow > -1) {
                if (!tiles[prevRow][col]) {
                    prevRow--;
                    continue;
                }
                moveTile(prevRow, col, curRow);
                prevRow--;
                curRow--;
            }
        }
    }
}

function generateNewTiles() {
    var row, col;
    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if (tiles[row][col]) continue;
            generateTile(row, col);
            renderTile(row, col);
        }
    }
}