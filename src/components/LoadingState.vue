<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from 'element-plus'

defineProps<{
  loading: boolean
  text?: string
  skeleton?: boolean
  height?: string
  width?: string
}>()
</script>

<template>
  <div 
    v-loading="loading" 
    :element-loading-text="text || '加载中...'" 
    element-loading-spinner="el-icon-loading"
    :style="{ 
      height: height || '100%', 
      width: width || '100%',
      position: 'relative'
    }"
    class="loading-container"
  >
    <el-skeleton v-if="skeleton && loading" :rows="5" animated />
    <slot v-else></slot>
  </div>
</template>

<style scoped>
.loading-container {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 