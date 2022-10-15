function setCounters(moves, score, goal) {
    movesLeft = moves >= 0 ? moves : settings.levels[level].moves;
    Nodes.movesLeft.innerText = movesLeft;
    Nodes.score.innerText = score || '0';
    Nodes.goal.innerText = goal || settings.levels[level].goal;
}

function updateScore() {
    if (scoreInterval) {
        clearInterval(scoreInterval);
    }
    var curScore = parseInt(Nodes.score.innerText);

    score += blastCount * 10;

    var scoreDiff = score - curScore,
        interval = settings.scoreChangeTime / scoreDiff;

    scoreInterval = setInterval(function () {
        curScore++;
        Nodes.score.innerText = String(curScore);
        if (curScore === score) {
            clearInterval(scoreInterval);
        }
    }, interval)
}