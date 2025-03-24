class HighlightRuleSet {
    constructor(controller, regex, rules) {
        this.controller = controller;
        this.regex = regex;
        this.rules = rules;
        this.ruleMap = new Map();
        this.backdrop = document.querySelector('#rule-backdrop');
        this.modal = document.querySelector('#rule-styles-modal');
        this.buildStyleTable();
        this.parseRules();
        this.modal.appendChild(this.table);
    }

    addRuleRow(property = '', value = '') {
        if (this.ruleMap.has(property)) {
            return this.ruleMap.get(property);
        }
        const row = this.table.tBodies[0].insertRow();
        const propertyCell = row.insertCell();
        const propertyElement = document.createElement('input');
        propertyElement.type = 'text';
        propertyElement.value = property;
        propertyCell.appendChild(propertyElement);

        const valueCell = row.insertCell();
        const valueElement = document.createElement('input');
        valueElement.type = 'text';
        valueElement.value = value;
        valueCell.appendChild(valueElement);

        const removeCell = row.insertCell();
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.classList.add('button', 'button-warning');
        removeButton.innerText = '\u2716'; // ✖
        removeButton.addEventListener('click', () => {
            row.remove();
            this.ruleMap.delete(property);
        });
        removeCell.appendChild(removeButton);
        return row;
    }

    buildStyleTable() {
        const table = document.createElement('table');
        table.classList.add('hidden');
        // Table Header
        const thead = document.createElement('thead');
        const headerRow = thead.insertRow();
        const propertyHeader = document.createElement('th');
        propertyHeader.innerText = 'Property';
        headerRow.appendChild(propertyHeader);
        const valueHeader = document.createElement('th');
        valueHeader.innerText = 'Value';
        headerRow.appendChild(valueHeader);
        const removeHeader = document.createElement('th');
        removeHeader.innerText = '\u2716'; // ✖
        headerRow.appendChild(removeHeader);
        table.appendChild(thead);
        // Table Body (Rows generated dynamically using addRuleRow())
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        // Table Footer is just the UI control buttons
        const tfoot = document.createElement('tfoot');
        const controlRow = tfoot.insertRow();
        const controlsCell = controlRow.insertCell();
        controlsCell.colSpan = 3;
        // Add Style Button (Creates a new row)
        const addButton = document.createElement('button');
        addButton.classList.add('button', 'button-success');
        addButton.innerText = 'Add Style';
        addButton.addEventListener('click', () => {
            this.addRuleRow();
        });
        controlsCell.appendChild(addButton);
        // Save Button
        const saveButton = document.createElement('button');
        saveButton.classList.add('button');
        saveButton.innerText = 'Save Styles';
        saveButton.addEventListener('click', () => {
            this.saveEdits();
        });
        controlsCell.appendChild(saveButton);
        // Cancel Button - Reverts changes
        const cancelButton = document.createElement('button');
        cancelButton.classList.add('button', 'button-warning');
        cancelButton.innerText = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.cancelEdits();
        });
        controlsCell.appendChild(cancelButton);
        table.appendChild(tfoot);
        this.table = table;
    }

    cancelEdits() {
        const rows = Array.from(this.table.tBodies[0].rows);
        const rowCount = rows.length;
        for (let index = 0; index < rowCount; index++) {
            rows[index].remove();
        }
        this.rules = this.baseStyles;
        this.ruleMap = new Map();
        this.backdrop.classList.add('hidden');
        this.modal.classList.add('hidden');
        this.table.classList.add('hidden');
        this.parseRules();
    }

    edit() {
        this.backdrop.classList.remove('hidden');
        this.modal.classList.remove('hidden');
        this.table.classList.remove('hidden');
        this.baseStyles = this.getStyleArray();
    }

    getStyleArray() {
        const rows = this.table.tBodies[0].rows;
        const styles = [];
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const property = row.cells[0].firstChild.value;
            const value = row.cells[1].firstChild.value;
            styles.push([property, value]);
        }
        return styles;
    }

    parseRules() {
        const { rules, table } = this;
        const ruleCount = rules.length;
        for (let index = 0; index < ruleCount; index++) {
            const [property, value] = rules[index];
            if (isValidCSSRule(property, value)) {
                this.addRuleRow(property, value);
            }
        }
    }

    saveEdits() {
        this.backdrop.classList.add('hidden');
        this.modal.classList.add('hidden');
        this.table.classList.add('hidden');
        this.controller.saveRules();
    }

    saveRules() {
        this.rules = this.toJSON();
        this.controller.saveRules();
    }

    toggleEdit() {
        this.backdrop.classList.toggle('hidden');
        this.modal.classList.toggle('hidden');
        this.table.classList.toggle('hidden');
    }

    toJSON() {
        const { regex } = this;
        const rows = this.table.tBodies[0].rows;
        const styles = [];
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const property = row.cells[0].firstChild.value;
            const value = row.cells[1].firstChild.value;
            styles.push([property, value]);
        }
        return { regex, styles };
    }

    updateRule(property, value) {
        if (this.ruleMap.has(property)) {
            const row = this.ruleMap.get(property);
            row.cells[1].innerText = value;
        }
    }
}
