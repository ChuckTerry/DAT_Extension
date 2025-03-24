/**
 * Manages keydown and keyup events on a page, to allow task skipping.
 * Listens for a specific key combination that, when pressed,
 * will skip the current task if the task can be skipped.
 */
class TaskSkipper {
    /**
     * @constructor
     * @property {Array<string>} keysPressed Array of keys currently pressed.
     * @property {Array<string>} shortcut Array of keys that will trigger task skipping.
     * @property {HTMLElement} skipButton Reference to the skip button on the current page.
     * 
     * @listens keydown Records key combinations when keys are pressed.
     * @listens keyup Stops recording key combinations and clears {@link TaskSkipper#keysPressed} when keys are released.
     * @listens load Initializes the task skipper when the page is fully loaded.
     */
    constructor() {
        this.keysPressed = [];
        if (document.readyState === "complete") {
            this.init();
        } else {
            window.addEventListener("load", () => {
                this.init();
            });
        }
    }

    /**
     * Initialize the task skipper by setting up event listeners and loading the shortcut from storage.
     */
    async init() {
        chrome.storage.sync.get(['shortcut'], (result) => {
            this.shortcut = result.shortcut || ["CONTROL", "/"];
        });
        this.skipButton = document.querySelector("#skip_button");
        document.addEventListener('keydown', (event) => {
            this.recordKeyCombination(event);
        });
        document.addEventListener('keyup', () => {
            this.stopRecording();
        });
    }

    /**
     * Records key combinations when keys are pressed.
     * @param {KeyboardEvent} event The keydown event data.
     */
    async recordKeyCombination(event) {
        const { keysPressed } = this;
        const key = event.key.toUpperCase();
        // If key is special command key, put it first
        if (!keysPressed.includes(key) && (key === 'CONTROL' || key === 'ALT' || key === 'SHIFT')) {
            keysPressed.push(key);
        } else if (keysPressed.length > 0 && !['CONTROL', 'ALT', 'SHIFT'].includes(key)) {
            // Add key to observer
            keysPressed.push(key);
            if (keysPressed.join('') === this.shortcut.join('')) {
                event.preventDefault();
                this.skip();
            }
            this.stopRecording();
        }
    }

    /**
     * Skips the current task by clicking the skip button.
     */
    skip() {
        if (!this.skipButton) {
            console.debug("Task Not skippable, or no skip button detected");
        } else {
            this.skipButton.click();
        }
    }

    /**
     * Stops recording key combinations and clears {@link TaskSkipper#keysPressed} when keys are released.
     */
    stopRecording() {
        this.keysPressed = [];
    }
}
