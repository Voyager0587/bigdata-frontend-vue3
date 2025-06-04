<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus'

const props = defineProps<{
  error: Error | string | null
  title?: string
  showRetry?: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()

const errorMessage = computed(() => {
  if (!props.error) return ''
  return props.error instanceof Error ? props.error.message : props.error
})
</script>

<template>
  <div v-if="error" class="error-container">
    <el-result
      icon="error"
      :title="title || '加载失败'"
      :sub-title="errorMessage"
    >
      <template #extra>
        <el-button v-if="showRetry" type="primary" @click="emit('retry')">
          重试
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-container {
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style> 