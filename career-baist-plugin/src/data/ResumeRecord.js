export class ResumeRecordExperienceItem {
    constructor() {
        this.company_name = '';
        this.start_date = '';
        this.end_date = '';
        this.role = '';
        this.desc = '';
        this.responsibilities = '';
        this.achievements = '';
    }
};
export class ResumeRecordProjectItem {
    constructor() {
        this.project_name = '';
        this.company_name = '';
        this.start_date = '';
        this.end_date = '';
        this.role = '';
        this.desc = '';
        this.responsibilities = '';
        this.achievements = '';
    }
};
export class ResumeRecord {
    constructor() {
        this.meta = {
            create_date: '',
            id: '',
            nickname: '',
            comment: ''
        };

        this.summary = '';
        this.experiences = [];
        this.projects = [];
    }

    getPureTextForCopying() {
        let result = '';
        result += 'Summary';
        result += "\n";
        result += "\n";
        result += this.summary;
        result += "\n";
        result += "\n";
        result += 'Work Experiences';
        result += "\n";
        result += "\n";
        if (this.experiences && this.experiences.length > 0) {
            this.experiences.forEach(experience_item => {
                result += "Company";
                result += "\n";
                result += experience_item.company_name;
                result += "\n";
                result += "Start Date";
                result += "\n";
                result += experience_item.start_date;
                result += "\n";
                result += "End Date";
                result += "\n";
                result += experience_item.end_date;
                result += "\n";
                result += "Role";
                result += "\n";
                result += experience_item.role;
                result += "\n";
                result += "Company Description";
                result += "\n";
                result += experience_item.desc;
                result += "\n";
                result += "Responsibilities";
                result += "\n";
                result += experience_item.responsibilities;
                result += "\n";
                result += "Achievements";
                result += "\n";
                result += experience_item.achievements;
                result += "\n";
            });
        }
        result += "\n";
        result += 'Projects';
        result += "\n";
        result += "\n";
        if (this.projects && this.projects.length > 0) {
            this.projects.forEach(experience_item => {
                result += "Project";
                result += "\n";
                result += this.project_name;
                result += "\n";
                result += "In Company";
                result += "\n";
                result += experience_item.company_name;
                result += "\n";
                result += "Start Date";
                result += "\n";
                result += experience_item.start_date;
                result += "\n";
                result += "End Date";
                result += "\n";
                result += experience_item.end_date;
                result += "\n";
                result += "Role";
                result += "\n";
                result += experience_item.role;
                result += "\n";
                result += "Project Description";
                result += "\n";
                result += experience_item.desc;
                result += "\n";
                result += "Responsibilities";
                result += "\n";
                result += experience_item.responsibilities;
                result += "\n";
                result += "Achievements";
                result += "\n";
                result += experience_item.achievements;
                result += "\n";
            });
        }
        return result;
    }

    getJsonStrForSaving() {
        return JSON.stringify(this);
    }
};