function clickTile(x, y) {
    var row, col;
    row = Math.floor(y / tileHeight);
    col = Math.floor(x / tileWidth);
    if (row >= levelConfig[level].rows || col >= levelConfig[level].cols) return;
    tilesWillDrop = false;
    fieldWillBlast = false;
    rowWillBlast = false;
    createBlastMatrix(true);

    if (teleportActive) {
        teleportTiles(row, col);
        return;
    } else if (bombActive) {
        findBombArea(row, col);
        setCounters(movesLeft, score, shufflesLeft, --bombsLeft);
        updateCoins(-settings.cost.bombs);
        Sounds.bomb.play();
        if (rowWillBlast) Sounds.row.play();
        Nodes.bombButton.classList.remove('active');
    } else if (tiles[row][col].booster) {
        if (tiles[row][col].booster === 'All') {
            Sounds.fieldBlast.play();
        } else {
            Sounds.row.play();
        }
        findSuperArea(row, col, true);
        if (fieldWillBlast) Sounds.fieldBlast.play();
    } else {
        findArea(row, col);
        countBlastTiles();
        checkForSuperTile(row, col);
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
        for (i = 0; i < levelConfig[level].rows; i++) {
            for (j = 0; j < levelConfig[level].cols; j++) {
                if (blastMatrix[i][j] && tiles[i][j].booster) {
                    findSuperArea(i, j);
                }
            }
        }
    }
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

function isMatching(row, col, color) {
    return (col >= 0 && col < levelConfig[level].cols && row >= 0 && row < levelConfig[level].rows) &&
        !tiles[row][col].booster &&
        tiles[row][col].color === color && !blastMatrix[row][col];
}

function findSuperArea(row, col, forBlast) {
    var i, j;
    if (tiles[row][col].booster === 'H') {
        for (i = 0; i < levelConfig[level].cols; i++) {
            if (blastMatrix[row][i]) continue;
            blastMatrix[row][i] = 1;
            if (forBlast && (!tiles[row][i].booster || !settings.chainSuperTiles)) {
                tiles[row][i].booster = 'H';
                rowWillBlast = true;
            }
            updateExtremePoints(row, i);
            if (settings.chainSuperTiles && i !== col && tiles[row][i].booster) {
                findSuperArea(row, i, forBlast);
            }
        }
    } else if (tiles[row][col].booster === 'V') {
        for (i = 0; i < levelConfig[level].rows; i++) {
            if (blastMatrix[i][col]) continue;
            blastMatrix[i][col] = 1;
            if (forBlast && (!tiles[i][col].booster || !settings.chainSuperTiles)) {
                tiles[i][col].booster = 'V';
                rowWillBlast = true;
            }
            updateExtremePoints(i, col);
            if (settings.chainSuperTiles && i !== row && tiles[i][col].booster) {
                findSuperArea(i, col, forBlast);
            }
        }
    } else if (tiles[row][col].booster === 'All') {
        createBlastMatrix(false);
        if (forBlast) {
            fieldWillBlast = true;
            for (i = 0; i < levelConfig[level].rows; i++) {
                for (j = 0; j < levelConfig[level].cols; j++) {
                    tiles[i][j].booster = 'Cross';
                }
            }
        }
        blastExtremePoints = {
            x1: 0,
            x2: levelConfig[level].cols - 1,
            y1: 0,
            y2: levelConfig[level].rows - 1,
            width: levelConfig[level].cols,
            height: levelConfig[level].rows
        }
    }
}

function findBombArea(row, col) {
    var i, j,
        radius = levelConfig[level].bombRadius,
        x1 = col - radius,
        x2 = col + radius,
        y1 = row - radius,
        y2 = row + radius;

    for (i = 0; i < levelConfig[level].rows; i++) {
        for (j = 0; j < levelConfig[level].cols; j++) {
            if (i >= y1 && i <= y2 && j >= x1 && j <= x2) {
                //leave corner tiles for circle-like blast area
                if (radius > 1 && ((i === y1 && j === x1) || (i === y1 && j === x2) || (i === y2 && j === x1) || (i === y2 && j === x2))) {
                    continue;
                }
                blastMatrix[i][j] = 1;
                tiles[i][j].bomb = true;
                if (settings.chainSuperTiles && tiles[i][j].booster) findSuperArea(i, j, true);
            }
        }
    }
    updateExtremePoints(y1, x1);
    updateExtremePoints(y2, x2);
    blastExtremePoints.width = blastExtremePoints.x2 - blastExtremePoints.x1 + 1;
    blastExtremePoints.height = blastExtremePoints.y2 - blastExtremePoints.y1 + 1;
}

function teleportTiles(row, col) {
    if (tiles[row][col].booster) return;
    Sounds.select.play();
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
        controlsDisabled = true;

        updateCoins(-settings.cost.teleports);

        setCounters(movesLeft, score, shufflesLeft, bombsLeft, --teleportsLeft);

        Nodes.teleportButton.classList.remove('active');
        Sounds.teleport.play();

        setTimeout(function () {
            controlsDisabled = false;
            findMove();
            if (!moveExists) {
                shuffleField(true);
            }
        }, settings.dropTime)
    }
}

function createBlastMatrix(isEmpty) {
    var i, j, state;
    blastMatrix = [];
    state = isEmpty ? 0 : 1;

    for (i = 0; i < levelConfig[level].rows; i++) {
        if (!blastMatrix[i]) blastMatrix[i] = [];
        for (j = 0; j < levelConfig[level].cols; j++) {
            blastMatrix[i].push(state);
        }
    }
}

