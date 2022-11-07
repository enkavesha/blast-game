var levelConfig = {
    0: {
        id: 0,
        rows: 10,
        cols: 10,
        minBlastCount: 2,
        moves: 10,
        shuffles: 1,
        bombs: 1,
        bombRadius: 1,
        teleports: 1,
        get colorNumber() {
            return Math.floor(4 + this.id / 2)
        },
        get goal() {
            return 500 + this.id * 50
        },
    },
    1: {
        id: 1,
        rows: 10,
        cols: 10,
        minBlastCount: 2,
        moves: 10,
        shuffles: 1,
        bombs: 1,
        bombRadius: 1,
        teleports: 1,
        get colorNumber() {
            return Math.floor(4 + this.id / 2)
        },
        get goal() {
            return 500 + this.id * 50
        },
    },
    2: {
        id: 2,
        rows: 10,
        cols: 10,
        minBlastCount: 2,
        moves: 10,
        shuffles: 2,
        bombs: 1,
        bombRadius: 1,
        teleports: 1,
        get colorNumber() {
            return Math.floor(4 + this.id / 2)
        },
        get goal() {
            return 500 + this.id * 50
        },
    },
};