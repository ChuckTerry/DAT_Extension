class ProjectsPageTablePositionController {
    constructor(doSwap = false) {
        const [ qualifications, projects, reportTime ] = document.querySelectorAll('.active-table');
        this.qualifications = qualifications;
        this.projects = projects;
        this.reportTime = reportTime;
        this.defaultOrder = true;

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.swapQualificationsProjectsTables === true) {
                if (this.defaultOrder === true) {
                    this.swapTables();
                }
            } else if (request.swapQualificationsProjectsTables === false) {
                if (this.defaultOrder === false) {
                    this.swapTables();
                }
            }
            sendResponse({ received: true });
        });

        if (doSwap) {
            this.swapTables();
        }
    }

    swapTables() {
        if (this.defaultOrder) {
            this.qualifications.before(this.projects);
        } else {
            this.projects.before(this.qualifications);
        }
        this.defaultOrder = !this.defaultOrder;
    }
}
