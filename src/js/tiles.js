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
        this._img = loadedImages['tile' + this._color];
        this._zoomOut = false;
        this._zoomStartTime = 0;
        this._booster = false;
        this._creationTime = Date.now();
        this._startX = this._x;
        this._startY = this._y;
        this._maxX = tileWidth * col + 1 + (tileWidth - this._width) / 2;
        this._maxY = tileHeight * row + 1 + (tileHeight - this._height) / 2;
        this._toRight = this._maxX > this._x;
        this._toBottom = this._maxY > this._y;
        this._isChecked = false;
        this._isMovingX = false;
        this._isMovingY = false;

        this.update = function () {
            if (!this._isVisible) return;

            var now = Date.now();

            if (this._zoomOut) {
                if (this._scale > 0) {
                    this._scale = 1 - 1 / settings.zoomOutSpeed * (now - this._zoomStartTime);
                } else {
                    this._isVisible = false;
                }
            }
            this._width = (tileWidth - 2) * this._scale;
            this._height = (tileHeight - 2) * this._scale;

            if (this._zoomOut) {
                this._x = tileWidth * col + 1 + (tileWidth - this._width) / 2;
                this._y = tileHeight * row + 1 + (tileHeight - this._height) / 2;
            } else {
                var newX = this._startX + (this._maxX - this._startX) / settings.dropSpeed * (now - this._creationTime),
                    newY = this._startY + (this._maxY - this._startY) / settings.dropSpeed * (now - this._creationTime);

                if ((this._toRight && newX <= this._maxX) || (!this._toRight && newX >= this._maxX)) {
                    this._x = newX;
                    this._isMovingX = true;
                } else {
                    this._x = this._maxX;
                    if (this._isMovingX) {
                        this._isChecked = false;
                        this._isMovingX = false;
                    }
                }

                if ((this._toBottom && newY <= this._maxY) || (!this._toBottom && newY >= this._maxY)) {
                    this._y = newY;
                    this._isMovingY = true;
                } else {
                    this._y = this._maxY;
                    if (this._isMovingY) {
                        this._isChecked = false;
                        this._isMovingY = false;
                    }
                }
            }
            ctx.drawImage(this._img, this._x, this._y, this._width, this._height);
            if (this._booster) {
                ctx.drawImage(loadedImages['star' + this._booster], this._x, this._y, this._width, this._height);
            }
            if (this._isChecked) {
                ctx.drawImage(loadedImages['checked'], this._x, this._y, this._width, this._height);
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

    set isVisible(value) {
        this._isVisible = value;
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

    set zoomOut(value) {
        this._zoomOut = value;
    }

    set zoomStartTime(value) {
        this._zoomStartTime = value;
    }

    set isChecked(value) {
        this._isChecked = value;
    }

    get row() {
        return this._row;
    }

    get col() {
        return this._col;
    }

    get isVisible() {
        return this._isVisible;
    }

    get color() {
        return this._color;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get booster() {
        return this._booster;
    }

    get isChecked() {
        return this._isChecked;
    }
}

function clickTile(x, y) {
    var row, col;
    row = Math.floor(y / tileHeight);
    col = Math.floor(x / tileWidth);
    tilesWillDrop = false;
    hasSuperTile = false;
    createBlastMatrix(true);

    if (teleportActive) {
        teleportTiles(row, col);
        return;
    } else if (bombActive) {
        setCounters(movesLeft, score, shufflesLeft, --bombsLeft);
        if (!settings.bonusForCoins && !bombsLeft) {
            Nodes.game.classList.add('no-bombs');
        }
        if (settings.bonusForCoins) {
            updateCoins(-settings.cost.bombs);
        }
        bombActive = false;
        Nodes.bombButton.classList.remove('active');
        findBombArea(row, col);
    } else if (tiles[row][col].booster) {
        findSuperArea(row, col);
    } else {
        findArea(row, col);
        countBlastTiles();
        if (!hasSuperTile) {
            checkForSuperTile(row, col);
        }
    }
    countBlastTiles();

    processTiles(row, col);
}

function findArea(row, col) {
    var color, i, j;

    color = tiles[row][col].color;

    blastMatrix[row][col] = 1;
    blastExtremePoints = {x1: col, x2: col, y1: row, y2: row, width: 1, height: 1};

    findMatchingNeighbours(row, col, color, blastMatrix);

    if (settings.chainSuperTiles) {
        for (i = 0; i < settings.levels[level].rows; i++) {
            for (j = 0; j < settings.levels[level].cols; j++) {
                if (blastMatrix[i][j] && tiles[i][j].booster) {
                    findSuperArea(i, j);
                    hasSuperTile = true;
                }
            }
        }
    }
}

function findSuperArea(row, col) {
    var i;
    if (tiles[row][col].booster === 'H') {
        for (i = 0; i < settings.levels[level].cols; i++) {
            if (!blastMatrix[row][i]) {
                blastMatrix[row][i] = 1;
                updateExtremePoints(row, i);
                if (settings.chainSuperTiles && i !== col && tiles[row][i].booster) {
                    findSuperArea(row, i);
                }
            }
        }
    } else if (tiles[row][col].booster === 'V') {
        for (i = 0; i < settings.levels[level].rows; i++) {
            if (!blastMatrix[i][col]) {
                blastMatrix[i][col] = 1;
                updateExtremePoints(i, col);
                if (settings.chainSuperTiles && i !== row && tiles[i][col].booster) {
                    findSuperArea(i, col);
                }
            }
        }
    } else if (tiles[row][col].booster === 'All') {
        createBlastMatrix(false);
        blastExtremePoints = {
            x1: 0,
            x2: settings.levels[level].cols - 1,
            y1: 0,
            y2: settings.levels[level].rows - 1,
            width: settings.levels[level].cols,
            height: settings.levels[level].rows
        }
    }
}

function findBombArea(row, col) {
    var i, j,
        radius = settings.levels[level].bombRadius,
        x1 = col - radius,
        x2 = col + radius,
        y1 = row - radius,
        y2 = row + radius;

    for (i = 0; i < settings.levels[level].rows; i++) {
        for (j = 0; j < settings.levels[level].cols; j++) {
            if (i >= y1 && i <= y2 && j >= x1 && j <= x2) {
                if (radius > 1 && ((i === y1 && j === x1) || (i === y1 && j === x2) || (i === y2 && j === x1) || (i === y2 && j === x2))) {
                    continue;
                }
                blastMatrix[i][j] = 1;
                if (settings.chainSuperTiles && tiles[i][j].booster) findSuperArea(i, j);
            }
        }
    }
    updateExtremePoints(y1, x1);
    updateExtremePoints(y2, x2);
    blastExtremePoints.width = blastExtremePoints.x2 - blastExtremePoints.x1 + 1;
    blastExtremePoints.height = blastExtremePoints.y2 - blastExtremePoints.y1 + 1;
}

function teleportTiles(row, col) {
    tiles[row][col].isChecked = true;
    if (!teleportingTile) {
        teleportingTile = new Tile(row, col, tiles[row][col].color, null, null, 1, tiles[row][col].booster);
    } else {
        if (row === teleportingTile.row && col === teleportingTile.col) return;

        tiles[teleportingTile.row][teleportingTile.col] = new Tile(teleportingTile.row, teleportingTile.col, tiles[row][col].color, tiles[row][col].x, tiles[row][col].y, 1, tiles[row][col].booster);
        tiles[row][col] = new Tile(row, col, teleportingTile.color, teleportingTile.x, teleportingTile.y, 1, teleportingTile.booster);

        tiles[teleportingTile.row][teleportingTile.col].isChecked = true;
        tiles[row][col].isChecked = true;

        teleportingTile = false;
        teleportActive = false;

        setCounters(movesLeft, score, shufflesLeft, bombsLeft, --teleportsLeft);

        if (!settings.bonusForCoins && !teleportsLeft) {
            Nodes.game.classList.add('no-teleports');
        }

        if (settings.bonusForCoins) {
            updateCoins(-settings.cost.teleports);
        }
        Nodes.teleportButton.classList.remove('active');
    }
}

function createBlastMatrix(isEmpty) {
    var i, j, state;
    blastMatrix = [];
    state = isEmpty ? 0 : 1;

    for (i = 0; i < settings.levels[level].rows; i++) {
        if (!blastMatrix[i]) blastMatrix[i] = [];
        for (j = 0; j < settings.levels[level].cols; j++) {
            blastMatrix[i].push(state);
        }
    }
}

function countBlastTiles() {
    blastCount = 0;
    var i, j;
    for (i = 0; i < settings.levels[level].rows; i++) {
        for (j = 0; j < settings.levels[level].cols; j++) {
            if (blastMatrix[i][j]) {
                blastCount++;
                if (i && !blastMatrix[i - 1][j]) tilesWillDrop = true;
            }
        }
    }
}

function processTiles(row, col) {
    if ((tiles[row][col].booster && blastCount < settings.levels[level].minBlastCount - 1) ||
        (!tiles[row][col].booster && blastCount < settings.levels[level].minBlastCount)) return;
    var dropTimeout;
    controlsDisabled = true;
    blastArea();
    setCounters(--movesLeft, score);
    updateScore();
    // updateCoins(10);
    setTimeout(function () {
        dropTiles();
        dropTimeout = settings.animationDelay;
        if (settings.waitForDropEnd) {
            dropTimeout = tilesWillDrop ? settings.dropSpeed + settings.animationDelay : settings.animationDelay;
        }
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
                    Nodes.game.classList.add('lose');
                    controlsDisabled = true;
                } else {
                    controlsDisabled = false;
                    findMove();
                    if (!moveExists) {
                        shuffleField(true);
                    }
                }
            }, settings.dropSpeed)
        }, dropTimeout)
    }, settings.zoomOutSpeed + settings.animationDelay)
}

