document.querySelectorAll('.slider').forEach(elem => {

    let handle,
        width = elem.offsetWidth,
        slider = noUiSlider.create(elem, {
        start: 60,
        connect: 'lower',
        range: {
            min: 0,
            max: 100
        }
    });

    let point = document.createElement('div');
    point.classList.add('point');

    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' 83');
    elem.appendChild(svg);

    let active = document.createElement('div');
    active.classList.add('active');
    active.appendChild(svg.cloneNode(true));

    elem.appendChild(active);

    let value = document.createElement('div');
    value.classList.add('value');

    point.appendChild(value);

    elem.querySelector('.noUi-handle').appendChild(point);

    let svgPath = new Proxy({
        x: null,
        y: null,
        b: null,
        a: null
    }, {
        set(target, key, value) {
            target[key] = value;
            if(target.x !== null && target.y !== null && target.b !== null && target.a !== null) {
                elem.querySelectorAll('svg').forEach(svg => {
                    svg.innerHTML = getPath([target.x, target.y], target.b, target.a, width)
                });
            }
            return true;
        },
        get(target, key) {
            return target[key];
        }
    });

    setCSSVars(elem);

    slider.on('start', e => {
        handle = elem.querySelector('.noUi-handle');
        elem.querySelector('.noUi-handle').querySelector('.value').textContent = Math.round(e);
    });

    slider.on('update', e => {
        setCSSVars(elem);
        elem.querySelector('.noUi-handle').querySelector('.value').textContent = Math.round(e);
    });

    slider.on('slide', e => {
        setCSSVars(elem);
        elem.querySelector('.noUi-handle').querySelector('.value').textContent = Math.round(e);
    });

    slider.on('end', e => {
        gsap.to(handle, {
            '--y': 0,
            duration: .6,
            ease: 'elastic.out(1.08, .44)'
        });
        gsap.to(svgPath, {
            y: 42,
            duration: .6,
            ease: 'elastic.out(1.08, .44)'
        });
        handle = null;
    });

    svgPath.x = width / 2;
    svgPath.y = 42;
    svgPath.b = 0;
    svgPath.a = width;
    
    let onMove = e => {
        if(handle) {

            let laziness = 4,
                max = 24,
                edge = 52,
                currentLeft = handle.getBoundingClientRect().left - elem.getBoundingClientRect().left,
                handleWidth = handle.offsetWidth,
                handleHalf = handleWidth / 2,
                y = e.clientY - handle.getBoundingClientRect().top - handle.offsetHeight / 2,
                moveY = (y - laziness >= 0) ? y - laziness : (y + laziness <= 0) ? y + laziness : 0,
                modify = 1;

            moveY = (moveY > max) ? max : (moveY < -max) ? -max : moveY;
            modify = ((currentLeft + handleHalf <= edge ? (currentLeft + handleHalf) / edge : 1) * (width - currentLeft - handleWidth <= edge ? (width - currentLeft - handleWidth) / edge : 1));
            modify = modify > 1 ? 1 : modify < 0 ? 0 : modify;

            svgPath.b = currentLeft / 2  * modify;
            svgPath.a = width;
            svgPath.x = currentLeft + handleHalf;
            svgPath.y = moveY * modify + 42;

            handle.style.setProperty('--y', moveY * modify)

        }
    };

    document.addEventListener('pointermove', onMove);

})

function getPoint(point, i, a, smoothing) {
    let cp = (current, previous, next, reverse) => {
            let p = previous || current,
                n = next || current,
                o = {
                    length: Math.sqrt(Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2)),
                    angle: Math.atan2(n[1] - p[1], n[0] - p[0])
                },
                angle = o.angle + (reverse ? Math.PI : 0),
                length = o.length * smoothing;
            return [current[0] + Math.cos(angle) * length, current[1] + Math.sin(angle) * length];
        },
        cps = cp(a[i - 1], a[i - 2], point, false),
        cpe = cp(point, a[i - 1], a[i + 1], true);
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
}

function getPath(update, before, after, width) {
    let smoothing = .16,
        points = [
            [0, 42],
            [before <= 0 ? 0 : before, 42],
            update,
            [after >= width ? width : after, 42],
            [width, 42]
        ],
        d = points.reduce((acc, point, i, a) => i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${getPoint(point, i, a, smoothing)}`, '');
    return `<path d="${d}" />`;
}

function setCSSVars(slider) {
    let handle = slider.querySelector('.noUi-handle');
    slider.style.setProperty('--slider-width', slider.offsetWidth + 'px');
    slider.style.setProperty('--active-width', handle.getBoundingClientRect().left - slider.getBoundingClientRect().left + handle.offsetWidth / 2);
}
