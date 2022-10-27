class Tile {
    constructor(row, col, color, x, y, scale, booster) {
        this._row = row;
        this._col = col;
        this._isVisible = true;
        this._scale = scale || 1;
        this._width = (tileWidth - 2) * this._scale;
        this._height = (tileHeight - 2) * this._scale;
        this._x = x || tileWidth * this._col + 1 + (tileWidth - this._width) / 2;
        this._y = y || tileHeight * this._row + 1 + (tileHeight - this._height) / 2;
        this._color = color > -1 ? color : Math.floor(Math.random() * settings.levels[level].colorNumber);
        this._bgColor = settings.colors[this._color];
        this._img = loadedImages['tile' + this._color];
        this._zoomOut = false;
        this._zoomIn = false;
        this._deltaX = 0;
        this._deltaY = 0;
        this._booster = false;

        this.update = function () {
            if (!this._isVisible) return;

            if (this._zoomOut) {
                if (this._scale > 0) {
                    this._scale -= 1 / (settings.zoomOutSpeed / 60);
                } else {
                    this._isVisible = false;
                }
            } else if (this._zoomIn) {
                if (this._scale < 1) {
                    this._scale += 1 / (settings.zoomInSpeed / 60);
                } else {
                    this._scale = 1;
                }
            }
            this._width = (tileWidth - 2) * this._scale;
            this._height = (tileHeight - 2) * this._scale;

            if (this._zoomOut || this._zoomIn) {
                this._x = tileWidth * col + 1 + (tileWidth - this._width) / 2;
                this._y = tileHeight * row + 1 + (tileHeight - this._height) / 2;
            } else {
                var deltaX = tileWidth / (settings.dropSpeed / 60),
                    maxX = tileWidth * col + 1 + (tileWidth - this._width) / 2,
                    deltaY = tileHeight / (settings.dropSpeed / 60),
                    maxY = tileHeight * row + 1 + (tileHeight - this._height) / 2;

                if (!this._deltaX) this._deltaX = (maxX - this._x) / (settings.dropSpeed / 60);
                if (!this._deltaY) this._deltaY = (maxY - this._y) / (settings.dropSpeed / 60);

                var newX = this._x + this._deltaX,
                    newY = this._y + this._deltaY;

                if (newX < maxX) {
                    this._x += deltaX;
                } else {
                    this._x = maxX;
                }

                if (newY < maxY) {
                    this._y += deltaY;
                } else {
                    this._y = maxY;
                }
            }
            ctx.drawImage(this._img, this._x, this._y, this._width, this._height);
            if (this._booster) {
                ctx.drawImage(loadedImages['star' + this._booster], this._x, this._y, this._width, this._height);
            }
        }
        this._booster = booster;
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

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }

    set booster(value) {
        this._booster = value;
    }

    set zoomIn(value) {
        this._zoomIn = value;
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

    get img() {
        return this._img;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }
}

function generateTile(row, col, color) {
    tiles[row][col] = new Tile(row, col, color);
}

function clickTile(x, y) {
    var row, col;
    row = Math.floor(y / tileHeight);
    col = Math.floor(x / tileWidth);

    if (tiles[row][col]._booster) {
        createBlastMatrix(true);
        blastCount = 0;
        tilesWillDrop = false;
        findSuperArea(row, col);
    } else {
        findArea(row, col);
        checkForSuperTile(row, col);
    }

    processTiles();
}

function findArea(row, col) {
    var color;

    color = tiles[row][col].color;
    createBlastMatrix(true);

    blastMatrix[row][col] = 1;
    blastExtremePoints = {x1: col, x2: col, y1: row, y2: row};

    findMatchingNeighbours(row, col, color, blastMatrix);
}

function findSuperArea(row, col) {
    var i;
    if (tiles[row][col]._booster === 'H') {
        for (i = 0; i < settings.levels[level].cols; i++) {
            if(!blastMatrix[row][i]) {
                blastCount++;
                blastMatrix[row][i] = 1;
                if (i !== col && tiles[row][i]._booster) {
                    findSuperArea(row, i);
                }
            }
        }
        if (row) tilesWillDrop = true;
    } else if (tiles[row][col]._booster === 'V') {
        for (i = 0; i < settings.levels[level].rows; i++) {
            if(!blastMatrix[i][col]) {
                blastCount++;
                blastMatrix[i][col] = 1;
                if (i !== row && tiles[i][col]._booster) {
                    findSuperArea(i, col);
                }
            }
        }
    } else if (tiles[row][col]._booster === 'All') {
        createBlastMatrix(false);
    }
}

function createBlastMatrix(isEmpty) {
    var i, j, state;
    blastMatrix = [];
    blastCount = isEmpty ? 1 : 0;
    state = isEmpty ? 0 : 1;

    for (i = 0; i < settings.levels[level].rows; i++) {
        if (!blastMatrix[i]) blastMatrix[i] = [];
        for (j = 0; j < settings.levels[level].cols; j++) {
            blastMatrix[i].push(state);
            blastCount += state;
        }
    }
}

function processTiles() {
    if (blastCount < settings.levels[level].minBlastCount) return;
    var dropTimeout;
    controlsDisabled = true;
    blastArea(blastMatrix);
    setCounters(--movesLeft, score);
    updateScore();
    setTimeout(function () {
        dropTiles();
        dropTimeout = tilesWillDrop ? settings.dropSpeed + 100 : 0;
        tilesWillDrop = false;

        setTimeout(function () {
            generateNewTiles();

            setTimeout(function () {
                if (score >= settings.levels[level].goal) {
                    if (level + 1 >= settings.levelNumber) {
                        Nodes.game.classList.add('super-win');
                    } else {
                        Nodes.game.classList.add('win');
                    }
                    controlsDisabled = true;
                } else if (!movesLeft) {
                    Nodes.game.classList.add('lose', 'no-shuffles');
                    controlsDisabled = true;
                } else {
                    controlsDisabled = false;
                }
            }, settings.zoomInSpeed + 200)
        }, dropTimeout)
    }, settings.zoomOutSpeed)
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
        if (i - 1) tilesWillDrop = true;
        updateExtremePoints(i - 1, j);
        findMatchingNeighbours(i - 1, j, color, matrix);
    }
    //left cell
    if (isMatching(i, j - 1, color, matrix)) {
        matrix[i][j - 1] = 1;
        blastCount++;
        if (i) tilesWillDrop = true;
        updateExtremePoints(i, j - 1);
        findMatchingNeighbours(i, j - 1, color, matrix);
    }
    //right cell
    if (isMatching(i, j + 1, color, matrix)) {
        matrix[i][j + 1] = 1;
        blastCount++;
        if (i) tilesWillDrop = true;
        updateExtremePoints(i, j + 1);
        findMatchingNeighbours(i, j + 1, color, matrix);
    }
    //bottom cell
    if (isMatching(i + 1, j, color, matrix)) {
        matrix[i + 1][j] = 1;
        blastCount++;
        if (i + 1) tilesWillDrop = true;
        updateExtremePoints(i + 1, j);
        findMatchingNeighbours(i + 1, j, color, matrix);
    }
}

