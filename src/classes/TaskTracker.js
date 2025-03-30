export class TaskTracker {

    static #attachTaskPageListeners() {
        /* Submit Task Button */
        const submitButton = document.querySelector('.task-response-submission button[type=submit]');
        const submitButtonUpstreamElement = submitButton?.parentElement?.parentElement;
        if (submitButton && submitButtonUpstreamElement) {
           submitButtonUpstreamElement.addEventListener('click', (event) => {
               if (event.target === submitButton) {
                   this.save('Task Submitted');
               }
           }, true);
        }
        /* Skip Button */
        const skipButton = document.querySelector('#skip_button');
        const skipForm = skipButton?.parentElement;
        if (skipButton && skipForm) {
           skipForm.addEventListener('click', (event) => {
               if (event.target === skipButton) {
                   this.save('Skipped');
               }
           }, true);
        }
    }

    constructor() {
        chrome.storage.local.get(['taskHistory'], (result) => {
            this.taskHistory = result.taskHistory || [];
        });
        this.loadTime = Date.now();
        this.promptId = this.getPromptId();
        this.projectName = this.getProject();
        this.taskResponseId = this.getTaskResponseId();
        this.modelNames = this.getModelNames();
        this.prompt = this.getPrompt();
        this.rigEnterWorkModeButton();
        this.rigExitWorkModeButton();
        this.rigTopNavBar();
    }

    rigEnterWorkModeButton() {
        const originalButton = document.querySelector('#enterWorkModeButton');
        if (originalButton === null) {
            return;
        }
        const riggedButton = document.createElement('input');
        riggedButton.classList.add('mimic-button', 'enter-work-mode');
        riggedButton.id = 'mimic-button-enter-work-mode';
        riggedButton.type = 'button';
        riggedButton.value = 'Enter Work Mode';
        originalButton.type = 'hidden';
        originalButton.parentElement.append(riggedButton);

        riggedButton.addEventListener('click', () => {
            this.taskHistory.push(this.toObject('Entered Work Mode'));
            chrome.storage.local.set({ taskHistory: this.taskHistory })
                .then(() => {
                    riggedButton.type = 'hidden';
                    originalButton.type = 'submit';
                    originalButton.click();
                });
        });
    }

    rigExitWorkModeButton() {
        const originalButton = document.querySelector('[value="Exit Work Mode"]');
        if (originalButton === null) {
            return;
        }
        const riggedButton = document.createElement('input');
        riggedButton.classList.add('mimic-button', 'exit-work-mode');
        riggedButton.id = 'mimic-button-exit-work-mode';
        riggedButton.type = 'button';
        riggedButton.value = 'Exit Work Mode';
        originalButton.type = 'hidden';
        originalButton.parentElement.append(riggedButton);

        riggedButton.addEventListener('click', () => {
            this.taskHistory.push(this.toObject('Exited Work Mode'));
            chrome.storage.local.set({ taskHistory: this.taskHistory })
                .then(() => {
                    riggedButton.type = 'hidden';
                    originalButton.type = 'submit';
                    originalButton.click();
                });
        });
    }

    rigTopNavBar() {
        const workOnProjects = document.querySelector('a[href="/workers/projects"]');
        if (workOnProjects) {
            workOnProjects.href = 'javascript:void(0)';
            workOnProjects.addEventListener('click', () => {
                this.taskHistory.push(this.toObject('NavBar: Work on Projects'));
                chrome.storage.local.set({ taskHistory: this.taskHistory })
                    .then(() => {
                        window.location.href = '/workers/projects';
                    });
            });
        }
        const transferFunds = document.querySelector('a[href="/workers/payments"]');
        if (transferFunds) {
            transferFunds.href = 'javascript:void(0)';
            transferFunds.addEventListener('click', () => {
                this.taskHistory.push(this.toObject('NavBar: Transfer Funds'));
                chrome.storage.local.set({ taskHistory: this.taskHistory })
                    .then(() => {
                        window.location.href = '/workers/payments';
                    });
            });
        }
        const referrals = document.querySelector('a[href="/workers/referrals"]');
        if (referrals) {
            referrals.href = 'javascript:void(0)';
            referrals.addEventListener('click', () => {
                this.taskHistory.push(this.toObject('NavBar: Referrals'));
                chrome.storage.local.set({ taskHistory: this.taskHistory })
                    .then(() => {
                        window.location.href = '/workers/referrals';
                    });
            });
        }
        const inbox = document.querySelector('a[href="/workers/inbox"]');
        if (inbox) {
            inbox.href = 'javascript:void(0)';
            inbox.addEventListener('click', () => {
                this.taskHistory.push(this.toObject('NavBar: Inbox'));
                chrome.storage.local.set({ taskHistory: this.taskHistory })
                    .then(() => {
                        window.location.href = '/workers/inbox';
                    });
            });
        }
    }

    attachListeners() {
        if(location.href.startsWith('https://app.dataannotation.tech/workers/tasks/')) {
            TaskTracker.#attachTaskPageListeners().bind(this)();
        }
        /* Links in the Footer */
        const footerLinks = document.querySelectorAll('.footer > div > p > a');
        const footerLinkCount = footerLinks.length;
        for (let index = 0; index < footerLinkCount; index++) {
            const footerLink = footerLinks[index];
            const linkText = footerLink.innerText;
            footerLink.addEventListener('click', () => {
                this.save(`Navigation via Footer Link "${linkText}"`);
            });
        }
        /* DA Logo (Home Button) */
        const logoHomeLink = document.querySelector('div.navbar > a.navbar-brand');
        if (logoHomeLink) {
            logoHomeLink.addEventListener('click', () => {
                this.save('Navigation via Home Logo');
            });
        }
        /* Links in Top Navbar */
        const navbarLinks = document.querySelectorAll('ul.nav > li > a.nav-link')
        const navbarLinkCount = navbarLinks.length;
        for (let index = 0; index < navbarLinkCount; index++) {
            const navbarLink = navbarLinks[index];
            const linkText = navbarLink.innerText;
            navbarLink.addEventListener('click', () => {
                this.save(`Navigation via Navbar Link "${linkText}"`);
            });
        }
        /* Links in Username Dropdown Menu */
        const userMenu = document.querySelectorAll('ul.nav > li.dropdown > ul.dropdown-menu > a.dropdown-item')
        const userMenuCount = userMenu.length;
        for (let index = 0; index < userMenuCount; index++) {
            const userMenuItem = userMenu[index];
            const linkText = userMenuItem.innerText;
            userMenuItem.addEventListener('click', () => {
                this.save(`Navigation via User Menu Item "${linkText}"`);
            });
        }
    }

    /** @todo Extract logic to reduce arrays over length 2 */
    getModelNames() {
        const strongHeaderNameArray = [...document.querySelectorAll('table > tbody > tr > th > h3 > strong > span')];
        if (strongHeaderNameArray.length > 1) {
            const array = strongHeaderNameArray.map((element) => element.innerText);
            const length = array.length;
            if (length === 2) {
                return array;
            } else {
                const uniqueStrings = new Set();
                for (let index = 0; index < length; index++) {
                    const currentString = array[index];
                    if (currentString?.trim() !== '') {
                        uniqueStrings.add(currentString);
                    }
                }
                const uniqueArray = Array.from(uniqueStrings);
                if (uniqueArray.length === 2) {
                    return uniqueArray;
                }
            }
        }
        const standardResponseNameArray = [...document.querySelectorAll('table > tbody > tr > th > p > span')];
        if (standardResponseNameArray.length > 1) {
            const array = standardResponseNameArray.map((element) => element.innerText);
            const length = array.length;
            if (length === 2) {
                return array;
            } else {
                const uniqueStrings = new Set();
                for (let index = 0; index < length; index++) {
                    const currentString = array[index];
                    if (currentString?.trim() !== '') {
                        uniqueStrings.add(currentString);
                    }
                }
                const uniqueArray = Array.from(uniqueStrings);
                if (uniqueArray.length === 2) {
                    return uniqueArray;
                }
            }
        }
        return ['Unknown', 'Unknown'];
    }

    getProject() {
        const breadcrumbElement = document.querySelector('div.worker-task > ol > li.breadcrumb-item.active');
        return breadcrumbElement?.innerText || 'Unknown';
    }

    getPrompt() {
        const array = [...getElementsByText('Prompt', 'table', false)];
        const possiblePrompts = [];
        const length = array.length;
        for (let index = 0; index < length; index++) {
            const element = array[index];
            const pElements = [...element.querySelectorAll('p')];
            for (let pIndex = 0; pIndex < length; pIndex++) {
                const pElement = pElements[pIndex];
                possiblePrompts.push(pElement.innerText);
            }
        }
        if (possiblePrompts.length === 1) {
            return possiblePrompts[0];
        } else if (possiblePrompts.length === 0) {
            console.debug('TaskTracker unable to locate prompt');
            return 'Unknown';
        } else {
            console.debug('TaskTracker found multiple possible prompts:');
            for (let index = 0; index < length; index++) {
                const prompt = possiblePrompts[index];
                console.debug (`Prompt ${index + 1}: ${prompt}`);
            }
            console.debug('TaskTracker will default to the first prompt.');
            return possiblePrompts[0];
        }
    }

    getPromptId() {
        const selectorA = document.querySelector('[data-testid=fields-text] > div > h3 + p ')?.childNodes;
        if (selectorA  && selectorA.length === 3 && selectorA[0].tagName === 'EM') {
            return selectorA[1].textContent;
        }
        const selectorB = document.querySelector('[data-testid=fields-text] > div > p:first-of-type ');
        if (selectorB && selectorB.innerText.startsWith('Prompt ID: ')) {
            return selectorB.innerText.split('Prompt ID: ')[1];
        }

        const selectorC = document.querySelector('[data-testid=fields-text] > div > p:nth-of-type(2) ');
        if (selectorC?.firstElementChild?.innerText.startsWith('Task ID: ')) {
            return selectorC.innerText.split('Task ID: ')[1];
        }
        return 'Unknown';
    }

    getTaskResponseId() {
        const splitUrlParameters = location.search.split('?task_response_id=')
        if (splitUrlParameters) {
            const string = splitUrlParameters[1];
            return string.includes('&') ? string.split('&')[0] : string;
        }
        return 'Unknown';
    }

    toObject(outcome = 'Unknown') {
        return {
            loadTime: this.loadTime,
            projectName: this.projectName,
            taskResponseId: this.taskResponseId,
            modelNames: this.modelNames,
            prompt: this.prompt,
            promptId: this.promptId,
            outcome: outcome
        };
    }

    save(reason) {
        this.taskHistory.push(this.toObject(reason));
        chrome.storage.local.set({ taskHistory: this.taskHistory });
    }
    
}

