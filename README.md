## Obsidian-readingcard-template

### 一个Obsidian的阅读卡片模板

![ReadingCard](https://raw.githubusercontent.com/ZiGmaX809/obsidian-readingcard-template/main/pics/CleanShot%202024-04-16%20at%2014.34.56.png)


## 特点：

1. 基于WeRead同步的微信阅读笔记自动生成；
2. 以卡片的形式展示正在阅读或者已经阅读书籍；
3. 以年、月分类展示当月所读的书籍；
4. 自定义色彩管理，可自行变更主题。

## 更新：

1. 重写了书籍信息展示的css，以替换Badges插件；
2. 优化了代码逻辑，较大幅度提升了性能；

## 准备工作

### 1. 插件

需要安装如下插件：

1. **WeRead** [GitHub - zhaohongxuan/obsidian-weread-plugin: Obsidian Weread Plugin is a plugin to sync Weread(微信读书) hightlights and annotations into your Obsidian Vault.](https://github.com/zhaohongxuan/obsidian-weread-plugin)
2. **Dataview** [GitHub - blacksmithgu/obsidian-dataview: A data index and query language over Markdown files, for https://obsidian.md/.](https://github.com/blacksmithgu/obsidian-dataview)
3. ~~**Badges** [GitHub - gapmiss/badges: A light-weight plugin for displaying inline "badges" in Obsidian.md](https://github.com/gapmiss/badges)~~
4. **（选装）Callout Manager** [GitHub - eth-p/obsidian-callout-manager: An Obsidian.md plugin that makes creating and configuring callouts easy.](https://github.com/eth-p/obsidian-callout-manager)

请自行在第三方插件页面搜索安装。

### 2.CSS文件

#### 1. Cardview
因为`Dataview`原生并不支持卡片展示，因此需要自行添加CSS片段以支持该功能。

将以下CSS片段下载后，置入`设置-外观-CSS代码片段`文件夹中并启用：
[cardview.css](https://raw.githubusercontent.com/ZiGmaX809/obsidian-readingcard-template/main/css/cardview.css)

#### 2.NyanCat-Progress

该进度条样式源于[# Obsidian Dataview丨让彩虹猫咪来追踪你的微信读书进度吧■■■■■■□□□□□□](https://mp.weixin.qq.com/s?__biz=Mzg3NTk4Mjg5NA==&mid=2247484261&idx=1&sn=3a4b529c1886688b1bbcce09ae79cd02&chksm=cf387a24f84ff3326d4acdee65edb919a00edb975d64c44e585a3f74783bd28351e694d05f8e&token=109013616&lang=zh_CN#rd)

但是该样式使用`<progress>`标签 + `::afer`伪元素实现，在iOS版的Obsidian中无法显示`::after`伪元素，因此我用`<div>`标签复刻了一个。

将以下CSS片段下载后，置入`设置-外观-CSS代码片段`文件夹中并启用：
[nyancat-div.css](https://raw.githubusercontent.com/ZiGmaX809/obsidian-readingcard-template/main/css/nyancat-div.css)

如果在其他地方需要引用该样式，请使用以下方式：
```html
<div class="nyan-cat-progress-container"><div class="nyan-cat-progress-bar" value=8><div class="nyan-cat-rainbow"><div class="nyan-cat-img"></div></div></div></div>
```

#### 3.mybadges

当展示数量超过10个以后（可能是5个），插件Badges对于展示卡片的渲染就会呈现卡顿。

因此，在保证展示效果的前提下，重新写了css片段，以增强性能。

以我为例，笔记文件夹中共有33篇笔记，如果使用Badges插件进行渲染的话需要2751ms，而更改为css渲染仅需702ms，提升了将近4倍性能。

## 插件设置

### 1.WeRead

WeRead插件请根据官方指引进行设置，如果需要我的笔记模板，则如下：
```yaml
---
isbn: {{metaData.isbn}}
lastReadDate: {{metaData.lastReadDate}}
intro: {{metaData.intro}}
---

## 元数据

> [!abstract]- {{metaData.title}}
> - ![ {{metaData.title}}|200]({{metaData.cover}})
> - 书名： {{metaData.title}}
> - 作者： {{metaData.author}}
> - 简介： {{metaData.intro | replace('\r\n', '') | replace('\n', '') }}
> - 链接： {{ pcUrl }}
> - 出版时间： {{ metaData.publishTime }}
> - ISBN： {{metaData.isbn}}
> - 分类： {{metaData.category}}
> - 出版社： {{metaData.publisher}}

## 高亮划线
{% for chapter in chapterHighlights %}
{% if chapter.level == 1 %}### {{chapter.chapterTitle}}{% elif chapter.level == 2 %}#### {{chapter.chapterTitle}}{% elif chapter.level == 3 %}##### {{chapter.chapterTitle}}{% endif %}
{% for highlight in chapter.highlights %}{% if highlight.reviewContent %}
> [!highlight] 高亮
> {{ highlight.markText |trim }}
>> [!comment] 评论
>> {{ highlight.reviewContent |trim }}
>> <p class='weread-time'>- {{highlight.createTime}}</p>{% else %}
> [!highlight] 高亮
> {{ highlight.markText |trim }}
> <p class='weread-time'>- {{highlight.createTime}}</p>{% endif %} 
{% endfor %}{{ '---' }}{% endfor %}
## 读书笔记
{% for chapter in bookReview.chapterReviews %}{% if chapter.reviews or chapter.chapterReview %}
### {{chapter.chapterTitle}}
{% if chapter.reviews %}{%for review in chapter.reviews %}
> [!annotation] 划线
> {{review.abstract |trim }}
>> [!notes] 笔记
>> {{review.content}}
>> <p class='weread-time'>- {{review.createTime}}</p>
{% endfor %}{% endif %}{% endif %}{{ '---' }}{% endfor %}
## 本书评论
{% if bookReview.bookReviews %}{% for bookReview in bookReview.bookReviews %}
> [!review] 书评 No.{{loop.index}} 
> {{bookReview.mdContent | replace("\r\n", "\n> ")}} 
> <p class='weread-time'>- {{highlight.createTime}}</p>
{% endfor%}{% endif %}
```

### 2. Callout Manager（如不需要WeRead笔记模板，请跳过）

因为在WeRead的笔记模板中引用了自定义的Callout样式，因此需要在`Callout Manager`中进行添加以下样式（需以下名称，颜色和图标可以自行定义）：
- highlight
- comment
- annotation
- notes
- review

### 3. Dataview

需要在`Dataview`中打开`Enable JavaScript Queries`和`Enable Inline JavaScript Queries`以使用`DataviewJS`。

## ReadingCard

### 1. 新建文件，并在文件头添加cssclasses
```
---
cssclasses:
  - cards
  - table-max
  - cards-cols-3
  - cards-cover
  - cards-align-bottom
  - cards-2-3
---
```

### 2. 添加ReadingCard代码

1. 将代码块类型定义为：`dataviewjs`，并置入代码：[ReadingCard.js](https://raw.githubusercontent.com/ZiGmaX809/obsidian-readingcard-template/main/ReadingCard.js)
2. 将Path地址改为你的读书笔记路径，即`WeRead`插件中`笔记保存位置`；
3. 选择预览模式即可；
4. 如需变更主题，请变更`selected`的值，亦可自行配色。

## 进阶——每日阅读热力图

> [!quote]
> 需要借助另一个项目 [GitHub - ZiGma/Weread_ReadTime_Heatmap](https://github.com/ZiGmaX809/Weread_ReadTime_Heatmap.git) 以使用Github的Action功能生成每日的微信阅读热力图，生成后直接在Obsidian中引用即可。


## 进阶——每日阅读热力图（旧）

> [!quote]
> 需要借助另一个工具 [GitHub - malinkang/weread2notion-pro](https://github.com/malinkang/weread2notion-pro)以使用Github的Action功能生成每日的微信阅读热力图，生成后直接在Obsidian中引用即可。

> [!quote] 官方设置教程
> [WeRead2Notion-Pro使用文档](https://malinkang.com/posts/weread2notion-pro/)

1. Fork上述`Weread2Notion-pro`项目；
2. 获取微信读书的Cookie（理论上复制WeRead插件中的`Cookie`也可以）；
3. 授权项目调用Notion的API
	[Notion – The all-in-one workspace for your notes, tasks, wikis, and databases.](https://api.notion.com/v1/oauth/authorize?client_id=f86ce456-f9cb-4cd5-8e4b-07bd9e18a8f8&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fnotion-auth.malinkang.com%2Fweread2notionpro-oauth-callback)
4. 在Fork项目中确认写入权限：
	在路径`Settings->Actions->General`中确认`Workflow permissions`为`Read and write permissions`状态。
5. 在Fork项目中添加`secrets`变量：
	点击`Settings->Secrets and variables->New repository secret`
	**依次添加**

| secret键      | 值   | 备注       |
| :------------ | :--- | ---------- |
| WEREAD_COOKIE |      | 第2步获取  |
| NOTION_TOKEN  |      | 第3步获取  |
| NOTION_PAGE   |      | 第3步获取  |
| Name          |      | 热力图标题 |
6. 在`Settings->Secrets and variables`中添加`variables`

| variables键      | 值        | 备注                                     |
| ---------------- | --------- | ---------------------------------------- |
| BACKGROUND_COLOR | `#ffffff` | 背景颜色，如果需要透明背景则设置为`none` |
| DOM_COLOR        | `#e8eaed` | 未填充的色块                             |
| TRACK_COLOR      | `#ffe75a` | 一级颜色                                 |
| SPECIAL_COLOR    | `#feb934` | 二级颜色                                 |
| SPECIAL_COLOR2   | `#f98c28` | 三级级颜色                               |
| TEXT_COLOR       | `#f98c28` | 文字颜色                                 |
| Year             | `2024`    | 年份                                     |
7. 因为项目默认会将热力图生成后上传至指定网站，所以需要修改一下action所运行的`workflow`文件，打开`.github/workflows/read_time.yml`，将下面的
```yaml
- name: Rename weread.svg to a random name
    run: |
        RANDOM_FILENAME=$(uuidgen).svg
        mv ./OUT_FOLDER/weread.svg ./OUT_FOLDER/$RANDOM_FILENAME
        echo "Renamed file to $RANDOM_FILENAME"
- name: read time sync
    run: |
        python -u scripts/read_time.py
```
替换成
```yaml
- name: push
    run: |		
        git checkout --orphan output		
        git reset		
        git config --local user.email "action@github.com"		
        git config --local user.name "GitHub Action"		
        git add ./OUT_FOLDER		
        git commit -m '生成热力图' || echo "nothing to commit"		
        git push origin output -f || echo "nothing to push"
```
8. 项目运行后，会自动在`output`分支中的`./OUT_FOLDER`文件夹中存放名为weread.svg的热力图。但是如果直接引用图片在预览模式则可能会自动添加阴影，因此需要自定义一下CSS样式。
在ReadingCard中添加`<img src="https://raw.githubusercontent.com/ZiGmaX809/weread2notion-pro/output/OUT_FOLDER/weread.svg" class="custom_card">`
并且在`设置-外观-CSS代码片段`中添加自定义片段
```css
.custom_card {
	--webkit-filter: drop-shadow: 0 0px 0px #ccc !important;
	box-shadow: 0 0px 0px #ccc; 
}
```
