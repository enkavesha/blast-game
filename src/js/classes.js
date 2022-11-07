class Tile {
    constructor(row, col, color, x, y, scale, booster) {
        this._row = row;
        this._col = col;
        this._isVisible = true;
        this._scale = scale || 1;
        this._width = (tileWidth - 2) * this._scale;
        this._height = (tileHeight - 2) * this._scale;
        this._x = x || tileWidth * this._col + 1 + (tileWidth - this._width) / 2;
        this._y = y || tileHeight * this._row + 1 + (tileHeight - this._height) / 2;
        this._color = color > -1 ? color : Math.floor(Math.random() * settings.levels[level].colorNumber);
        this._img = loadedImages['tile' + this._color];
        this._zoomOut = false;
        this._zoomStartTime = 0;
        this._superBlast = false;
        this._superBlastLiveTime = 1;
        this._booster = false;
        this._bomb = false;
        this._creationTime = Date.now();
        this._startX = this._x;
        this._startY = this._y;
        this._maxX = tileWidth * col + 1 + (tileWidth - this._width) / 2;
        this._maxY = tileHeight * row + 1 + (tileHeight - this._height) / 2;
        this._toRight = this._maxX > this._x;
        this._toBottom = this._maxY > this._y;
        this._isChecked = false;
        this._isMovingX = false;
        this._isMovingY = false;

        this.update = function () {
            if (!this._isVisible) return;

            var now = Date.now();

            if (this._bomb) this._zoomOut = true;

            if (this._zoomOut) {
                if (this._scale > 0) {
                    this._scale = 1 - 1 / settings.zoomOutTime * (now - this._zoomStartTime);
                } else {
                    this._isVisible = false;
                }
            }

            //stay visible while blast
            if (this._superBlast) {
                if (this._superBlastLiveTime > 0) {
                    this._superBlastLiveTime = 1 - 1 / settings.zoomOutTime * (now - this._zoomStartTime);
                } else {
                    this._isVisible = false;
                }
            }

            this._width = (tileWidth - 2) * this._scale;
            this._height = (tileHeight - 2) * this._scale;

            if (this._zoomOut) {
                this._x = tileWidth * col + 1 + (tileWidth - this._width) / 2;
                this._y = tileHeight * row + 1 + (tileHeight - this._height) / 2;
            } else {
                var newX = this._startX + (this._maxX - this._startX) / settings.dropTime * (now - this._creationTime),
                    newY = this._startY + (this._maxY - this._startY) / settings.dropTime * (now - this._creationTime);

                if ((this._toRight && newX <= this._maxX) || (!this._toRight && newX >= this._maxX)) {
                    this._x = newX;
                    this._isMovingX = true;
                } else {
                    this._x = this._maxX;
                    if (this._isMovingX) {
                        this._isChecked = false;
                        this._isMovingX = false;
                    }
                }

                if ((this._toBottom && newY <= this._maxY) || (!this._toBottom && newY >= this._maxY)) {
                    this._y = newY;
                    this._isMovingY = true;
                } else {
                    this._y = this._maxY;
                    if (this._isMovingY) {
                        this._isChecked = false;
                        this._isMovingY = false;
                    }
                }
            }
            if (this._bomb) {
                ctx.drawImage(loadedImages['explosion'], this._x, this._y, this._width, this._height);
            } else if (this._booster) {
                ctx.drawImage(loadedImages['super' + this._booster], this._x - 1, this._y - 1, this._width + 2, this._height + 2);
            } else {
                ctx.drawImage(this._img, this._x, this._y, this._width, this._height);
            }
            if (this._isChecked) {
                ctx.drawImage(loadedImages['checked'], this._x, this._y, this._width, this._height);
            }
        }
        this._booster = booster;
    }

    set row(value) {
        this._row = value;
    }

    set col(value) {
        this._col = value;
    }

    set isVisible(value) {
        this._isVisible = value;
    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }

    set booster(value) {
        this._booster = value;
    }

    set bomb(value) {
        this._bomb = value;
    }

    set zoomOut(value) {
        this._zoomOut = value;
    }

    set zoomStartTime(value) {
        this._zoomStartTime = value;
    }

    set superBlast(value) {
        this._superBlast = value;
    }

    set isChecked(value) {
        this._isChecked = value;
    }

    get row() {
        return this._row;
    }

    get col() {
        return this._col;
    }

    get isVisible() {
        return this._isVisible;
    }

    get color() {
        return this._color;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get booster() {
        return this._booster;
    }

    get isChecked() {
        return this._isChecked;
    }
}

class Coin {
    constructor(x, y) {
        this._isVisible = true;
        this._width = tileWidth / 2;
        this._height = tileWidth / 2;
        this._x = x;
        this._y = y;
        this._startY = y;
        this._maxY = y - tileWidth / 2 * 3;
        this._img = loadedImages['coin'];
        this._creationTime = Date.now();

        this.update = function () {
            if (!this._isVisible) return;

            var now = Date.now(),
                newY = this._startY + (this._maxY - this._startY) / settings.dropTime * (now - this._creationTime);

            if (newY >= this._maxY) {
                this._y = newY;
            } else {
                this._y = this._maxY;
                this._isVisible = false;
            }
            ctx.drawImage(this._img, this._x, this._y, this._width, this._height);
        }
    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }
}