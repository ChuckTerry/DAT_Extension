/**
 * Manages a stopwatch that can be started, paused, and reset.
 */
class Stopwatch {
    constructor() {
        this.loadData().then(() => {
            if (this.isRunning) {
                const currentTime = Date.now();
                const elapsedTimeSinceStart = currentTime - this.startTime;
                this.startTime = currentTime;
                this.elapsedTime += elapsedTimeSinceStart;
                this.interval = setInterval(() => {
                    this.saveData();
                }, 500);
            }
        });
    }

    /**
     * Loads stopwatch data from local storage
     */
    async loadData() {
        const data = await new Promise((resolve) => {
            chrome.storage.local.get(['startTime', 'elapsedTime', 'isRunning'], (data) => {
                resolve(data);
            });
        });
        this.startTime = data.startTime || 0;
        this.elapsedTime = data.elapsedTime || 0;
        this.isRunning = data.isRunning || false;
    }

    /**
     * Pauses the stopwatch.
     */
    pause() {
        if (this.isRunning) {
            const currentTime = Date.now();
            this.elapsedTime += currentTime - this.startTime;
            this.isRunning = false;
            clearInterval(this.interval);
            this.saveData();
        }
    }

    /**
     * Stops and resets the stopwatch.
     */
    reset() {
        clearInterval(this.interval);
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.saveData();
    }

    /**
     * Saves the stopwatch data to local storage.
     */
    async saveData() {
        const { startTime, elapsedTime, isRunning } = this;
        await new Promise((resolve) => {
            chrome.storage.local.set({ startTime, elapsedTime, isRunning }, () => {
                resolve();
            });
        });
    }

    /**
     * Starts the stopwatch.
     */
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now();
            this.isRunning = true;
            this.saveData();
            this.interval = setInterval(() => {
                this.saveData();
            }, 1000);
        }
    }

    /**
     * Toggles the stopwatch between running and paused states.
     */
    toggle() {
        this.isRunning ? this.pause() : this.start();
    }

    /**
     * Calculates the total time elapsed in milliseconds.
     * @returns {number} Time elapsed in milliseconds.
     */
    time() {
        if (this.isRunning) {
            const currentTime = Date.now();
            return this.elapsedTime + (currentTime - this.startTime);
        } else {
            return this.elapsedTime;
        }
    }

}

const stopwatch = new Stopwatch();