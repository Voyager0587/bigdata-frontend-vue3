import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/dashboard/index.vue'),
    meta: { title: '数据概览' }
  },
  {
    path: '/city',
    name: 'CityAnalysis',
    component: () => import('../views/city-analysis/index.vue'),
    meta: { title: '城市分析' }
  },
  {
    path: '/education',
    name: 'EducationAnalysis',
    component: () => import('../views/education-analysis/index.vue'),
    meta: { title: '学历分析' }
  },
  {
    path: '/salary',
    name: 'SalaryAnalysis',
    component: () => import('../views/salary-analysis/index.vue'),
    meta: { title: '薪资分析' }
  },
  {
    path: '/company',
    name: 'CompanyAnalysis',
    component: () => import('../views/company-analysis/index.vue'),
    meta: { title: '公司分析' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title ? `${to.meta.title} - 招聘数据可视化平台` : '招聘数据可视化平台'
  document.title = title as string
  
  // 这里可以添加其他逻辑，如权限验证、登录状态检查等
  
  next()
})

// 全局后置钩子
router.afterEach(() => {
  // 页面切换后，滚动到顶部
  window.scrollTo(0, 0)
})

export default router 