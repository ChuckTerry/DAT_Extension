

/** @typedef {(string|number)} Strumber Represents a union of string and number types */
/** @typedef {string} String-Strumber-0 Index 0 of the String-Strumber tuple */
/** @typedef {Strumber} String-Strumber-1 Index 1 of the String-Strumber tuple */ 
/** @typedef {Array<String-Strumber-0, String-Strumber-1>} String-Strumber Represents a tuple of a string and a strumber */

/**
 * @typedef {Object} HighlightRule Represents a rule for highlighting projects
 * @property {string} regex The regular expression to match against project names
 * @property {String-Strumber} styles An array of style properties and values to apply to matching projects
 */

class ProjectHighlighter {
    /**
     * @type {Symbol} Used internally as a key to clear all styles from an element and its children
     * @private
     */
    #clearAllStylesSymbol;

    /**
     * Creates an instance of ProjectHighlighter.
     * 
     * @constructor
     * @param {Array<HighlightRule>} highlightRules - The rules for highlighting elements.
     * 
     * Initializes the highlighter by applying the highlight rules either immediately
     * if the document is already loaded, or after the DOM content is loaded.
     * 
     * Listens for messages from the Chrome runtime to update highlight rules and 
     * reapply highlighting when rules are updated.
     * 
     * @property {Array<HighlightRule>} highlightRules Array of {@link HighlightRule}s containing the styles to apply.
     * @property {NodeList} projectRows The project rows to apply highlighting to.
     * 
     * @listens chrome.runtime.onMessage Fires when a message is sent from the extension
     * @listens window#DOMContentLoaded Fires when the initial HTML document has been completely loaded and parsed
     */
    constructor(highlightRules) {
        this.#clearAllStylesSymbol = Symbol('clearAllStyles');
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', () => {
                this.doHighlighting(highlightRules);
            });
        } else {
            this.doHighlighting(highlightRules);
        }
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.highlightRulesUpdated === true) {
                this.clearStyles(this.projectRows, this.#clearAllStylesSymbol);
                this.doHighlighting();
            }
            sendResponse({ received: true });
        });
    }

    /**
     * Apply the highlight rules to the project rows.
     * @param {Array<HighlightRule>} highlightRules Array of {@link HighlightRule}s containing the styles to apply.
     */
    doHighlighting(highlightRules) {
        if (highlightRules) {
            this.highlightRules = highlightRules;
            this.projectRows = document.querySelectorAll('tbody tr');
            this.highlightProjectRows();
        } else {
            chrome.storage.sync.get(['highlightRules'], (result) => {
                this.doHighlighting(result.highlightRules);
            });
        }
    }

    /**
     * Clear all styles from the project rows.
     * @param {Symbol} key The key to clear all styles from an element and its children
     */
    clearStyles(key, target = this.projectRows) {
        if (key !== this.#clearAllStylesSymbol) {
            return;
        }
        const elements = target instanceof HTMLElement ? target.children : target;
        // this.applyStylesRecursively(this.projectRows, key);
        const length = elements.length;
        for (let index = 0; index < length; index++) {
            const child = elements[index];
            this.clearStyles(key, child);
            child.style = '';
        }
    }

    /**
     * Highlight the project rows based on the highlight rules.
     */
    highlightProjectRows() {
        const { highlightRules } = this;
        const ruleCount = highlightRules.length;
        for (let ruleIndex = 0; ruleIndex < ruleCount; ruleIndex++) {
            const rule = highlightRules[ruleIndex];
            const matchArray = this.matchRule(rule);
            if (matchArray !== false) {
                const styles = rule.styles;
                const styleCount = styles.length;
                const matchCount = matchArray.length;
                for (let matchIndex = 0; matchIndex < matchCount; matchIndex++) {
                    const row = matchArray[matchIndex];
                    this.applyStylesRecursively(row, styles);
                }
            }
        }
    }

    /**
     * Recursively apply styles to an element and all of its children.
     * @param {HTMLElement} element The element to apply styles to
     * @param {Array<String-Strumber>} styles Array of style properties and values to apply to the element
     * @throws {TypeError} If the first argument is not an instance of HTMLElement
     * @throws {TypeError} If the second argument is not an array of {@link String-Strumber} tuples
     */
    applyStylesRecursively(element, styles) {
        if (styles !== this.#clearAllStylesSymbol && element instanceof HTMLElement === false) {
            if (element instanceof SVGElement) {
                return;
            }
            throw new TypeError('ProjectHighlighter: applyStylesRecursively() must be passed an instance of HTMLElement as the first argument');
        }
        const children = element.children;
        const childCount = children.length;
        for (let index = 0; index < childCount; index++) {
            const child = children[index];
            this.applyStylesRecursively(child, styles);
            if (Array.isArray(styles)) {
                const styleCount = styles.length;
                for (let styleIndex = 0; styleIndex < styleCount; styleIndex++) {
                    const [ property, value ] = styles[styleIndex];
                    child.style[property] = value;
                }
            } else if (styles === this.#clearAllStylesSymbol) {
                child.style = '';
            } else {
                throw new TypeError('ProjectHighlighter: applyStylesRecursively() requires the second argument to be of type Array<[string, number | string]>');
            }
        }
    }

    /**
     * Match the project rows against a highlight rule.
     * @param {HighlightRule} rule The rule to match against project names
     * @returns {Array<HTMLElement>|boolean} An array of matched project rows, or false if no matches are found
     */
    matchRule(rule) {
        const { projectRows } = this;
        const rowCount = projectRows.length;
        const matchedRules = [];
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            const row = projectRows[rowIndex];
            const projectName = row.querySelector('td').innerText;
            if (projectName.includes(rule.regex)) {
                matchedRules.push(row);
            } else {
                const keyAsRegExp = new RegExp(rule.regex, 'gi');
                if (keyAsRegExp.test(projectName)) {
                    matchedRules.push(row);
                }
            }
        }
        return matchedRules.length > 0 ? matchedRules : false;
    }
}

// Below: WIP Code for automatic colour coding via extraction and hashing of project name.

// const extractProjectFamily = (projectName) => {
//   if (!projectName) return "";
//   let projectFamilyRegex = /^(\[.*\]\s*)?(rate and review:\s*)?(\w+)/gim
//   console.log(projectName.match(projectFamilyRegex));
//   let projectFamilyMatch = projectName.match(projectFamilyRegex);
//   let [isPriority, isRateAndReview, projectFamily] = projectFamilyMatch;
//   return projectFamily;
// }

// const generateColorForProjectFamilyName = (projectName) => {

//   //Isolate first word to find project family.
//   let projectFamily = extractProjectFamily(projectName);

//   //Generate a colour based on a hash of the project family.
//   //This should mean that each project family will have a certain auto-generated and stable colour, without manually setting it for every family.

//   let hash = 0;
//   for (let i = 0; i < projectFamily.length; i++) {
//     hash = projectFamily.charCodeAt(i) + ((hash << 5) - hash);
//   }

//   const hue = hash % 360; // Ensure hue is within 0-360
//   const saturation = 80 + (hash % 20); // Some variation in saturation
//   const lightness = 50; // Keep lightness consistent for readability

//   return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
// }
