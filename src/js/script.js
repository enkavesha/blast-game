function Game() {
    var settings = {
            rows: 7,
            cols: 5,
            colors: ['#00A676', '#E9E3E6', '#3C91E6', '#393D3F', '#FE6D73'],
            colorNumber: 3,
            minBlastCount: 2,
        },

        Nodes = {
            game: document.getElementById('game'),
            fieldWrapper: document.getElementById('field-wrapper'),
            field: document.getElementById('field'),
        },

        ctx,
        cw,
        ch,
        ctxBounds,
        tiles = [],
        tileSize,
        blastCount;

    this.start = function () {
        init();
        addEventListeners();
    };

    function init() {
        var row, col;

        ctx = Nodes.field.getContext('2d');
        cw = Nodes.fieldWrapper.getBoundingClientRect().width;
        tileSize = cw / settings.cols;
        ch = tileSize * settings.rows;
        Nodes.field.width = cw;
        Nodes.field.height = ch;
        ctxBounds = Nodes.field.getBoundingClientRect();
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, cw, ch);

        for (row = 0; row < settings.rows; row++) {
            if (!tiles[row]) tiles[row] = [];
            for (col = 0; col < settings.cols; col++) {
                generateTile(row, col);
                renderTile(row, col);
            }
        }
    }

    function addEventListeners() {
        Nodes.field.addEventListener('click', function (e) {
            clickTile(e.clientX - ctxBounds.left, e.clientY - ctxBounds.top);
        })
    }

    class Tile {
        constructor(row, col) {
            this._row = row;
            this._col = col;
            this.color = Math.floor(Math.random() * settings.colorNumber);
            this.bgColor = settings.colors[this.color];
        }

        set row(value) {
            this._row = value;
        }

        get row() {
            return this._row;
        }

        get col() {
            return this._col;
        }
    }

    function generateTile(row, col) {
        tiles[row][col] = new Tile(row, col);
    }

    function renderTile(row, col) {
        ctx.fillStyle = tiles[row][col].bgColor;
        ctx.fillRect(tileSize * col, tileSize * row, tileSize, tileSize);
    }

    function clickTile(x, y) {
        var row, col;
        row = Math.floor(y / tileSize);
        col = Math.floor(x / tileSize);

        findArea(row, col);
    }

    function findArea(row, col) {
        var color, blastMatrix, i, j;

        color = tiles[row][col].color;
        blastMatrix = [];
        blastCount = 1;

        for (i = 0; i < settings.rows; i++) {
            if (!blastMatrix[i]) blastMatrix[i] = [];
            for (j = 0; j < settings.cols; j++) {
                blastMatrix[i].push(0);
            }
        }

        blastMatrix[row][col] = 1;

        findMatchingNeighbours(row, col, color, blastMatrix);

        if (blastCount >= settings.minBlastCount) {
            blastArea(blastMatrix);
            setTimeout(function () {
                dropTiles();
                setTimeout(function () {
                    generateNewTiles();
                }, 250)
            }, 250)
        }
    }

    function isMatching(row, col, color, matrix) {
        return (col >= 0 && col < settings.cols && row >= 0 && row < settings.rows) &&
            tiles[row][col].color === color && !matrix[row][col];
    }

    function findMatchingNeighbours(i, j, color, matrix) {
        //top cell
        if (isMatching(i - 1, j, color, matrix)) {
            matrix[i - 1][j] = 1;
            blastCount++;
            findMatchingNeighbours(i - 1, j, color, matrix);
        }
        //left cell
        if (isMatching(i, j - 1, color, matrix)) {
            matrix[i][j - 1] = 1;
            blastCount++;
            findMatchingNeighbours(i, j - 1, color, matrix);
        }
        //right cell
        if (isMatching(i, j + 1, color, matrix)) {
            matrix[i][j + 1] = 1;
            blastCount++;
            findMatchingNeighbours(i, j + 1, color, matrix);
        }
        //bottom cell
        if (isMatching(i + 1, j, color, matrix)) {
            matrix[i + 1][j] = 1;
            blastCount++;
            findMatchingNeighbours(i + 1, j, color, matrix);
        }
    }

    function blastArea(matrix) {
        var row, col;
        for (row = 0; row < settings.rows; row++) {
            for (col = 0; col < settings.cols; col++) {
                if (matrix[row][col]) destroyTile(row, col);
            }
        }
    }

    function destroyTile(row, col) {
        tiles[row][col] = 0;
        ctx.fillStyle = '#000';
        ctx.fillRect(tileSize * col, tileSize * row, tileSize, tileSize);
    }

    function moveTile(row, col, destRow) {
        tiles[destRow][col] = tiles[row][col];
        tiles[destRow][col].row = destRow;
        destroyTile(row, col);
        renderTile(destRow, col);
    }

    function dropTiles() {
        var row, col, prevRow, curRow;
        for (row = settings.rows - 1; row > 0; row--) {
            for (col = 0; col < settings.cols; col++) {
                if (tiles[row][col]) continue;
                prevRow = row - 1;
                curRow = row;
                while (prevRow > -1) {
                    if (!tiles[prevRow][col]) {
                        prevRow--;
                        continue;
                    }
                    moveTile(prevRow, col, curRow);
                    prevRow--;
                    curRow--;
                }
            }
        }
    }

    function generateNewTiles() {
        var row, col;
        for (row = 0; row < settings.rows; row++) {
            for (col = 0; col < settings.cols; col++) {
                if (tiles[row][col]) continue;
                generateTile(row, col);
                renderTile(row, col);
            }
        }
    }

    this.pause = function () {
    };

    this.resume = function () {
    };
}