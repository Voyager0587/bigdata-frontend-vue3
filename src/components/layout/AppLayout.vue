<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const isCollapse = ref(false)
const isMobile = ref(window.innerWidth < 768)
const router = useRouter()
const route = useRoute()

// 计算属性，返回当前路由路径作为激活菜单项
const activeRoute = computed(() => route.path)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 监听窗口大小变化，更新移动设备状态
const updateDeviceType = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

// 添加窗口大小变化监听
window.addEventListener('resize', updateDeviceType)

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
})
</script>

<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar transition-all">
      <div class="flex items-center justify-between p-4 text-white">
        <h2 v-show="!isCollapse" class="text-lg font-bold truncate animate-fade-in">招聘数据平台</h2>
        <el-button type="text" @click="toggleSidebar" class="sidebar-toggle">
          <el-icon :size="20" color="#fff">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </el-button>
      </div>
      
      <el-menu
        :default-active="activeRoute"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="var(--primary-400)"
        router
      >
        <el-menu-item index="/" class="menu-item">
          <el-icon><DataLine /></el-icon>
          <template #title>数据概览</template>
        </el-menu-item>
        
        <el-menu-item index="/city" class="menu-item">
          <el-icon><Location /></el-icon>
          <template #title>城市分析</template>
        </el-menu-item>
        
        <el-menu-item index="/education" class="menu-item">
          <el-icon><Reading /></el-icon>
          <template #title>学历分析</template>
        </el-menu-item>
        
        <el-menu-item index="/salary" class="menu-item">
          <el-icon><Money /></el-icon>
          <template #title>薪资分析</template>
        </el-menu-item>
        
        <el-menu-item index="/company" class="menu-item">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>公司分析</template>
        </el-menu-item>
        
        <el-menu-item index="/recommendation" class="menu-item">
          <el-icon><Star /></el-icon>
          <template #title>个性化推荐</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="flex justify-between items-center h-full">
          <div class="flex items-center">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="flex items-center">
            <el-dropdown>
              <span class="flex items-center cursor-pointer">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <span class="ml-2 hidden sm:inline">管理员</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人信息</el-dropdown-item>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="main flex-1 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
}

.sidebar {
  background-color: #304156;
  height: 100%;
  transition: width var(--transition-normal);
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.sidebar-menu {
  border-right: none;
}

.menu-item {
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.sidebar-toggle {
  transition: transform var(--transition-fast);
}

.sidebar-toggle:hover {
  transform: scale(1.1);
}

.header {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
  height: 60px;
  position: relative;
  z-index: 5;
}

.main {
  background-color: var(--gray-50);
  padding: 20px;
  height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  .main {
    padding: 10px;
  }
  
  .header {
    padding: 0 10px;
  }
}
</style> 