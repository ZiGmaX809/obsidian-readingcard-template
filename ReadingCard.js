// 自定义参数
const Path = '📖 书山学海/📝 读书笔记'; // 读书笔记文件夹路径
const showYear = null; // 仅需显示相应年度的读书笔记，如需显示全部，则将showYear改为null
const selected = 1; // 切换主题颜色：0-常规 1-莫兰迪
const showDesc = true; // 是否需要逆序显示

// 遍历Path文件夹下所有读书笔记
const weReadFiles = dv
    .pages()
    .file.where(b => b.path.includes(Path) && b.path.endsWith(b.name + '.md'));

// 按年、月划分阅读记录
const readYearsMonths = new Map();

// 色彩管理 - 集中定义所有颜色
const colorManager = {
    // 基础颜色
    yellow: 'var(--color-yellow-rgb)',
    green: 'var(--color-green-rgb)',
    red: 'var(--color-red-rgb)',
    blue: 'var(--color-blue-rgb)',
    cyan: 'var(--color-cyan-rgb)',
    purple: 'var(--color-purple-rgb)',
    orange: 'var(--color-orange-rgb)',
    pink: 'var(--color-pink-rgb)',
    teal: 'var(--color-teal-rgb)',
    yellowgreen: 'var(--color-yellowgreen-rgb)',
    turquoise: 'var(--color-turquoise-rgb)',
    // 莫兰迪色系
    pomelo: '255,111,94', // 红西柚
    pulp: '235, 89, 94', // 红橙
    daffodil: '224,159,71', // 黄水仙
    jade: '70,164,115', // 翡翠
    seasky: '125,201,231', // 海洋天蓝
    plum: '141,191,139', // 青梅
    swanlake: '60, 167, 171', // 天鹅湖蓝
    pelorous: '59,176,186', // 冷青
    honor: '229,140,197', // 荣耀
    love: '241,138,161', // 火烈鸟
    autumn: '233, 191, 102', // 秋天
};

// 主题颜色配置
const themes = [
    // 常规配色
    [colorManager.yellow, colorManager.green, colorManager.blue],
    // 莫兰迪配色
    [colorManager.pomelo, colorManager.daffodil, colorManager.swanlake],
];

// 阅读进度颜色
const progressColors = [
    // 常规配色
    [
        colorManager.turquoise,
        colorManager.orange,
        colorManager.teal,
        colorManager.red,
        colorManager.pink, // 已读完状态颜色
    ],
    // 莫兰迪配色
    [
        colorManager.seasky,
        colorManager.plum,
        colorManager.autumn,
        colorManager.love,
        colorManager.pulp, // 已读完状态颜色
    ],
];

// 选择当前主题颜色
const themeColor = themes[selected];
const currentProgressColors = progressColors[selected];

// 预先编译正则表达式 - 用于解析日期
const dateRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;

// 彩虹猫进度条样式模板
const progressBarTemplate = 
    "<div class='nyan-cat-progress-container'><div class='nyan-cat-progress-bar' value={progress} ><div class='nyan-cat-rainbow'><div class='nyan-cat-img'></div></div></div></div>";

/**
 * 创建标签徽章
 * @param {string} icon - 图标类名
 * @param {string} color - 颜色RGB值
 * @param {string} title - 标签文本
 * @returns {string} 徽章HTML
 */
function createBadge(icon, color, title) {
    return `<br><div class='inline-badges' style='background-color:rgba(${color},0.177);color:rgba(${color},1)'><span class='${icon}' style='background-color:rgba(${color},1)'></span><span class='inline-badges-title-inner'>${title}</span></div>`;
}

/**
 * 生成书籍信息HTML
 * @param {string} name - 书籍链接名
 * @param {Object} bookInfo - 书籍元数据
 * @param {string} progressBar - 进度条HTML
 * @param {number} readPercent - 阅读百分比
 * @param {Array} themeColor - 主题颜色
 * @param {string} progressColor - 进度颜色
 * @returns {string} 书籍信息HTML
 */
