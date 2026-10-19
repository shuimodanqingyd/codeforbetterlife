# 梁华平 · Data × Risk

一份为「量化风控 / 数据工程」方向打造的个人作品集。设计语言围绕金融数据、风险信号与实时系统展开：深色数据界面、青色信号线、酸性绿强调，以及一个带 HUD 框架的个人肖像。

## 本地运行

直接双击 `index.html` 即可。也可以在当前目录启动一个静态服务器：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 页面结构

- **Hero**：姓名、职业转向、核心数据、实时时钟与肖像 HUD
- **About**：个人定位、工作方法、Personnel File
- **Capability**：能力雷达与四组技术栈
- **Impact**：数据一致性、业务一致性与业务增量面板
- **Experience**：2016 → Now 的职业轨迹
- **Projects**：8 个项目档案，支持分类筛选与详情弹窗
- **Risk Lab**：可交互的模拟数据质量扫描
- **Contact**：邮箱、电话、城市与求职状态

## 技术说明

- 纯 HTML / CSS / JavaScript，无框架、无构建步骤、无外部 CDN。
- 背景粒子网络使用 Canvas；滚动揭示使用 IntersectionObserver。
- 数字滚动、能力雷达、项目筛选、项目详情弹窗、数据质量扫描、复制邮箱、移动端菜单均为原生交互。
- 支持 `prefers-reduced-motion`，并提供键盘焦点样式、ARIA 标签与语义结构。
- 肖像由上传照片处理为透明背景的双色调版本，源图保留在 `assets/portrait-original.jpg`。

## 文件

```text
lianghuaping-site/
├─ index.html
├─ styles.css
├─ app.js
├─ README.md
└─ assets/
   ├─ favicon.svg
   ├─ portrait.png
   └─ portrait-original.jpg
```

## 内容来源

内容依据 `梁华平-量化风控.docx` 整理，项目指标均来自履历中的项目成果描述。页面中的 Risk Lab 为演示数据，已在界面内标注，不代表真实生产指标。
