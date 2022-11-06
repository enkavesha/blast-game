function animateGame() {
    animateTiles();
    animateScore();

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