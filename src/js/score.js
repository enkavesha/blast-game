function setCounters(moves, score, shuffles, bombs, teleports) {
    movesLeft = moves >= 0 ? moves : settings.levels[level].moves;
    Nodes.movesLeft.innerText = movesLeft;
    Nodes.score.innerText = score || '0';
    if (settings.bonusForCoins) {
        checkAvailableBonuses();
    } else {
        Nodes.shuffles.innerText = shuffles ? shuffles : shufflesLeft;
        Nodes.bombs.innerText = bombs ? bombs : bombsLeft;
        Nodes.teleports.innerText = teleports ? teleports : teleportsLeft;
    }
}

function updateScore() {
    score += blastCount * settings.tilesScoreMultiplier;
    scoreStartTime = Date.now();
    curScore = parseInt(Nodes.score.innerText);
}

function updateCoins(amount) {
    coins += amount;
    coinsStartTime = Date.now();
    curCoins = parseInt(Nodes.coins.innerText);
}

function checkAvailableBonuses() {
    if (coins < settings.cost.shuffles) {
        Nodes.game.classList.add('no-shuffles');
    } else {
        Nodes.game.classList.remove('no-shuffles');
    }
    if (coins < settings.cost.bombs) {
        Nodes.game.classList.add('no-bombs');
    } else {
        Nodes.game.classList.remove('no-bombs');
    }
    if (coins < settings.cost.teleports) {
        Nodes.game.classList.add('no-teleports');
    } else {
        Nodes.game.classList.remove('no-teleports');
    }
}