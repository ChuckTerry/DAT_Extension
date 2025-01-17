/**
 * Animates page changes within the popup using sliding transitions
 * @param {HTMLElement} element The element to animate
 * @param {number} targetRight The target right position of the element
 * @param {number} targetWidth The target width of the element
 * @returns {void}
 */
function animatePageChange(element, targetRight, targetWidth) {
    const style = element.style;
    const currentRight = parseInt(style.right, 10);
	const currentWidth = parseInt(style.width, 10);
    if (currentRight !== targetRight) {
		const increment = currentRight < targetRight ? 10 : -10;
		element.style.right = `${currentRight + increment}px`;
	} else if (currentWidth !== targetWidth) {
		element.style.transition = 'width 0.5s';
		element.style.width = targetWidth + 'px';
		return;
	}
    requestAnimationFrame(() => animatePageChange(element, targetRight, targetWidth));
}

/**
 * Convert key press values to more readable values for the user
 * Ran just before it is displayed to user, data is stored raw computer readable
 * @param {string[]} pressedKeys The keys pressed in the shortcut
 * @returns {string[]} The keys pressed in the shortcut in a human-readable format
 */
function readableKeys(pressedKeys) {
    const specialKeys = {
        CONTROL: 'CTRL',
        SHIFT: 'SHFT'
    };
    const array = [];
    const length = pressedKeys.length;
    for (let index = 0; index < length; index++) {
        const key = pressedKeys[index];
        if (specialKeys[key]) {
            array.push(specialKeys[key]);
        } else {
            array.push(key);
        }
    }
    return array;
}

function fancyKeys(pressedKeys) {
    const wrapper = document.createElement('div');
    const firstKey = document.createElement('span');
    firstKey.classList.add('keyboard-key');
    firstKey.innerText = pressedKeys.shift();
    wrapper.append(firstKey);
    const keyCount = pressedKeys.length;
    for (let index = 0; index < keyCount; index++) {
        const key = pressedKeys[index];
        const separator = document.createElement('span');
        separator.innerText = '+';
        const keySpan = document.createElement('span');
        keySpan.classList.add('keyboard-key');
        keySpan.innerText = key;
        wrapper.append(separator, keySpan);
    }
    return wrapper.childNodes;
}

/**
 * Records keys pressed to hold shortcut
 * @param {Event} event The event object
 * @returns {boolean} Prevents default behavior
 */
function recordKeyCombination(event) {
    event.preventDefault();
    const key = event.key.toUpperCase();
    const shortcutDisplay = document.getElementById('shortcut-display');
    if (!keysPressed.includes(key) && (key === 'CONTROL' || key === 'ALT' || key === 'SHIFT')) {
        keysPressed.push(key);
        removeAllChildren(shortcutDisplay);
        shortcutDisplay.append(...fancyKeys(readableKeys(keysPressed)));
        const stillRecordingSpan = document.createElement('span');
        stillRecordingSpan.innerText = ' + ...';
        shortcutDisplay.append(stillRecordingSpan);
    } else if (keysPressed.length > 0 && !['CONTROL', 'ALT', 'SHIFT'].includes(key)) {
        keysPressed.push(key);
        removeAllChildren(shortcutDisplay);
        shortcutDisplay.append(...fancyKeys(readableKeys(keysPressed)));
        stopRecording();
    }
	return false;
}

/**
 * Stops recording for key combination
 * @returns {boolean} Prevents default behavior
 */
function stopRecording() {
    document.removeEventListener('keydown', recordKeyCombination);
    document.removeEventListener('keyup', stopRecording);
    if (keysPressed.length > 0) {
        const newShortcut = readableKeys(keysPressed).join(' + ');
        document.getElementById('shortcut-display').value = newShortcut;
        Storage.set({shortcut: keysPressed});
    }
    keysPressed = [];
	return false;
}

/**
 * Toggles dark mode styling
 * @param {boolean} active Whether dark mode should be turned on or off
 */
function toggleDarkMode(active) {
    const darkModeStatus = { darkMode: active };
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, darkModeStatus);
    });
}

/**
 * Updates button text based on stopwatch state
 */
function updateTimerToggle(){
    const timerToggle = document.querySelector('#toggle-button');
    if (stopwatch.isRunning) {
        timerToggle.innerText ='Pause';
        timerToggle.classList.remove('button-success');
    } else {
        timerToggle.innerText ='Start';
        timerToggle.classList.add('button-success');
    }
}

