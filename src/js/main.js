var settings = {
        colors: ['#00A676', '#E9E3E6', '#3C91E6', '#393D3F', '#FE6D73'],
        scoreChangeTime: 500,
        levels: {
            0: {
                rows: 7,
                cols: 5,
                colorNumber: 4,
                minBlastCount: 2,
                moves: 10,
                goal: 300
            }
        }
    },

    Nodes = {
        game: document.getElementById('game'),
        fieldWrapper: document.getElementById('field-wrapper'),
        field: document.getElementById('field'),
        score: document.getElementById('score'),
        movesLeft: document.getElementById('moves-left'),
        goal: document.getElementById('goal'),
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
    controlsDisabled = false;

function start() {
    createField();
    setCounters();
    addEventListeners();
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
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, cw, ch);

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
}