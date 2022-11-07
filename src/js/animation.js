function animateGame() {
    animateTiles();
    animateScore();
    animateCoins();
    bounceCoin();

    requestAnimationFrame(animateGame);
}

function animateTiles() {
    var row, col;

    ctx.clearRect(0, 0, cw, ch);

    for (row = 0; row < settings.levels[level].rows; row++) {
        for (col = 0; col < settings.levels[level].cols; col++) {
            if (tiles[row] && tiles[row][col]) {
                tiles[row][col].update();
            }
        }
    }
}

function animateScore() {
    var now, timeDiff, newScore, scoreDiff, progress;

    now = Date.now();
    timeDiff = now - scoreStartTime;
    scoreDiff = score - curScore;
    newScore = curScore + scoreDiff / settings.scoreChangeTime * timeDiff;
    progress = newScore / settings.levels[level].goal * 100;
    if (newScore >= score) {
        Nodes.score.innerText = String(score);
    } else {
        Nodes.score.innerText = String(Math.floor(newScore));
        Nodes.gameProgress.style.width = progress > 100 ? 100 + '%' : progress + '%';
    }
}

function animateCoins() {
    var now, timeDiff, newCoins, coinsDiff;

    now = Date.now();
    timeDiff = now - coinsStartTime;
    coinsDiff = coins - curCoins;
    newCoins = curCoins + coinsDiff / settings.scoreChangeTime * timeDiff;
    if (coinsDiff > 0) {
        if (newCoins >= coins) {
            Nodes.coins.innerText = String(coins);
        } else {
            Nodes.coins.innerText = String(Math.floor(newCoins));
        }
    } else {
        if (newCoins <= coins) {
            Nodes.coins.innerText = String(coins);
        } else {
            Nodes.coins.innerText = String(Math.floor(newCoins));
        }
    }
}

class Coin {
    constructor(x, y) {
        this._isVisible = true;
        this._width = tileWidth / 2;
        this._height = tileWidth / 2;
        this._x = x;
        this._y = y;
        this._startY = y;
        this._maxY = y - tileWidth / 2 * 3;
        this._img = loadedImages['coin'];
        this._creationTime = Date.now();

        this.update = function () {
            if (!this._isVisible) return;

            var now = Date.now(),
                newY = this._startY + (this._maxY - this._startY) / settings.dropSpeed * (now - this._creationTime);

            if (newY >= this._maxY) {
                this._y = newY;
            } else {
                this._y = this._maxY;
                this._isVisible = false;
            }
            ctx.drawImage(this._img, this._x, this._y, this._width, this._height);
        }
    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }
}

function bounceCoin() {
    if (bouncingCoin) bouncingCoin.update();
    if (!superTile) return;
    bouncingCoin = new Coin(superTile.x + tileWidth / 4, superTile.y);
    Sounds.coin.play();
    superTile = false;
}