/**
 * Updates the stopwatch timer. Throttled to prevent excessive updates
 */
function updateTime() {
    const formatted = formatTime(stopwatch.time());
    if (display.innerText !== formatted) {
        display.innerText = formatted;
    }
    window.requestAnimationFrame(updateTime);
}

// Update timer immediately to ensure accurate display
const display = document.getElementById('display');
updateTime();
 
document.addEventListener('DOMContentLoaded', () => {
    const darkMode = document.getElementById('dark-mode');
    const filterProjects = document.getElementById('sort-pay');
    const resetShortcutButton = document.getElementById('reset-shortcut');
    const shortcutDisplay = document.getElementById('shortcut-display');
    const setShortcutButton = document.querySelector('#set-shortcut');
    const sortQualifications = document.querySelector('#sort-qualifications');
    const stopWatchOverlay = document.getElementById('stopwatch-overlay');
    const timerReset= document.getElementById('reset-button');
    const timerToggle = document.getElementById('toggle-button');
    const swapProjectsQualifications = document.querySelector('#swap-table-positions');
    updateTimerToggle();
    
    timerToggle.addEventListener('click', () => {
        stopwatch.toggle();
        updateTimerToggle();
		return false;
    });

    timerReset.addEventListener('click', () => {
        stopwatch.reset();
        updateTimerToggle();
		return false;
    });

    Storage.get(['shortcut', 'sortPay','sortQualifications', 'darkMode', 'stopWatchOverlay'], [['CONTROL', '/'], true, true, false, false])
      .then((result) => {
        
        removeAllChildren(shortcutDisplay);
        shortcutDisplay.append(...fancyKeys(readableKeys(result.shortcut)));
        filterProjects.checked = result.sortPay;
        darkMode.checked = result.darkMode;
		sortQualifications.checked = result.sortQualifications;
        stopWatchOverlay.checked = result.stopWatchOverlay;
      });
      
    // Listen for checkbox to be clicked to affect whether or not to filter projects on main page load
    filterProjects.addEventListener('change', (event) => {
        const value = event.target.checked;
        Storage.set({sortPay: value});
    });

    // Listen for checkbox to be clicked to affect whether or not to filter qualifications on main page load
    sortQualifications.addEventListener('change', (event) => {
        const value = event.target.checked;
        Storage.set({sortQualifications: value});
    });

    // Listen for stopwatch update
    stopWatchOverlay.addEventListener('change', (event) => {
        const value = event.target.checked;
        Storage.set({stopWatchOverlay: value});
        chrome.runtime.sendMessage({stopwatchOverlay: value}, (response) => {});
    });

    // Listen for Table Swap update
    swapProjectsQualifications.addEventListener('change', (event) => {
        const value = event.target.checked;
        Storage.set({swapQualificationsProjectsTables: value});
        chrome.runtime.sendMessage({swapQualificationsProjectsTables: value}, (response) => {});
    });

    // Listen for darkMode to be toggled, update storage
    darkMode.addEventListener('change', (event) => {
        const value = event.target.checked;
        toggleDarkMode(value);
        Storage.set({darkMode: value});
    });

    // Listen for shortcut input to be selected
    setShortcutButton.addEventListener('click', () => {
        window.setTimeout(() => {
            shortcutDisplay.value = 'Recording...';
            document.addEventListener('keydown', recordKeyCombination);
            document.addEventListener('keyup', stopRecording);

        }, 100);
		return false;
    });

    // Reset shortcut value in storage and in UI
    resetShortcutButton.addEventListener('click', () => {
        removeAllChildren(shortcutDisplay);
        shortcutDisplay.append(...fancyKeys(readableKeys(['CTRL', '/'])));
        Storage.set({shortcut: ['CONTROL', '/']});
		return false;
    });

    chrome.storage.sync.get(['highlightRules'], (result) => {
        new HighlightRulesController(result.highlightRules);
    });

    const imageConcatinator = new ImageConcatinator();
});

// Holds keys pressed in series
let keysPressed = [];
const changePage = document.getElementById('move');
let isHomePage = true;
const container = document.querySelector('.container');
container.style.right = 0;
container.style.width = '250px';
changePage.addEventListener('click', () => {
    if (isHomePage) {
        animatePageChange(container, 260, 350);
        changePage.innerText = 'Return';
    } else {
        animatePageChange(container, 0, 250);
        changePage.innerText = 'Rules';
    }
    isHomePage = !isHomePage;
	return false;
});
