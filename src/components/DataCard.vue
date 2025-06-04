<script setup lang="ts">
import { computed } from 'vue'
import { ElCard, ElIcon } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import type { Component } from 'vue'

const props = defineProps<{
  title: string
  value: string | number
  subTitle?: string
  icon?: string | Component
  iconColor?: string
  trend?: number
  loading?: boolean
  className?: string
}>()

const trendIcon = computed(() => {
  if (props.trend === undefined) return null
  return props.trend >= 0 ? ArrowUp : ArrowDown
})

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'text-success-500' : 'text-danger-500'
})

const trendText = computed(() => {
  if (props.trend === undefined) return ''
  const prefix = props.trend >= 0 ? '+' : ''
  return `${prefix}${props.trend}%`
})
</script>

<template>
  <el-card 
    :class="['data-card hover-lift animate-fade-in', className]" 
    shadow="hover" 
    :body-style="{ padding: '20px' }"
    v-loading="loading"
  >
    <div class="flex items-center justify-between">
      <div class="data-card-content">
        <h3 class="data-card-title text-gray-500 text-sm mb-2">{{ title }}</h3>
        <div class="data-card-value text-2xl font-bold mb-1">{{ value }}</div>
        <div v-if="subTitle || trend !== undefined" class="data-card-footer flex items-center text-xs">
          <span v-if="subTitle" class="data-card-subtitle text-gray-400 mr-2">{{ subTitle }}</span>
          <div v-if="trend !== undefined" class="data-card-trend flex items-center" :class="trendClass">
            <el-icon v-if="trendIcon" class="mr-1">
              <component :is="trendIcon" />
            </el-icon>
            <span>{{ trendText }}</span>
          </div>
        </div>
      </div>
      <div v-if="icon" class="data-card-icon">
        <el-icon :size="32" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.data-card {
  height: 100%;
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.data-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-lg);
  background-color: rgba(var(--el-color-primary-rgb), 0.1);
}

.data-card-value {
  color: var(--gray-800);
  transition: color var(--transition-fast);
}

.data-card:hover .data-card-value {
  color: var(--primary-600);
}
</style> 