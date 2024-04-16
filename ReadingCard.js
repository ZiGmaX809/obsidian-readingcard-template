const Path = '📖 书山学海/📝 读书笔记'; //读书笔记文件夹路径

//色彩管理
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

// 遍历Path文件夹下所有读书笔记
const weReadFiles = dv
	.pages()
	.file.where(b => b.path.indexOf(Path) != -1)
	.where(b => b.path.endsWith(b.name + '.md'));
//按年、月划分阅读记录
let read_years_months = {};
// 主题颜色配置
const theme = [
	//常规配色
	[color_manager.yellow, color_manager.green, color_manager.blue],
	//莫兰迪配色
	[color_manager.pomelo, color_manager.daffodil, color_manager.seasky],
];
//阅读进度颜色
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
const selected = 1; //切换主题颜色：0-常规 1-莫兰迪

//获取每个笔记信息
for (let eachfile of weReadFiles) {
	//获取作者、简介、阅读日期等
	const bookInfo = eachfile.frontmatter;
	let name = eachfile.link;
	let author =
		bookInfo.author != null
			? '\r`[!!|book-user|book-user:作者：' + bookInfo.author + '|' + theme[selected][0] + ']`'
			: '\r`[!!|book-user|book-user:作者：-|]`';
	// %% %%let intro = bookInfo.intro != null ? '\r简介：' + bookInfo.intro.substring(0,50) + '……' : '\r简介：-'
	let readdate =
		'\r`[!!|calendar-range|calendar-range:阅读日期：' +
		bookInfo.lastReadDate +
		'|' +
		theme[selected][1] +
		']`';
	let readtime =
		'\r`[!!|timer|timer:阅读时长：' + bookInfo.readingTime + '|' + theme[selected][2] + ']`';

	const covertInfo = name + author + readdate + readtime;

	//获取封面
	eachfile['cover'] = dv.paragraph('![](' + bookInfo.cover + ')');

	//获取阅读年份&月份
	const regex = /(\d{4})-(\d{1,2})-(\d{1,2})/g;
	let lastReadDate = regex.exec(bookInfo.lastReadDate);
	if (lastReadDate !== null) {
		let year = lastReadDate[1];
		let month = lastReadDate[2];
		if (read_years_months.hasOwnProperty(year)) {
			if (!read_years_months[year].includes(month)) {
				read_years_months[year].push(month);
			}
		} else {
			read_years_months[year] = [month];
		}
		eachfile['year'] = year;
		eachfile['month'] = month;
	}

	//获取阅读进度或者是否读完状态
	const readProgress = eachfile.frontmatter.progress == -1 ? '0%' : eachfile.frontmatter.progress;
	//添加彩虹猫进度条样式
	const progress = parseFloat(readProgress);
	const readProgressBar =
		"<div class='nyan-cat-progress-container'><div class='nyan-cat-progress-bar' value=" +
		progress +
		" ><div class='nyan-cat-rainbow'><div class='nyan-cat-img'></div></div></div></div>";

	if (progress < 100) {
		let p_color = progress_color[selected][Math.floor(progress / 25)];
		eachfile['info'] = dv.paragraph(
			covertInfo +
				'\r`[!!|book-marked|book: 阅读进度：' +
				readProgress +
				'|' +
				p_color +
				']`' +
				readProgressBar
		);
	} else {
		eachfile['info'] = dv.paragraph(
			covertInfo +
				'\r`[!!|book-check|book:已读完|' +
				progress_color[selected][4] +
				']`' +
				readProgressBar
		);
	}
}

//按年份输出阅读卡片
console.log(read_years_months);
for (let y in read_years_months) {
	dv.paragraph('## ' + y + '年');
	for (let m of read_years_months[y].sort()) {
		dv.paragraph('### ' + m + '月');
		dv.table(
			['封面', '信息'],
			weReadFiles
				.sort(b => b.name)
				.map(b => {
					console.log(b);
					if (b && b.year && y === b.year && b.month && m === b.month) {
						return [b.cover, b.info];
					}
					return null; // 如果不匹配，返回 null
				})
				.filter(item => item !== null) // 过滤掉不匹配的项
		);
	}
}
