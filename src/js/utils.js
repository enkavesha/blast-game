(function utils() {
    var isPortrait = true,
        game = document.getElementById('game'),
        hidden = 'hidden';

    function checkOrientation() {
        if (window.innerWidth > window.innerHeight) {
            game.classList.remove('portrait');
            game.classList.add('landscape');
            isPortrait = false;
        } else {
            game.classList.add('portrait');
            game.classList.remove('landscape');
            isPortrait = true;
        }

        if ((isPortrait && (window.innerWidth / window.innerHeight) > 0.67) || (!isPortrait && (window.innerWidth / window.innerHeight) < 1.5)) {
            game.classList.add('tablet');
        } else {
            game.classList.remove('tablet');
        }
    }

    checkOrientation();

    if (hidden in document)
        document.addEventListener('visibilitychange', onchange);
    else if ((hidden = 'mozHidden') in document)
        document.addEventListener('mozvisibilitychange', onchange);
    else if ((hidden = 'webkitHidden') in document)
        document.addEventListener('webkitvisibilitychange', onchange);
    else if ((hidden = 'msHidden') in document)
        document.addEventListener('msvisibilitychange', onchange);
    else if ('onfocusin' in document)
        document.onfocusin = document.onfocusout = onchange;
    else
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

    function onchange(evt) {
        var v = 'visible', h = 'hidden',
            evtMap = {
                focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
            }, type, addclass, removeclass;
        evt = evt || window.event;
        if (evt.type in evtMap) {
            type = evtMap[evt.type];
            document.dispatchEvent(new Event('visibility-' + type));
            addclass = type;
            removeclass = addclass === 'visible' ? 'hidden' : 'visible';
            game.classList.add(addclass);
            game.classList.remove(removeclass);
        } else {
            document.dispatchEvent(new Event('visibility-' + (this[hidden] ? 'hidden' : 'visible')));
            game.classList.add(this[hidden] ? 'hidden' : 'visible');
            game.classList.remove(this[hidden] ? 'visible' : 'hidden');
        }
    }

    if (document[hidden] !== undefined)
        onchange({type: document[hidden] ? 'blur' : 'focus'});

    window.addEventListener('resize', function () {
        checkOrientation();
    });
    window.dispatchEvent(new Event('resize'));
})();