<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  availableCities: string[]
  loading?: boolean
  maxSelection?: number
  value?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:value', cities: string[]): void
  (e: 'change'): void
}>()

// 已选择的城市
const selectedCities = ref<string[]>(props.value || [])

// 监听props.value变化
watch(() => props.value, (newValue) => {
  if (newValue) {
    selectedCities.value = [...newValue]
  }
}, { immediate: true })

// 监听selectedCities变化
watch(selectedCities, (newValue) => {
  emit('update:value', newValue)
  emit('change')
}, { deep: true })

// 添加城市
const addCity = (city: string) => {
  const maxSelection = props.maxSelection || 3
  if (selectedCities.value.length >= maxSelection) {
    ElMessage.warning(`最多只能选择${maxSelection}个城市进行对比`)
    return
  }
  
  if (!selectedCities.value.includes(city)) {
    selectedCities.value.push(city)
  }
}

// 移除城市
const removeCity = (city: string) => {
  const index = selectedCities.value.indexOf(city)
  if (index !== -1) {
    selectedCities.value.splice(index, 1)
  }
}

// 清空选择
const clearSelection = () => {
  selectedCities.value = []
}
</script>

<template>
  <div class="education-city-selector">
    <div class="selected-cities mb-4">
      <div class="text-sm font-medium mb-2 flex justify-between items-center">
        <span>已选择城市 ({{ selectedCities.length }}/{{ props.maxSelection || 3 }})</span>
        <el-button
          v-if="selectedCities.length > 0"
          type="text"
          size="small"
          @click="clearSelection"
        >
          清空
        </el-button>
      </div>
      
      <div v-if="selectedCities.length === 0" class="text-gray-400 text-sm">
        请从下方列表选择城市
      </div>
      
      <div v-else class="selected-city-tags">
        <el-tag
          v-for="city in selectedCities"
          :key="city"
          closable
          @close="removeCity(city)"
          class="mr-2 mb-2"
        >
          {{ city }}
        </el-tag>
      </div>
    </div>
    
    <div class="available-cities">
      <div class="text-sm font-medium mb-2">可选城市</div>
      <div class="city-list flex flex-wrap">
        <el-button
          v-for="city in availableCities"
          :key="city"
          size="small"
          :disabled="selectedCities.includes(city) || loading"
          @click="addCity(city)"
          class="mr-2 mb-2"
        >
          {{ city }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.city-list {
  max-height: 150px;
  overflow-y: auto;
}
</style> 