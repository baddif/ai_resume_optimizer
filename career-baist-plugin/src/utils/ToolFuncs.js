// generate key words json
/**
 * KeyWordsJson:
 * {"jobTitle": "developer", "role": "HR Manager", "skills": ["skill1", "skill2", ...]}
 */
export function GetKeyWordsJsonStr({ jobTitle, selectedRole, customRole, techList }) {
    let key_words = {};
    key_words.jobTitle = jobTitle;
    key_words.role == (selectedRole === "Custom" ? selectedRole : customRole);
    key_words.skills = techList;
    return JSON.stringify(key_words);
}

export function formatDateInput(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const compareDateStr = (a, b) => {
    // 辅助函数 (可以定义在外部，或者直接在比较函数内部实现简短逻辑)
    const isDateEmpty = (dateStr) => !dateStr || dateStr.trim() === '';

    const isEmptyA = isDateEmpty(a);
    const isEmptyB = isDateEmpty(b);

    // 优先处理空值：
    // 如果 A 空，B 不空，A 排在前面
    if (isEmptyA && !isEmptyB) return -1;
    // 如果 B 空，A 不空，B 排在前面
    if (!isEmptyA && isEmptyB) return 1;
    // 如果都空或都不空，则继续比较
    if (isEmptyA && isEmptyB) return 0;

    // 两个都不为空，按日期降序 (最新在前)
    // 直接创建 Date 对象并比较时间戳
    return new Date(b).getTime() - new Date(a).getTime();
};