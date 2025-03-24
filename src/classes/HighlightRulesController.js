/**
     * Manages all sets of {@link HighlightRule}s which may be applied to the current page,
     * providing methods to create, delete, parse, and save rules. Each rule contains a regular
     * expression and one or more style definitions.
 */
class HighlightRulesController {
    /**
     * @constructor
     * @param {Array<HighlightRule>} highlightRules An array of highlight rules.
     * 
     * @property {Array<HighlightRule>} highlightRules Stores the highlight rules.
     * @property {Map} rowMap Maps table rows to their associated rule sets.
     * @property {HTMLElement} rulesTable The table element used for displaying highlight rules.
     * @property {HTMLElement} addRuleButton The button element for adding new highlight rules.
     * @property {HTMLElement} saveRulesButton The button element for saving the current highlight rules.
     * 
     * @listens click Adds a new rule row when the addRuleButton is clicked.
     * @listens click Saves the rules when the saveRulesButton is clicked.
     */
    constructor(highlightRules) {
        this.highlightRules = highlightRules;
        this.rowMap = new Map();
        this.rulesTable = document.querySelector('#rules-table');
        this.addRuleButton = document.querySelector('#add-rule-button');
        this.addRuleButton.addEventListener('click', () => {
            return this.addRuleRow();
        });
        this.saveRulesButton = document.querySelector('#save-rules-button');
        this.saveRulesButton.addEventListener('click', () => {
            return this.saveRules();
        });
        this.parseRules();
    }

    /**
     * Adds a new rule row to the rules table.
     *
     * @param {HighlightRule} [rule={regex: '', styles: []}] - The rule object containing regex and styles.
     * @returns {HTMLTableRowElement} The newly created table row element.
     * 
     * @listens click Opens the rule editor when the style button is clicked.
     * @listens click Deletes the rule row when the delete button is clicked.
     */
    addRuleRow(rule = { regex: '', styles: [] }) {
        const { regex, styles } = rule;
        const { rulesTable } = this;
        const ruleSet = new HighlightRuleSet(this, regex, styles);
        const row = rulesTable.insertRow();
        this.rowMap.set(row, ruleSet);
        const phraseCell = row.insertCell();
        const phraseElement = document.createElement('input');
        phraseElement.type = 'text';
        phraseElement.value = regex;
        phraseCell.appendChild(phraseElement);

        const styleCell = row.insertCell();
        const styleButton = document.createElement('button');
        styleButton.classList.add('style-button', 'button');
        styleButton.innerText = '\u270E'; // ✎
        styleButton.title = 'Modify Styling';
        styleCell.appendChild(styleButton);
        styleButton.addEventListener('click', (event) => {
            ruleSet.edit();
        });

        const actionCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button', 'button', 'button-warning');
        deleteButton.innerText = '\u2716'; // ✖
        actionCell.appendChild(deleteButton);
        deleteButton.addEventListener('click', (event) => {
            this.deleteRuleRow(event);
        });
        return row;
    }

    /**
     * Deletes a rule row from the rules table.
     * 
     * @param {Event} event The event object triggered by the delete button.
     */
    deleteRuleRow(event) {
        const row = event.target.parentNode.parentNode;
        this.rowMap.delete(row);
        row.remove();
    }

    /**
     * Parses the highlight rules and adds them to the rules table.
     */
    parseRules() {
        const { highlightRules } = this;
        if (!highlightRules) {
            return;
        }
        const ruleCount = highlightRules.length;
        for (let index = 0; index < ruleCount; index++) {
            const rule = highlightRules[index];
            const row = this.addRuleRow(rule);
        }
    }

    /**
     * Populates the color rules table with highlight rules.
     */
    populateColorRulesTable() {
        const { highlightRules } = this;
        const ruleCount = highlightRules.length;
        for (let index = 0; index < ruleCount; index++) {
            const rule = highlightRules[index];
            this.addRuleRow(rule.regex, rule.color);
        }
    }

    /**
     * Saves the highlight rules to chrome storage.
     * 
     * @returns {boolean} Always returns false to prevent default form submission.
     */
    saveRules() {
        const { rulesTable } = this;
        const ruleCount = rulesTable.tBodies[0].rows.length;
        const rules = [];
        // Start from 1 to skip header row
        for (let index = 1; index < ruleCount; index++) {
            const row = this.rulesTable.rows[index];
            const regex = row.cells[0].firstChild.value;
            const ruleset = this.rowMap.get(row);
            const styles = ruleset.getStyleArray();
            rules.push({ regex, styles });
        }
        chrome.storage.sync.set({ 'highlightRules': rules })
            .then(() => this.toastSaveMessage('Rules saved successfully!'))
            .catch((error) => this.toastSaveMessage('Error saving rules: ' + error));
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { highlightRulesUpdated: true });
        });
        return false;
    }

    /**
     * Displays a toast message indicating the result of saving rules.
     * 
     * @param {string} message The message to display in the toast.
     */
    toastSaveMessage(message) {
        const container = this.saveRulesButton.parentElement;
        const element = document.createElement('p');
        element.classList.add("toast-message");
        element.innerText = message;
        container.insertAdjacentElement('afterend', element);
        window.setTimeout(() => {
            element.remove();
        }, 2500);
    }
}
