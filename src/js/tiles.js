class Tile {
    constructor(row, col, color) {
        this._row = row;
        this._col = col;
        this._color = color > -1 ? color : Math.floor(Math.random() * settings.levels[level].colorNumber);
        this._bgColor = settings.colors[this._color];
    }

    set row(value) {
        this._row = value;
    }

    set col(value) {
        this._col = value;
    }

    set bgColor(value) {
        this._bgColor = value;
    }

    get row() {
        return this._row;
    }

    get col() {
        return this._col;
    }

    get color() {
        return this._color;
    }

    get bgColor() {
        return this._bgColor;
    }
}

function generateTile(row, col, color) {
    tiles[row][col] = new Tile(row, col, color);
}

function renderTile(row, col, destArray) {
    destArray = destArray || tiles;
    ctx.fillStyle = destArray[row][col].bgColor;
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

function destroyTile(row, col, isShuffling) {
    if (isShuffling) return;
    tiles[row][col] = 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(tileSize * col, tileSize * row, tileSize, tileSize);
}

function moveTile(row, col, destRow, destCol, destArray) {
    destArray = destArray || tiles;
    destArray[destRow][destCol] = tiles[row][col];
    destArray[destRow][destCol].row = destRow;
    destArray[destRow][destCol].col = destCol;
    destroyTile(row, col, true);
    renderTile(destRow, destCol, destArray);
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
                moveTile(prevRow, col, curRow, col);
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

function shuffleField() {
    var id, i = 0, row, col, newRow, newCol, length, idArray = [], shuffledTiles = [];

    length = settings.levels[level].rows * settings.levels[level].cols;

    for (row = 0; row < settings.levels[level].rows; row++) {
        if (!shuffledTiles[row]) shuffledTiles[row] = [];
    }

    while (idArray.length < length) {
        id = Math.floor(Math.random() * length);
        if (idArray.indexOf(id) === -1) {
            idArray.push(id);
            row = Math.floor(i / settings.levels[level].cols);
            col = i - settings.levels[level].cols * row;
            newRow = Math.floor(id / settings.levels[level].cols);
            newCol = id - settings.levels[level].cols * newRow;
            moveTile(row, col, newRow, newCol, shuffledTiles);
            i++;
        }
    }

    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            tiles[row][col] = shuffledTiles[row][col];
        }
    }

    setCounters(null, null, null, --shufflesLeft);

    if (!shufflesLeft) {
        Nodes.game.classList.add('no-shuffles');
    }
}