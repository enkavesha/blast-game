/**
 * allows to pause/resume/clear timeout
 * @param callback
 * @param delay
 * @constructor
 */
function Timer(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function () {
        window.clearTimeout(timerId);
        remaining = delay - (Date.now() - start);
    };

    this.resume = function () {
        start = Date.now();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };

    this.clear = function () {
        window.clearTimeout(timerId);
    };

    this.resume();
}