class TaskSkipper {
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

    async init() {
        chrome.storage.sync.get(['shortcut'], (result) => {
            this.shortcut = result.shortcut || ["CONTROL", "/"];
        });
        this.skipButton = document.querySelector("#skip_button");
        document.addEventListener('keydown', () => {
            this.recordKeyCombination();
        });
        document.addEventListener('keyup', () => {
            this.stopRecording();
        });
    }

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
            stopRecording();
        }
    }

    skip() {
        if (!this.skipButton) {
            console.debug("Task Not skippable, or no skip button detected");
        } else {
            this.skipButton.click();
        }
    }

    stopRecording() {
        this.keysPressed = [];
    }
}
