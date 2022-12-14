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

    for (row = 0; row < levelConfig[level].rows; row++) {
        for (col = 0; col < levelConfig[level].cols; col++) {
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
    progress = newScore / levelConfig[level].goal * 100;
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
    if ((coinsDiff > 0 && newCoins >= coins) || (coinsDiff <= 0 && newCoins <= coins)) {
        Nodes.coins.innerText = String(coins);
    } else {
        Nodes.coins.innerText = String(Math.floor(newCoins));
    }
}

function bounceCoin() {
    if (bouncingCoin) bouncingCoin.update();
    if (!superTile) return;
    bouncingCoin = new Coin(superTile.x + tileWidth / 4, superTile.y);
    Sounds.coin.play();
    superTile = false;
}