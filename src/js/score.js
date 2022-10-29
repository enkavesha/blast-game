function setCounters(moves, score, goal, shuffles, bombs, teleports) {
    movesLeft = moves >= 0 ? moves : settings.levels[level].moves;
    Nodes.movesLeft.innerText = movesLeft;
    Nodes.score.innerText = score || '0';
    Nodes.goal.innerText = goal || settings.levels[level].goal;
    Nodes.shuffles.innerText = shuffles ? shuffles : shufflesLeft;
    Nodes.bombs.innerText = bombs ? bombs : bombsLeft;
    Nodes.teleports.innerText = teleports ? teleports : teleportsLeft;
}

function updateScore() {
    score += blastCount * 10;
    scoreStartTime = Date.now();
    curScore = parseInt(Nodes.score.innerText);
}