class ProjectHighlighter {
    constructor(highlightRules) {
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', () => {
                this.doHighlighting(highlightRules);
            });
        } else {
            this.doHighlighting(highlightRules);
        }
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.highlightRulesUpdated === true) {
                this.clearStyles();
                this.doHighlighting();
            }
            sendResponse({ received: true });
        });
    }

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

    clearStyles() {
        const { projectRows } = this;
        const rowCount = projectRows.length;
        for (let index = 0; index < rowCount; index++) {
            const row = projectRows[index];
            row.style = '';
            const cells = [...row.children];
            const cellCount = cells.length;
            for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
                const cell = cells[cellIndex];
                cell.style = '';
            }
        }
    }

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

    applyStylesRecursively(element, styles) {
        const children = element.children;
        const childCount = children.length;
        for (let index = 0; index < childCount; index++) {
            const child = children[index];
            this.applyStylesRecursively(child, styles);
            const styleCount = styles.length;
            for (let styleIndex = 0; styleIndex < styleCount; styleIndex++) {
                const style = styles[styleIndex];
                child.style[style[0]] = style[1];
            }
        }
    }

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
