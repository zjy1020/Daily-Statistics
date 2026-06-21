# 每日记账

一个 Apple 风格的个人记账 Web 应用，支持记录收支、预算管理、数据统计与可视化。基于 React + TypeScript + Vite 构建，通过 Capacitor 可打包为 Android APK。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite 8
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **路由**: React Router 7
- **图表**: Recharts
- **图标**: Lucide React
- **打包 APK**: Capacitor 8

## 功能

- **记账** — 记录支出/收入，支持分类、备注、日期时间
- **仪表盘** — 月度概览、今日支出、预算进度、分类统计、最近记录
- **预算管理** — 按分类设置预算、每日预算（可切换日期查看历史）
- **数据统计** — 周/月/年周期切换、饼图/柱状图/折线图、预算对比
- **搜索筛选** — 按关键词、分类、日期范围筛选记录
- **分类管理** — 自定义支出/收入分类，支持图标选择
- **数据导入导出** — CSV 导入导出、JSON 完整备份/恢复
- **PDF 导出** — 浏览器打印方式导出统计报告
- **深色模式** — 跟随系统或手动切换
- **个人资料** — 头像上传/表情选择、昵称、个人简介
- **数据持久化** — 所有数据存储在浏览器 localStorage

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 打包 Android APK

在 GitHub Actions 手动运行 **Build APK** 工作流，自动构建并生成 APK 下载。

> 全离线可用，无需网络。数据存储在设备本地。

## 项目结构

```
src/
├── components/      # 公共组件（导航栏等）
├── data/            # 默认分类数据
├── pages/           # 页面组件
│   ├── Dashboard.tsx    # 首页仪表盘
│   ├── AddRecord.tsx    # 记账/编辑页
│   ├── Statistics.tsx   # 数据统计页
│   ├── Budget.tsx       # 预算管理页
│   └── Profile.tsx      # 个人设置页
├── store/           # Zustand 状态管理
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

## 数据

所有数据存储在浏览器 **localStorage**，导出备份为 JSON 文件可完整迁移（包含记录、预算、分类、个人设置等）。