function isMatching(row, col, color) {
    return (col >= 0 && col < settings.levels[level].cols && row >= 0 && row < settings.levels[level].rows) &&
        tiles[row][col].color === color && !blastMatrix[row][col];
}

function findMatchingNeighbours(i, j, color) {
    //top cell
    if (isMatching(i - 1, j, color)) {
        blastMatrix[i - 1][j] = 1;
        updateExtremePoints(i - 1, j);
        findMatchingNeighbours(i - 1, j, color);
    }
    //left cell
    if (isMatching(i, j - 1, color)) {
        blastMatrix[i][j - 1] = 1;
        updateExtremePoints(i, j - 1);
        findMatchingNeighbours(i, j - 1, color);
    }
    //right cell
    if (isMatching(i, j + 1, color)) {
        blastMatrix[i][j + 1] = 1;
        updateExtremePoints(i, j + 1);
        findMatchingNeighbours(i, j + 1, color);
    }
    //bottom cell
    if (isMatching(i + 1, j, color)) {
        blastMatrix[i + 1][j] = 1;
        updateExtremePoints(i + 1, j);
        findMatchingNeighbours(i + 1, j, color);
    }
}

function updateExtremePoints(row, col) {
    if (blastExtremePoints.x1 < 0 || blastExtremePoints.x1 > col) {
        blastExtremePoints.x1 = col;
    }
    if (blastExtremePoints.x2 < 0 || blastExtremePoints.x2 < col) {
        blastExtremePoints.x2 = col;
    }
    if (blastExtremePoints.y1 < 0 || blastExtremePoints.y1 > row) {
        blastExtremePoints.y1 = row;
    }
    if (blastExtremePoints.y1 < 0 || blastExtremePoints.y2 < row) {
        blastExtremePoints.y2 = row;
    }

    blastExtremePoints.height = blastExtremePoints.y2 - blastExtremePoints.y1 + 1;
    blastExtremePoints.width = blastExtremePoints.x2 - blastExtremePoints.x1 + 1;
}

