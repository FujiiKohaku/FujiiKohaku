(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const options = ['sunny', 'light-snow', 'heavy-snow'];
    // URL parameters allow previewing every combination without adding controls to the site.
    const params = new URLSearchParams(location.search);
    const requestedWeather = params.get('weather');
    const weather = options.includes(requestedWeather) ? requestedWeather : options[Math.floor(Math.random() * options.length)];
    const requestedTime = params.get('time');
    const fixedTime = ['morning', 'day', 'night'].includes(requestedTime) ? requestedTime : null;
    hero.dataset.weather = weather;
    hero.querySelectorAll('.snowflake').forEach(flake => flake.remove());
    function updateTime() {
        const hour = new Date().getHours();
        hero.dataset.time = fixedTime || (hour >= 5 && hour < 11 ? 'morning' : hour >= 11 && hour < 18 ? 'day' : 'night');
    }
    const random = (min, max) => min + Math.random() * (max - min);
    function makeLayer(className) {
        const layer = document.createElement('div');
        layer.className = `weather-layer ${className}`;
        layer.setAttribute('aria-hidden', 'true');
        hero.prepend(layer);
        return layer;
    }
    const stars = makeLayer('weather-stars');
    for (let i = 0; i < 75; i++) {
        const star = document.createElement('i');
        star.className = 'weather-star';
        star.style.cssText = `--left:${random(0,100)}%;--top:${random(0,65)}%;--size:${random(1,2.5)}px;--opacity:${random(.35,.9)};--delay:${random(-4,0)}s`;
        stars.append(star);
    }
    const snow = makeLayer('weather-snowfall');
    const heavy = weather === 'heavy-snow';
    const count = weather === 'sunny' ? 0 : heavy ? 85 : 18;
    for (let i = 0; i < count; i++) {
        const flake = document.createElement('span');
        flake.className = 'weather-snow';
        flake.textContent = i % 4 === 0 ? '❄' : '•';
        const duration = heavy ? random(4,8) : random(10,18);
        flake.style.cssText = `--left:${random(-5,100)}%;--top:${random(0,100)}%;--size:${random(heavy ? 9 : 5,heavy ? 23 : 15)}px;--opacity:${random(.35,.85)};--duration:${duration}s;--delay:${random(-duration,0)}s;--drift:${heavy ? random(60,160) : random(-25,35)}px`;
        snow.append(flake);
    }
    function updateDistance() { hero.style.setProperty('--fall-distance', `${hero.clientHeight + 50}px`); }
    updateDistance();
    updateTime();
    window.addEventListener('resize', updateDistance);
    setInterval(updateTime, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updateTime(); });
})();