function updateExtremePoints(row, col) {
    if (blastExtremePoints.x1 > col) {
        blastExtremePoints.x1 = col;
    }
    if (blastExtremePoints.x2 < col) {
        blastExtremePoints.x2 = col;
    }
    if (blastExtremePoints.y1 > row) {
        blastExtremePoints.y1 = row;
    }
    if (blastExtremePoints.y2 < row) {
        blastExtremePoints.y2 = row;
    }
}

function checkForSuperTile(row, col) {
    var blastAreaHeight, blastAreaWidth;

    if (blastCount >= settings.fieldblastActivationNumber) {
        blastMatrix[row][col] = 0;
        tiles[row][col]._booster = 'All';
    } else if (blastCount >= settings.supertileActivationNumber) {
        blastMatrix[row][col] = 0;
        blastAreaWidth = blastExtremePoints.x2 - blastExtremePoints.x1 + 1;
        blastAreaHeight = blastExtremePoints.y2 - blastExtremePoints.y1 + 1;
        if (blastAreaWidth > blastAreaHeight) {
            tiles[row][col]._booster = 'H';
        } else if (blastAreaWidth < blastAreaHeight) {
            tiles[row][col]._booster = 'V';
        } else if (blastAreaWidth === blastAreaHeight) {
            tiles[row][col]._booster = Math.round(Math.random()) ? 'V' : 'H';
        }
    }
}

function findMove() {
    moveExists = false;
    var i, j;
    for (i = 0; i < settings.levels[level].rows; i++) {
        for (j = 0; j < settings.levels[level].cols; j++) {
            findArea(i, j);
            if (blastCount >= settings.levels[level].minBlastCount) {
                moveExists = true;
                return;
            }
        }
    }
}

function blastArea(matrix, isCompleteBlast) {
    var row, col;
    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if ((isCompleteBlast || matrix[row][col]) && tiles[row] && tiles[row][col]) {
                tiles[row][col]._zoomOut = true;
            }
        }
    }
}

function dropTiles() {
    var row, col, prevRow, curRow;
    for (row = settings.levels[level].rows - 1; row > 0; row--) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if ((tiles[row] && tiles[row][col] && tiles[row][col]._isVisible)) continue;
            prevRow = row - 1;
            curRow = row;
            while (prevRow > -1) {
                if (!tiles[prevRow][col]._isVisible) {
                    prevRow--;
                    continue;
                }
                tiles[curRow][col] = new Tile(curRow, col, tiles[prevRow][col].color, tiles[prevRow][col].x, tiles[prevRow][col].y, 1, tiles[prevRow][col]._booster);
                tiles[prevRow][col]._isVisible = false;
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
            if (tiles[row][col]._isVisible) continue;
            generateTile(row, col);
            tiles[row][col]._scale = 0.01;
            tiles[row][col]._zoomIn = true;
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
            shuffledTiles[newRow][newCol] = new Tile(newRow, newCol, tiles[row][col]._color, 0, 0, 1, tiles[row][col]._booster);
            i++;
        }
    }

    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            tiles[row][col] = new Tile(row, col, shuffledTiles[row][col]._color, 0, 0, 1, shuffledTiles[row][col]._booster);
        }
    }

    setCounters(movesLeft, score, null, --shufflesLeft);

    if (!shufflesLeft) {
        Nodes.game.classList.add('no-shuffles');
    }
}