function checkForSuperTile(row, col) {
    if (blastCount >= settings.fieldblastActivationNumber) {
        blastMatrix[row][col] = 0;
        tiles[row][col].booster = 'All';
        updateCoins(settings.cost.superSuperTile);
    } else if (blastCount >= settings.supertileActivationNumber) {
        blastMatrix[row][col] = 0;
        if (blastExtremePoints.width > blastExtremePoints.height) {
            tiles[row][col].booster = 'H';
        } else if (blastExtremePoints.width < blastExtremePoints.height) {
            tiles[row][col].booster = 'V';
        } else if (blastExtremePoints.width === blastExtremePoints.height) {
            tiles[row][col].booster = Math.round(Math.random()) ? 'V' : 'H';
        }
        updateCoins(settings.cost.superTile);
    }
}

function findMove() {
    moveExists = false;
    var i, j;
    for (i = 0; i < settings.levels[level].rows; i++) {
        for (j = 0; j < settings.levels[level].cols; j++) {
            createBlastMatrix(true);
            findArea(i, j);
            countBlastTiles();
            if (blastCount >= settings.levels[level].minBlastCount) {
                moveExists = true;
                return;
            }
        }
    }
}

function blastArea(isCompleteBlast) {
    var row, col;
    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if ((isCompleteBlast || blastMatrix[row][col]) && tiles[row] && tiles[row][col]) {
                tiles[row][col].zoomOut = true;
                tiles[row][col].zoomStartTime = Date.now();
            }
        }
    }
}

