export class TaskTracker {

    static #attachTaskPageListeners() {
        
        /* Enter Work Mode Button */
        const enterWorkModeButton = document.querySelector('#enterWorkModeButton');
        const enterWorkModeButtonForm = document.querySelector('#enterWorkModeButton');
        if (enterWorkModeButton && enterWorkModeButtonForm) {
            enterWorkModeButtonForm.addEventListener('click', (event) => {
                if (event.target === enterWorkModeButton) {
                    this.save('Entered Work Mode');
                }
            }, true);
        }
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
         /* Exit Work Mode Button */
         const exitWorkModeButton = document.querySelector('input[value="Exit Work Mode"]');
         const exitWorkModeButtonForm = exitWorkModeButton?.parentElement;
         if (exitWorkModeButton && exitWorkModeButtonForm) {
            exitWorkModeButtonForm.addEventListener('click', (event) => {
                if (event.target === exitWorkModeButton) {
                    this.save('Task Submitted');
                }
            }, true);
         }
    }

    constructor() {
        chrome.storage.sync.get(['taskHistory'], (result) => {
            this.taskHistory = result.taskHistory || [];
        });
        this.loadTime = Date.now();
        this.promptId = this.getPromptId();
        this.projectName = this.getProject();
        this.taskResponseId = this.getTaskResponseId();
    }

    attachListeners() {
        if(location.href.startsWith('https://app.dataannotation.tech/workers/tasks/')) {
            TaskTracker.#attachTaskPageListeners().bind(this)();
        }
        /* Links in the Footer */
        const footerLinks = document.querySelectorAll('.footer > div > p > a');
        const footerLinkCount = footerLinks.length;
        for (let indexc = 0; indexc < footerLinkCount; indexc++) {
            const footerLink = footerLinks[indexc];
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

    getProject() {
        const breadcrumbElement = document.querySelector('div.worker-task > ol > li.breadcrumb-item.active');
        return breadcrumbElement?.innerText || 'Unknown';
    }

    getTaskResponseId() {
        const splitUrlParameters = location.search.split('?task_response_id=')
        if (splitUrlParameters) {
            const string = splitUrlParameters[1];
            return string.includes('&') ? string.split('&')[0] : string;
        }
        return 'Unknown';
    }

    getPromptId() {
        const selectorA = document.querySelector('[data-testid=fields-text] > div > h3 + p ')?.childNodes;
        if (selectorA  && selectorA.length === 3 && selectorA[0].tagName === 'EM') {
            return selectorA[1].textContent;
        }
        return 'Unknown';
    }

    toObject(outcome = 'Unknown') {
        return {
            loadTime: this.loadTime,
            endTime: Date.now(),
            projectName: this.projectName,
            taskResponseId: this.taskResponseId,
            promptId: this.promptId,
            outcome: outcome
        };
    }

    save(reason) {
        this.taskHistory.push(this.toObject(reason));
        chrome.storage.sync.set({ taskHistory: this.taskHistory });
    }
    
}
