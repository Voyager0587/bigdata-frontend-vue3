<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  availableCities: string[]
  loading?: boolean
  maxSelection?: number
}>()

const emit = defineEmits<{
  (e: 'update:cities', cities: string[]): void
  (e: 'compare'): void
}>()

// 已选择的城市
const selectedCities = ref<string[]>([])

// 搜索关键词
const searchKeyword = ref('')

// 过滤后的城市列表
const filteredCities = ref<string[]>([])

// 监听可用城市变化
watch(() => props.availableCities, (newCities) => {
  filteredCities.value = [...newCities]
}, { immediate: true })

// 监听搜索关键词变化
watch(searchKeyword, (keyword) => {
  if (!keyword) {
    filteredCities.value = [...props.availableCities]
  } else {
    filteredCities.value = props.availableCities.filter(city => 
      city.toLowerCase().includes(keyword.toLowerCase())
    )
  }
})

// 添加城市
const addCity = (city: string) => {
  const maxSelection = props.maxSelection || 5
  if (selectedCities.value.length >= maxSelection) {
    ElMessage.warning(`最多只能选择${maxSelection}个城市进行对比`)
    return
  }
  
  if (!selectedCities.value.includes(city)) {
    selectedCities.value.push(city)
    emit('update:cities', selectedCities.value)
  }
}

// 移除城市
const removeCity = (city: string) => {
  const index = selectedCities.value.indexOf(city)
  if (index !== -1) {
    selectedCities.value.splice(index, 1)
    emit('update:cities', selectedCities.value)
  }
}

// 清空选择
const clearSelection = () => {
  selectedCities.value = []
  emit('update:cities', [])
}

// 开始对比
const startCompare = () => {
  if (selectedCities.value.length < 2) {
    ElMessage.warning('请至少选择2个城市进行对比')
    return
  }
  
  emit('compare')
}
</script>

<template>
  <div class="city-comparison-config">
    <div class="mb-4">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索城市"
        clearable
        :disabled="loading"
      >
        <template #prefix>
          <el-icon class="el-input__icon"><i class="el-icon-search" /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="selected-cities mb-4">
      <div class="text-sm font-medium mb-2 flex justify-between items-center">
        <span>已选择城市 ({{ selectedCities.length }}/{{ props.maxSelection || 5 }})</span>
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
      <el-scrollbar height="200px">
        <div class="city-list">
          <el-button
            v-for="city in filteredCities"
            :key="city"
            size="small"
            :disabled="selectedCities.includes(city) || loading"
            @click="addCity(city)"
            class="mr-2 mb-2"
          >
            {{ city }}
          </el-button>
        </div>
      </el-scrollbar>
    </div>
    
    <div class="mt-4 flex justify-end">
      <el-button
        type="primary"
        :disabled="selectedCities.length < 2 || loading"
        :loading="loading"
        @click="startCompare"
      >
        开始对比
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.city-list {
  display: flex;
  flex-wrap: wrap;
  padding: 8px 0;
}
</style> 