// 获取日程的函数
const scheduleMap = new Map([
    ["2024.11.07", "今天"],
    ["2024.11.15", "选题及审核"],
    ["2024.12.21", "考研笔试"],
    ["2024.12.28", "科研实践3材料"],
    ["2025.1.3", "选题及审核"],
    ["2025.3.7", "中期检查"],
    ["2025.4.1", "论文查重"],
    ["2025.5.1", "论文评审及答辩"],
    // 添加更多日程...
  ]);
  // 获取日程的函数
  function getSchedule(jy, jm, jd) {
    // 格式化输入日期为 "YYYY.MM.DD"
    const dateKey = `${jy}.${String(jm).padStart(2, '0')}.${String(jd).padStart(2, '0')}`;
    
    // 使用Map快速查找日程
    return scheduleMap.get(dateKey) || "";
  }