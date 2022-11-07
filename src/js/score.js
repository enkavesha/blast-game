function setCounters(moves, score, shuffles, bombs, teleports) {
    movesLeft = moves >= 0 ? moves : settings.levels[level].moves;
    Nodes.movesLeft.innerText = movesLeft;
    Nodes.score.innerText = score || '0';
    checkAvailableBonuses();
    if (!settings.bonusForCoins) {
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
    if (!settings.bonusForCoins && amount < 0) return;
    coins += amount;
    coinsStartTime = Date.now();
    curCoins = parseInt(Nodes.coins.innerText);
}

function checkAvailableBonuses() {
    if ((settings.bonusForCoins && coins < settings.cost.shuffles) || (!settings.bonusForCoins && !shufflesLeft)) {
        Nodes.game.classList.add('no-shuffles');
    } else {
        Nodes.game.classList.remove('no-shuffles');
    }
    if ((settings.bonusForCoins && coins < settings.cost.bombs) || (!settings.bonusForCoins && !bombsLeft)) {
        Nodes.game.classList.add('no-bombs');
    } else {
        Nodes.game.classList.remove('no-bombs');
    }
    if ((settings.bonusForCoins && coins < settings.cost.teleports) || (!settings.bonusForCoins && !teleportsLeft)) {
        Nodes.game.classList.add('no-teleports');
    } else {
        Nodes.game.classList.remove('no-teleports');
    }
}