function countBlastTiles() {
    blastCount = 0;
    var i, j;
    for (i = 0; i < levelConfig[level].rows; i++) {
        for (j = 0; j < levelConfig[level].cols; j++) {
            if (blastMatrix[i][j]) {
                blastCount++;
                if (i && !blastMatrix[i - 1][j]) tilesWillDrop = true;
            }
        }
    }
}

function processTiles(row, col) {
    if ((tiles[row][col].booster && blastCount < levelConfig[level].minBlastCount - 1) ||
        (!tiles[row][col].booster && blastCount < levelConfig[level].minBlastCount)) return;
    var dropTimeout;
    controlsDisabled = true;
    blastArea();
    if (!bombActive) {
        setCounters(--movesLeft, score);
    } else {
        //don't count bomb as a move
        setCounters(movesLeft, score);
    }
    bombActive = false;
    updateScore();
    Sounds.pop.play();
    setTimeout(function () {
        dropTiles();
        dropTimeout = settings.animationDelay;
        if (settings.waitForDropEnd) {
            dropTimeout = tilesWillDrop ? settings.dropTime + settings.animationDelay : settings.animationDelay;
        }
        tilesWillDrop = false;

        setTimeout(function () {
            generateNewTiles();

            setTimeout(function () {
                if (score >= levelConfig[level].goal) {
                    if (level + 1 >= settings.levelNumber) {
                        Nodes.game.classList.add('super-win');
                    } else {
                        Nodes.game.classList.add('win');
                    }
                    controlsDisabled = true;
                    Sounds.win.play();
                } else if (!movesLeft) {
                    Nodes.game.classList.add('lose');
                    controlsDisabled = true;
                    Sounds.lose.play();
                } else {
                    controlsDisabled = false;
                    findMove();
                    if (!moveExists) {
                        shuffleField(true);
                    }
                }
            }, settings.dropTime)
        }, dropTimeout)
    }, settings.zoomOutTime + settings.animationDelay)
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
        updateCoins(settings.cost.fieldblastTile);
        superTile = tiles[row][col];
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
        superTile = tiles[row][col];
    }
}

function findMove() {
    moveExists = false;
    var i, j;
    for (i = 0; i < levelConfig[level].rows; i++) {
        for (j = 0; j < levelConfig[level].cols; j++) {
            createBlastMatrix(true);
            findArea(i, j);
            countBlastTiles();
            if (blastCount >= levelConfig[level].minBlastCount) {
                moveExists = true;
                return;
            }
        }
    }
}

function blastArea(isCompleteBlast) {
    var row, col;
    for (row = 0; row < levelConfig[level].rows; row++) {
        for (col = 0; col < levelConfig[level].cols; col++) {
            if ((isCompleteBlast || blastMatrix[row][col]) && tiles[row] && tiles[row][col]) {
                if (!tiles[row][col].booster) {
                    tiles[row][col].zoomOut = true;
                    tiles[row][col].zoomStartTime = Date.now();
                } else {
                    tiles[row][col].superBlast = 1;
                    tiles[row][col].zoomStartTime = Date.now();
                }
            }
        }
    }
}

function dropTiles() {
    var row, col, prevRow, curRow;
    for (row = levelConfig[level].rows - 1; row > 0; row--) {
        for (col = 0; col < levelConfig[level].cols; col++) {
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
    for (row = 0; row < levelConfig[level].rows; row++) {
        for (col = 0; col < levelConfig[level].cols; col++) {
            if (tiles[row][col].isVisible) continue;
            tiles[row][col] = new Tile(row, col, -1, tileWidth * col + 1, -tileHeight * (blastExtremePoints.height - row + 1));
        }
    }
}

function shuffleField(isAuto) {
    Sounds.shuffle.play();
    if (isAuto) {
        if (autoshufflesLeft <= 0) {
            Nodes.game.classList.add('lose');
            controlsDisabled = true;
            Sounds.lose.play();
            return;
        }
        autoshufflesLeft--;
    } else {
        updateCoins(-settings.cost.shuffles);
        setCounters(movesLeft, score, --shufflesLeft);
    }

    var id, i = 0, row, col, newRow, newCol, length, idArray = [], shuffledTiles = [];

    length = levelConfig[level].rows * levelConfig[level].cols;

    for (row = 0; row < levelConfig[level].rows; row++) {
        if (!shuffledTiles[row]) shuffledTiles[row] = [];
    }

    //shuffle tiles
    while (idArray.length < length) {
        id = Math.floor(Math.random() * length);
        if (idArray.indexOf(id) === -1) {
            idArray.push(id);
            row = Math.floor(i / levelConfig[level].cols);
            col = i - levelConfig[level].cols * row;
            newRow = Math.floor(id / levelConfig[level].cols);
            newCol = id - levelConfig[level].cols * newRow;
            shuffledTiles[newRow][newCol] = new Tile(newRow, newCol, tiles[row][col].color, tiles[row][col].x, tiles[row][col].y, 1, tiles[row][col].booster);
            i++;
        }
    }

    //recreate tiles
    for (row = 0; row < levelConfig[level].rows; row++) {
        for (col = 0; col < levelConfig[level].cols; col++) {
            tiles[row][col] = new Tile(row, col, shuffledTiles[row][col].color, shuffledTiles[row][col].x, shuffledTiles[row][col].y, 1, shuffledTiles[row][col].booster);
        }
    }

    findMove();

    if (!moveExists) {
        if (autoshufflesLeft > 0) {
            setTimeout(function () {
                shuffleField(true);
            }, settings.dropTime)
        } else {
            controlsDisabled = true;

            setTimeout(function () {
                Nodes.game.classList.add('lose');
                Sounds.lose.play();
            }, settings.dropTime)
        }
    }
}