/**
 * CORDIS DIE // ZULU Clock Module
 * Displays UTC military time in the header.
 */

const clockEl = document.getElementById('clock');

/**
 * Start the ZULU clock — updates every second.
 */
export function startClock() {
    function tick() {
        const d = new Date();
        clockEl.innerText = d.toISOString().split('T')[1].split('.')[0] + ' ZULU';
    }

    tick();
    setInterval(tick, 1000);
}
