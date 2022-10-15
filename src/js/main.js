var settings = {
        colors: ['#00A676', '#E9E3E6', '#3C91E6', '#393D3F', '#FE6D73'],
        scoreChangeTime: 500,
        levelNumber: 3,
        levels: {
            0: {
                id: 0,
                rows: 7,
                cols: 5,
                minBlastCount: 2,
                moves: 10,
                shuffles: 1,
                get colorNumber() {
                    return Math.floor(4 + this.id / 2)
                },
                get goal() {
                    return 300 + this.id * 40
                },
            },
            1: {
                id: 1,
                rows: 7,
                cols: 5,
                minBlastCount: 2,
                moves: 10,
                shuffles: 1,
                get colorNumber() {
                    return Math.floor(4 + this.id / 2)
                },
                get goal() {
                    return 300 + this.id * 40
                },
            },
            2: {
                id: 2,
                rows: 7,
                cols: 5,
                minBlastCount: 2,
                moves: 10,
                shuffles: 2,
                get colorNumber() {
                    return Math.floor(4 + this.id / 2)
                },
                get goal() {
                    return 300 + this.id * 40
                },
            },
        }
    },

    Nodes = {
        game: document.getElementById('game'),
        fieldWrapper: document.getElementById('field-wrapper'),
        field: document.getElementById('field'),
        score: document.getElementById('score'),
        movesLeft: document.getElementById('moves-left'),
        goal: document.getElementById('goal'),
        shuffles: document.getElementById('shuffles-left'),
        nextButton: document.getElementById('next-button'),
        retryButton: document.getElementById('retry-button'),
        restartButton: document.getElementById('restart-button'),
        shuffleButton: document.getElementById('shuffle-button'),
    },

    ctx,
    cw,
    ch,
    ctxBounds,
    tiles = [],
    tileSize,
    blastCount,
    level = 0,
    score = 0,
    scoreInterval,
    movesLeft,
    shufflesLeft,
    controlsDisabled = false;

function start() {
    startLevel();
    addEventListeners();
}

function startLevel() {
    if (tiles.length > 0) {
        blastArea(null, true);
    }
    score = 0;
    shufflesLeft = settings.levels[level].shuffles;
    createField();
    setCounters();
    Nodes.game.classList.remove('win', 'lose', 'super-win', 'no-shuffles');
    controlsDisabled = false;
}

function createField() {
    var row, col;

    ctx = Nodes.field.getContext('2d');
    cw = Nodes.fieldWrapper.getBoundingClientRect().width;
    tileSize = cw / settings.levels[level].cols;
    ch = tileSize * settings.levels[level].rows;
    Nodes.field.width = cw;
    Nodes.field.height = ch;
    ctxBounds = Nodes.field.getBoundingClientRect();

    for (row = 0; row < settings.levels[level].rows; row++) {
        if (!tiles[row]) tiles[row] = [];
        for (col = 0; col < settings.levels[level].cols; col++) {
            generateTile(row, col);
            renderTile(row, col);
        }
    }
}

function addEventListeners() {
    Nodes.field.addEventListener('click', function (e) {
        if (controlsDisabled) return;
        clickTile(e.clientX - ctxBounds.left, e.clientY - ctxBounds.top);
    })

    Nodes.nextButton.addEventListener('click', function () {
        startLevel();
    })
    Nodes.retryButton.addEventListener('click', function () {
        startLevel();
    })
    Nodes.restartButton.addEventListener('click', function () {
        startLevel();
    })
    Nodes.shuffleButton.addEventListener('click', function () {
        if (controlsDisabled) return;
        shuffleField();
    })
}