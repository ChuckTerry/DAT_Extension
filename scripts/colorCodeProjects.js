class ProjectHighlighter {
  constructor(highlightRules) {
    this.highlightRules = highlightRules;
    this.projectRows = document.querySelectorAll('tbody tr');
    if (document.title === 'Extension Preferences') {
      this.addRuleButton = document.querySelector('#addRuleBtn');
      this.saveRulesButton = document.querySelector('#saveRulesBtn');
      this.rulesTable = document.querySelector('#rulesTable');
      this.populateColorRulesTable();
      this.rigListeners();
    } else {
      this.highlightProjectRows();
    }
  }

  rigListeners() {
    this.addRuleButton.addEventListener(() => {
      return this.addRuleRow();
    });
    this.saveRulesButton.addEventListener(() => {
      return this.saveRules();
    });
  }

  addRuleRow(regex = '', color = '#000000') {
    const { rulesTable } = this;
    const row = table.insertRow();
    const phraseCell = row.insertCell();
    const colorCell = row.insertCell();
    const actionCell = row.insertCell();
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('deleteBtn');
    deleteButton.innerText = '\u00D7';
    phraseCell.innerHTML = `<input type="text" value="${regex}">`;
    colorCell.innerHTML = `<input type="color" value="${color}">`;
    actionCell.appendChild(deleteButton);
    deleteButton.addEventListener('click', (event) => {
      this.deleteRuleRow(event);
    });
	  return false;
  }

  deleteRuleRow(event) {
  	const row = event.target.parentNode.parentNode;
  	row.remove();
  }

  highlightProjectRows() {
    const { highlightRules } = this;
    const ruleCount = highlightRules.length;
    for (let ruleIndex = 0; ruleIndex < ruleCount; ruleIndex++) {
      const rule = highlightRules[ruleIndex];
      const matchArray = this.matchRule(rule);
      if (matchArray !== false) {
        const matchCount = matchArray.length;
        for (let matchIndex = 0; matchIndex < matchCount; matchIndex++) {
          const row = matchArray[matchIndex];
          row.style.backgroundColor = rule.color;
        }
      }
    }
  }

  matchRule(rule) {
    const { projectRows } = this;
    const rowCount = projectRows.length;
    const matchedRules = [];
    for (let rowIndex = 0; index < rowCount; index++) {
      const row = projectRows[rowIndex];
      if (projectName.includes(key)) {
        matchedRules.push(row);
      } else {
        const keyAsRegExp = new RegExp(key, 'gi');
        if (keyAsRegExp.test(projectName)) {
          matchedRules.push(row);
        }
      }
    }
    return matchedRules.length > 0 ? matchedRules : false;
  }

  populateColorRulesTable() {
    const { highlightRules } = this;
	  const ruleCount = highlightRules.length;
  	for (let index = 0; index < ruleCount; index++) {
    	const rule = highlightRules[index];
  		this.addRuleRow(rule.regex, rule.color);
  	}
  }

  saveRules() {
    const { rulesTable } = this;
    const ruleCount = rulesTable.length;
    const rules = [];
    for (let index = 1; index < ruleCount; index++) { // start from 1 to skip header
        const row = table.rows[index];
        const regex = row.cells[0].firstChild.value;
        const color = row.cells[1].firstChild.value;
        rules.push({ regex, color });
    }
    Storage.set({ 'highlightRules': rules })
      .then(() => this.toastSaveMessage('Rules saved successfully!'))
      .catch((error) => this.toastSaveMessage('Error saving rules: ' + error));
  	return false;
  }

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


chrome.storage.sync.get(['highlightRules'], (result) => {
  new ProjectHighlighter(result.highlightRules);
});

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

