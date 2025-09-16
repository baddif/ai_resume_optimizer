// ResumeDataItem.js

export class ResumeDataItem {
    constructor() {
      this.frontend_id = "";
      this.id = ""; // 可以由数据库生成或临时生成， original data id
      this.type = ""; // "summary" | "work_exp" | "proj_exp"
      this.saved = false;
      this.shown = true;
      this.currentActivelabel = 0;
      this.locked = false;
  
      this.meta = {
        project_name: "",
        company_name: "",
        is_customized_company_name: true,
        customized_company_name: "",
        time_start: "", // 例如 "2025-05-26"
        time_end: "",
        on_going: false,
        role: ""
      };
  
      this.data = [
        {
          id: "",
          label: 0, // 0: ori, 1: v1, 2: v2, 3: v3
          item_desc: "",
          resp_desc: "",
          achi_desc: "",
          created_time: "", // 例如 "2025-05-26T12:00:00Z"
          key_words: "" // JSON 字符串
        }
      ];
    }

    static isEqual(a, b) {
      if (!(a instanceof ResumeDataItem) || !(b instanceof ResumeDataItem)) return false;
      return (
        a.id === b.id &&
        a.type === b.type &&
        a.saved === b.saved &&
        JSON.stringify(a.meta) === JSON.stringify(b.meta) &&
        JSON.stringify(a.data) === JSON.stringify(b.data)
      );
    }
}
  