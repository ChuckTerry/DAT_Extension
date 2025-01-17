function stopWatchOverlay(hidden = false) {
    const container = document.createElement('div');
    container.classList.add('stopwatch-container');
    if (hidden) {
        container.classList.add('hidden');
    }
    const timerExt = document.createElement('div');
    timerExt.classList.add('timer', 'timer-ext');
    container.append(timerExt);

    const display = document.createElement('p');
    display.id = 'display';
    display.innerText = '00:00:00';
    timerExt.append(display);

    const buttons = document.createElement('div');
    buttons.classList.add('buttons');
    timerExt.append(buttons);

    document.body.append(container);

    // Styling for the timer element
    const styles = document.createElement('style');
    styles.textContent = `
        .stopwatch-container {
            position: fixed;
            right: 10px;
            top: 100px;
            transition: top 0.4s;
        }

        .timer-ext{
            position: absolute;
            padding: 4px;
            border-radius: 5px;
            border: solid black 2px;
        }

        #display{
            margin: 0;
        }
    `;
    document.head.append(styles);

    chrome.storage.local.get(['startTime', 'isRunning', 'elapsedTime'], (data) => {
        const { elapsedTime, startTime, isRunning } = data;
        stopwatch.elapsedTime = elapsedTime || stopwatch.elapsedTime;
        stopwatch.startTime = startTime || stopwatch.startTime;
        stopwatch.isRunning = isRunning || stopwatch.isRunning;
        updateTimer();
    });

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace === 'local') {
            const { elapsedTime, startTime, isRunning } = changes;
            stopwatch.elapsedTime = elapsedTime ? elapsedTime.newValue : stopwatch.elapsedTime;
            stopwatch.startTime = startTime ? startTime.newValue : stopwatch.startTime;
            stopwatch.isRunning = isRunning ? isRunning.newValue : stopwatch.isRunning;
        }
    });

    updateTimer();
    // Height of navbar excluding padding
    const navbarHeight = document.querySelector('.navbar').clientHeight;
    const tableHeaderArray = [...document.querySelectorAll('.thead')];
    // The height of the tallest table header
    const tableHeaderHeight = tableHeaderArray.reduce((accumulator, element) => {
        return Math.max(element.getBoundingClientRect().height, accumulator);
    }, 0);
    // Because the timer has no inherent height, we use the height of the first child
    const timerHeight = container.firstChild.getBoundingClientRect().height;

    window.addEventListener('scroll', function () {
        if (window.scrollY < navbarHeight) {
            container.style.top = `${navbarHeight - window.scrollY + 50}px`;
        } else {
            // Same as before, but withe the y value of the timer
            const timerY = container.firstChild.getBoundingClientRect().y;
            // The y values of our table headers
            const yValues = tableHeaderArray.map((element) => element.getBoundingClientRect().y);
            const length = yValues.length;
            const max = 10 + timerHeight + tableHeaderHeight;
            for (let index = 0; index < length; index++) {
                const y = yValues[index];
                if (y < 1) {
                    // Assume the header is stuck to the top, place the top value 10px below it.
                    container.style.top = `${tableHeaderHeight + timerHeight + 10}px`;
                    continue;
                }
                // If the top of the header is below the bottom of the timer, skip it
                if (y > timerY + timerHeight) continue;
                // If the bottom of the header is above the top of the timer, skip it
                if (y + tableHeaderHeight < timerY) continue;
                // Position the timer below the header when covered
                if (timerY < 10 + timerHeight + tableHeaderHeight) {
                    container.style.top = `${y + tableHeaderHeight + timerHeight + 10}px`;
                    // Position the timer above the header when possible (Convenient fallback)
                } else {
                    container.style.top = `${navbarHeight + timerHeight + 10}px`;
                }
            }
        }
    });
}

function updateTimer() {
    const formattedTime = formatTime(stopwatch.time());
    // Throttle DOM updates to improve performance
    if (display.innerText !== formattedTime) {
        display.innerText = formattedTime;
    }
    window.requestAnimationFrame(updateTimer);
}

chrome.storage.sync.get(['stopWatchOverlay'], (response) => {
    stopWatchOverlay(!response.stopWatchOverlay);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.stopwatchOverlay === true) {
        document.querySelector('.stopwatch-container').classList.remove('hidden');
    } else if (request.stopwatchOverlay === false) {
        document.querySelector('.stopwatch-container').classList.add('hidden');
    }
    sendResponse({ received: true });
});
