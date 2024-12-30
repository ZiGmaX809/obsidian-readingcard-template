// 自定义参数
const Path = '📖 书山学海/📝 读书笔记'; // 读书笔记文件夹路径
const showYear = null; // 仅需显示相应年度的读书笔记，如需显示全部，则将showYear改为null
const selected = 1; // 切换主题颜色：0-常规 1-莫兰迪
const showDesc = true; // 是否需要逆序显示

// 遍历Path文件夹下所有读书笔记
const weReadFiles = dv
	.pages()
	.file.where(b => b.path.indexOf(Path) !== -1 && b.path.endsWith(b.name + '.md'));
// 按年、月划分阅读记录
const read_years_months = new Map();

// 色彩管理
const color_manager = {
	yellow: 'var(--color-yellow-rgb)',
	green: 'var(--color-green-rgb)',
	red: 'var(--color-red-rgb)',
	blue: 'var(--color-blue-rgb)',
	cyan: 'var(--color-cyan-rgb)',
	purple: 'var(--color-purple-rgb)',
	orange: 'var(--color-orange-rgb)',
	pink: 'var(--color-pink-rgb)',
	pomelo: '255,111,94', //红西柚
	pulp: '235, 89, 94', //红橙
	daffodil: '224,159,71', //黄水仙
	turquoise: '70,164,115', //翡翠
	seasky: '125,201,231', //海洋天蓝
	plum: '141,191,139', //青梅
	swanlake: '60, 167, 171', //天鹅湖蓝
	pelorous: '59,176,186', //冷青
	honor: '229,140,197', //荣耀
	love: '241,138,161', //火烈鸟
};

// 主题颜色配置
const theme = [
	//常规配色
	[color_manager.yellow, color_manager.green, color_manager.blue],
	//莫兰迪配色
	[color_manager.pomelo, color_manager.daffodil, color_manager.seasky],
];

// 阅读进度颜色
const progress_color = [
	//常规配色
	[
		color_manager.green,
		color_manager.yellow,
		color_manager.orange,
		color_manager.red,
		color_manager.pink, //已读完状态颜色
	],
	//莫兰迪配色
	[
		color_manager.plum,
		color_manager.daffodil,
		color_manager.turquoise,
		color_manager.love,
		color_manager.pulp, //已读完状态颜色
	],
];

// 预先计算好颜色
const themeColor = theme[selected];
const progressColors = progress_color[selected];

// 预先编译正则表达式
const regex = /(\d{4})-(\d{1,2})-(\d{1,2})/;

// 预先构建彩虹猫进度条样式模板
const progressBarTemplate =
	"<div class='nyan-cat-progress-container'><div class='nyan-cat-progress-bar' value={progress} ><div class='nyan-cat-rainbow'><div class='nyan-cat-img'></div></div></div></div>";

// 收集所有文件信息到数组中
const weReadInfoArray = weReadFiles.values
	.sort((a, b) => new Date(b.frontmatter.lastReadDate) - new Date(a.frontmatter.lastReadDate))
	.map(eachitem => {
		const bookInfo = eachitem.frontmatter;
		const lastReadDateMatch = regex.exec(bookInfo.lastReadDate);

		if (!lastReadDateMatch) return null;

		const [, year_, month_] = lastReadDateMatch;
		const [year, month] = [Number(year_), Number(month_)];

		const readPrecent =
			bookInfo.readingStatus === '读完'
				? 100
				: bookInfo.progress === -1
				? 0
				: parseFloat(bookInfo.progress);

		const progressBar = progressBarTemplate.replace(
			'{progress}',
			readPrecent == 100 ? '100' : readPrecent
		);
		const progressColor =
			progressColors[Math.min(Math.floor(readPrecent / 25), progressColors.length - 1)];

		// 构建按年、月划分的阅读记录对象
		if (showYear == null || year == showYear) {
			const existingMonths = read_years_months.get(year) || new Set();
			existingMonths.add(month);
			read_years_months.set(year, existingMonths);
		}

		return {
			year,
			month,
			lastreaddate: bookInfo.lastReadDate,
			cover: `![](${bookInfo.cover})`,
			info: readerBookInfo(
				eachitem.link,
				bookInfo,
				progressBar,
				readPrecent,
				themeColor,
				progressColor
			),
		};
	})
	.filter(Boolean);

function badges(icon, color, title) {
	return `<br><div class='inline-badges' style='background-color:rgba(${color},0.177);color:rgba(${color},1)'><span class='${icon}' style='background-color:rgba(${color},1)'></span><span class='inline-badges-title-inner'>${title}</span></div>`;
}

function readerBookInfo(name, bookInfo, progressBar, readPrecent, themeColor, progressColor) {
	const author = badges(
		'book-user-icon',
		themeColor[0],
		'作者：' +
			(bookInfo.author != null
				? bookInfo.author.length > 8
					? bookInfo.author.substring(0, 8) + '...'
					: bookInfo.author
				: '-')
	);
	const readdate = badges('read-date-icon', themeColor[1], '阅读日期：' + bookInfo.lastReadDate);
	const readtime = badges('read-time-icon', themeColor[2], '阅读时长：' + bookInfo.readingTime);

	const progress_switch = [
		['book-icon', progressColor, '阅读进度：' + readPrecent + '%'],
		['book-checked-icon', progressColors[4], '已读完'],
	];

	const info =
		name +
		author +
		readdate +
		readtime +
		badges(...(readPrecent !== 100 ? progress_switch[0] : progress_switch[1])) +
		progressBar;

	return info;
}

let sortedYears = Object.keys(Object.fromEntries(read_years_months))
	.map(Number)
	.sort(showDesc ? (a, b) => b - a : (a, b) => a - b);

for (let y of sortedYears) {
	dv.paragraph(`## ${y}年`);
	const monthsInYear = Array.from(read_years_months.get(y) || []).sort(
		showDesc ? (a, b) => Number(b) - Number(a) : (a, b) => Number(a) - Number(b)
	);

	for (let m of monthsInYear) {
		dv.paragraph(`### ${m}月`);

		const filteredBooks = weReadInfoArray.filter(b => b.year === y && b.month === m);

		if (filteredBooks.length > 0) {
			dv.table(
				['封面', '信息'],
				filteredBooks.map(b => [b.cover, b.info])
			);
		}
	}
}