function generateBookInfo(name, bookInfo, progressBar, readPercent, themeColor, progressColor) {
    // 处理作者信息，如果过长则截断
    const authorText = bookInfo.author != null
        ? bookInfo.author.length > 8
            ? bookInfo.author.substring(0, 8) + '...'
            : bookInfo.author
        : '-';
    
    // 创建各类信息徽章
    const author = createBadge('book-user-icon', themeColor[0], '作者：' + authorText);
    const readDate = createBadge('read-date-icon', themeColor[1], '阅读日期：' + bookInfo.lastReadDate);
    const readTime = createBadge('read-time-icon', themeColor[2], '阅读时长：' + bookInfo.readingTime);
    
    // 阅读进度徽章选项
    const progressOptions = [
        ['book-icon', progressColor, '阅读进度：' + readPercent + '%'],
        ['book-checked-icon', currentProgressColors[4], '已读完']
    ];
    
    // 根据是否读完选择不同的进度徽章
    const progressBadge = createBadge(...(readPercent !== 100 ? progressOptions[0] : progressOptions[1]));
    
    // 拼接所有信息
    return name + author + readDate + readTime + progressBadge + progressBar;
}

// 收集并处理所有读书笔记文件
const weReadInfoArray = weReadFiles.values
    // 按最后阅读日期降序排序
    .sort((a, b) => new Date(b.frontmatter.lastReadDate) - new Date(a.frontmatter.lastReadDate))
    .map(file => {
        const bookInfo = file.frontmatter;
        const lastReadDateMatch = dateRegex.exec(bookInfo.lastReadDate);
        
        // 如果日期格式不匹配，跳过此条目
        if (!lastReadDateMatch) return null;
        
        const [, yearStr, monthStr] = lastReadDateMatch;
        const year = Number(yearStr);
        const month = Number(monthStr);
        
        // 计算阅读进度百分比
        const readPercent = bookInfo.readingStatus === '读完'
            ? 100
            : bookInfo.progress === -1
                ? 0
                : parseFloat(bookInfo.progress);
        
        // 生成进度条HTML
        const progressBar = progressBarTemplate.replace(
            '{progress}',
            readPercent == 100 ? '100' : readPercent
        );
        
        // 根据进度选择颜色
        const progressColor = currentProgressColors[
            Math.min(Math.floor(readPercent / 25), currentProgressColors.length - 1)
        ];
        
        // 如果需要显示指定年份或显示全部，则记录年月信息
        if (showYear == null || year == showYear) {
            const existingMonths = readYearsMonths.get(year) || new Set();
            existingMonths.add(month);
            readYearsMonths.set(year, existingMonths);
        }
        
        // 返回处理后的书籍信息
        return {
            year,
            month,
            lastReadDate: bookInfo.lastReadDate,
            cover: `![](${bookInfo.cover})`,
            info: generateBookInfo(
                file.link,
                bookInfo,
                progressBar,
                readPercent,
                themeColor,
                progressColor
            )
        };
    })
    .filter(Boolean); // 过滤掉无效条目

// 按年份排序（正序或逆序）
const sortedYears = Array.from(readYearsMonths.keys())
    .sort(showDesc ? (a, b) => b - a : (a, b) => a - b);

// 生成最终的展示内容
for (const year of sortedYears) {
    // 显示年份标题
    dv.paragraph(`## ${year}年`);
    
    // 获取并排序该年的月份
    const monthsInYear = Array.from(readYearsMonths.get(year))
        .sort(showDesc ? (a, b) => b - a : (a, b) => a - b);
    
    // 遍历每个月份
    for (const month of monthsInYear) {
        // 显示月份标题
        dv.paragraph(`### ${month}月`);
        
        // 筛选该年月的书籍
        const booksInMonth = weReadInfoArray.filter(book => 
            book.year === year && book.month === month
        );
        
        // 如果有书籍，生成表格显示
        if (booksInMonth.length > 0) {
            dv.table(
                ['封面', '信息'],
                booksInMonth.map(book => [book.cover, book.info])
            );
        }
    }
}