function getElementsByText(text, type = '*', caseSensitive = true) {
    if (!caseSensitive) {
        text = text.toUpperCase();
    }
    const allElements = document.querySelectorAll(type);
    const elementCount = allElements.length;
    const elementsWithText = [];
    for (let index = 0; index < elementCount; index++) {
        const element = allElements[index];
        const string = !caseSensitive ? element.textContent.toUpperCase() : element.textContent;
        if (string.includes(text)) {
            elementsWithText.push(element);
        }
    }
    return elementsWithText;
}

function getModelNames() {
	const strongHeaderNameArray = [...document.querySelectorAll('table > tbody > tr > th > h3 > strong > span')];
	if (strongHeaderNameArray.length === 2) {
		return strongHeaderNameArray.map((element) => element.innerText);
	}
	const standardResponseNameArray = [...document.querySelectorAll('table > tbody > tr > th > p > span')];
	if (standardResponseNameArray.length === 2) {
		return standardResponseNameArray.map((element) => element.innerText);
	}
	return ['Unknown', 'Unknown']
}

function getTaskDataFromPage() {
    const [modelNameA, modelNameB] = getModelNames();
    const [responseA, responseB] = [...document.querySelectorAll('.rendered-markdown')].map(element => element.innerText)
    const taskQuestions = [];
    const questions = [...document.querySelectorAll('[id^=question')];
    const questionCount = questions.length;
    for (let questionIndex = 0; questionIndex < questionCount; questionIndex++) {
    	const [questionElement, answerElement] = [...questions[questionIndex].firstChild.children];
        const questionText = questionElement.innerText;
    	const radios = [...answerElement.querySelectorAll('[type=radio]')];
        const radioCount = radios.length;
    	if (radioCount > 0) {
    		const radioAnswer = [];
    		for (let radioIndex = 0; radioIndex < radioCount; radioIndex++) {
    			const radio = radios[radioIndex];
    			if (radio.checked) {
    				const answerText = radio.parentElement.innerText;
    				radioAnswer.push(answerText);
    			}
    		}
    		if (radioAnswer.length > 0) {
    			taskQuestions.push([questionText, radioAnswer.join(' <AND> ')]);
    			continue;
    		}
    	}
    	const checkboxes = [...answerElement.querySelectorAll('[type=checkbox]')];
        const checkCount = checkboxes.length;
    	if (checkCount > 0) {
    		const checkAnswer = [];
    		for (let checkIndex = 0; checkIndex < checkCount; checkIndex++) {
    			const checkbox = checkboxes[checkIndex];
    			if (checkbox.checked) {
    				const answerText = checkbox.parentElement.innerText;
    				checkAnswer.push(answerText);
    			}
    		}
    		if (checkAnswer.length > 0) {
    			taskQuestions.push([questionText, checkAnswer.join(' <AND> ')]);
    			continue;
    		}
    	}
        const text = answerElement.querySelector('textarea');
		if (text) {
			taskQuestions.push([questionText, text?.value ?? '']);
			continue;
		}
		if (radioCount > 0 && checkCount === 0) {
			taskQuestions.push([questionText, 'NO ANSWER SELECTED']);
		} else if (radioCount === 0 && checkCount > 0) {
			taskQuestions.push([questionText, 'NO BOXES CHECKED']);
		} else if (radioCount > 0 && checkCount > 0) {
			// Multi-Modal
			taskQuestions.push([questionText, 'UNANSWERED']);
		} else if (radioCount === 0 && checkCount === 0) {
			// This could be a file upload
			taskQuestions.push([questionText, 'UNSUPPORTED ANSWER TYPE']);
		} 
    }
    
    return {
		modelA: {
			name: modelNameA,
			response: responseA
		},
		modelB: {
			name: modelNameB,
			response: responseB
		},
		questions: taskQuestions
	};
}