function dropTiles() {
    var row, col, prevRow, curRow;
    for (row = settings.levels[level].rows - 1; row > 0; row--) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if ((tiles[row] && tiles[row][col] && tiles[row][col].isVisible)) continue;
            prevRow = row - 1;
            curRow = row;
            while (prevRow > -1) {
                if (!tiles[prevRow][col].isVisible) {
                    prevRow--;
                    continue;
                }
                tiles[curRow][col] = new Tile(curRow, col, tiles[prevRow][col].color, tiles[prevRow][col].x, tiles[prevRow][col].y, 1, tiles[prevRow][col].booster);
                tiles[prevRow][col].isVisible = false;
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
            if (tiles[row][col].isVisible) continue;
            tiles[row][col] = new Tile(row, col, -1, tileWidth * col + 1, -tileHeight * (blastExtremePoints.height - row + 1));
        }
    }
}

function shuffleField(isAuto) {
    if (isAuto) {
        if (autoshufflesLeft <= 0) {
            Nodes.game.classList.add('lose');
            controlsDisabled = true;
            return;
        }
        autoshufflesLeft--;
    } else {
        if (settings.bonusForCoins) {
            updateCoins(-settings.cost.shuffles);
        }
        setCounters(movesLeft, score, --shufflesLeft);
    }

    if (!settings.bonusForCoins && !shufflesLeft) {
        Nodes.game.classList.add('no-shuffles');
    }

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
            shuffledTiles[newRow][newCol] = new Tile(newRow, newCol, tiles[row][col].color, tiles[row][col].x, tiles[row][col].y, 1, tiles[row][col].booster);
            i++;
        }
    }

    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            tiles[row][col] = new Tile(row, col, shuffledTiles[row][col].color, shuffledTiles[row][col].x, shuffledTiles[row][col].y, 1, shuffledTiles[row][col].booster);
        }
    }

    findMove();

    if (!moveExists) {
        if (autoshufflesLeft > 0) {
            setTimeout(function () {
                shuffleField(true);
            }, settings.dropSpeed)
        } else {
            controlsDisabled = true;

            setTimeout(function () {
                Nodes.game.classList.add('lose');
            }, settings.dropSpeed)
        }
    }
}