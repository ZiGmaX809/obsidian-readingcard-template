// 自定义参数
const Path = '📖 书山学海/📝 读书笔记'; // 读书笔记文件夹路径
const showYear = null; // 仅需显示相应年度的读书笔记，如需显示全部，则将showYear改为null
const selected = 1; // 切换主题颜色：0-常规 1-莫兰迪
const showDesc = true; // 是否需要逆序显示

// 遍历Path文件夹下所有读书笔记
const weReadFiles = dv
	.pages()
	.file.where(b => b.path.indexOf(Path) != -1)
	.where(b => b.path.endsWith(b.name + '.md'));
// 按年、月划分阅读记录
let read_years_months = {};

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
const fileInfoArray = weReadFiles.map(eachfile => {
	const bookInfo = eachfile.frontmatter;
	const name = eachfile.link;
	const author =
		bookInfo.author != null
			? `\r\`[!!|book-user|book-user:作者：${bookInfo.author}|${themeColor[0]}]\``
			: `\r\`[!!|book-user|book-user:作者：-|]\``;
	const readdate = `\r\`[!!|calendar-range|calendar-range:阅读日期：${bookInfo.lastReadDate}|${themeColor[1]}]\``;
	const readtime = `\r\`[!!|timer|timer:阅读时长：${bookInfo.readingTime}|${themeColor[2]}]\``;

	const cover = `![](${bookInfo.cover})`;
	const covertInfo = `${name} ${author} ${readdate} ${readtime}`;

	const lastReadDateMatch = regex.exec(bookInfo.lastReadDate);
	const year = lastReadDateMatch[1];
	const month = lastReadDateMatch[2];

	const readStatus = bookInfo.readingStatus;
	const readProgress =
		bookInfo.progress == -1 ? 0 : readStatus == '读完' ? 100 : parseFloat(bookInfo.progress);

	const progressBar = progressBarTemplate.replace(
		'{progress}',
		readProgress == 100 ? '100' : readProgress
	);
	const progressColor =
		Math.floor(readProgress / 25) < progressColors.length
			? progressColors[Math.floor(readProgress / 25)]
			: progressColors[0];

	const info =
		readProgress !== 100
			? `${covertInfo} \r\`[!!|book-marked|book:阅读进度：${readProgress}%|${progressColor}]\`\r ${progressBar}`
			: `${covertInfo} \r\`[!!|book-check|book:已读完|${progressColors[4]}]\`\r ${progressBar}`;

	return {
		name,
		author,
		year,
		month,
		lastreaddate: bookInfo.lastReadDate,
		cover,
		info,
	};
});

// 构建按年、月划分的阅读记录对象
fileInfoArray.forEach(info => {
	if (showYear == null || info.year == showYear) {
		if (read_years_months.hasOwnProperty(info.year)) {
			if (!read_years_months[info.year].includes(info.month)) {
				read_years_months[info.year].push(info.month);
			}
		} else {
			read_years_months[info.year] = [info.month];
		}
	}
});

// 是否需要逆序构建卡片年份
let sortedYears = showDesc ? Object.keys(read_years_months).map(Number).sort().reverse() :
Object.keys(read_years_months).map(Number).sort()

// 按年份输出阅读卡片
for (let y of sortedYears) {
	dv.paragraph(`## ${y}年`);
	let sortedMonths = showDesc ? read_years_months[y].sort().reverse() : read_years_months[y].sort()
	sortedMonths.forEach(m => {
		dv.paragraph(`### ${parseInt(m)}月`); // 此处转换是需要去除月份前的'0'
		dv.table(
			['封面', '信息'],
			fileInfoArray
				.sort(b => b.lastreaddate,showDesc ? 'desc' : 'asc')
				.filter(b => b.year == y && b.month == m)
				.map(b => [b.cover, b.info])
		);
	});
}