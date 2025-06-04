# 招聘数据可视化平台

基于Vue 3 + TypeScript + Vite构建的招聘数据可视化平台，提供丰富的图表展示和数据分析功能，帮助用户直观了解招聘市场趋势。

<!-- 项目截图将在完成后添加 -->

## 技术栈

- **前端框架**: Vue 3.5.x + TypeScript 5.8.x
- **构建工具**: Vite 6.3.x
- **状态管理**: Pinia 3.0.x
- **路由管理**: Vue Router 4.5.x
- **UI组件库**: Element Plus 2.9.x
- **样式方案**: Tailwind CSS 4.1.x
- **图表库**: ECharts 5.6.x
- **HTTP请求**: Axios 1.9.x
- **地图扩展**: ECharts AMap 1.12.x

## 功能特点

- **数据概览**: 展示招聘数据关键指标和总体趋势
- **城市分析**: 可视化不同城市的招聘数据分布和对比
- **学历分析**: 展示不同学历的招聘需求和分布情况
- **薪资分析**: 分析不同条件下的薪资水平和分布
- **公司分析**: 展示不同规模公司的招聘情况
- **响应式设计**: 适配各种设备屏幕尺寸
- **数据导出**: 支持图表数据导出为Excel格式

## 安装与运行

### 环境要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

### 安装步骤

1. 克隆项目到本地

```bash
git clone https://github.com/yourusername/recruitment-data-visualization.git
cd recruitment-data-visualization
```

2. 安装依赖

```bash
npm install
```

3. 开发环境运行

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

5. 预览构建结果

```bash
npm run preview
```

## 项目结构

```
frontend-vue3/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # API接口封装
│   ├── assets/              # 项目资源文件
│   ├── components/          # 公共组件
│   │   ├── charts/          # 图表组件
│   │   ├── layout/          # 布局组件
│   │   └── common/          # 通用组件
│   ├── composables/         # 组合式函数
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia状态管理
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── views/               # 页面视图
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── .env                     # 环境变量
├── vite.config.ts           # Vite配置
└── tailwind.config.js       # Tailwind配置
```

## API文档

项目使用RESTful API获取招聘数据，主要包括以下几类数据接口：

- 城市分布数据接口
- 公司规模分布数据接口
- 学历分布数据接口
- 高薪职位分析接口
- 学历薪资分析接口
- 薪资区间分布接口

详细API文档请参考 [api-docs.md](./api-docs.md)

## 开发指南

### 添加新图表

1. 在 `src/components/charts` 目录下创建新的图表组件
2. 在 `src/api` 目录下添加相应的API调用函数
3. 在 `src/views` 中的相应页面引入并使用该图表组件

### 代码规范

- 使用 TypeScript 类型定义
- 遵循 Vue 3 Composition API 的最佳实践
- 组件使用 `<script setup>` 语法
- 使用 Tailwind CSS 进行样式设计

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 许可证

本项目采用 MIT 许可证
