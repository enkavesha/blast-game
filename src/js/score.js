function setCounters(moves, score, goal, shuffles, bombs) {
    movesLeft = moves >= 0 ? moves : settings.levels[level].moves;
    Nodes.movesLeft.innerText = movesLeft;
    Nodes.score.innerText = score || '0';
    Nodes.goal.innerText = goal || settings.levels[level].goal;
    Nodes.shuffles.innerText = shuffles ? shuffles : shufflesLeft;
    Nodes.bombs.innerText = bombs ? bombs : bombsLeft;
}

function updateScore() {
    if (scoreInterval) {
        clearInterval(scoreInterval);
    }
    var curScore = parseInt(Nodes.score.innerText);

    score += blastCount * 10;

    var scoreIncrease = 1,
        scoreDiff = score - curScore,
        interval = settings.scoreChangeTime / scoreDiff;

    if (scoreDiff > settings.scoreChangeTime) {
        interval = 10;
        scoreIncrease = scoreDiff / settings.scoreChangeTime * 10;
    }

    scoreInterval = setInterval(function () {
        curScore += scoreIncrease;
        if (curScore >= score) {
            clearInterval(scoreInterval);
            Nodes.score.innerText = String(score);
            return;
        }
        Nodes.score.innerText = String(Math.floor(curScore));
    }, interval)
}