<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElForm, ElFormItem, ElButton, ElSelect, ElOption, ElDatePicker, ElInput, ElTag } from 'element-plus'

type FilterOption = {
  label: string
  value: string | number
  disabled?: boolean
}

type FilterItem = {
  type: 'select' | 'date' | 'daterange' | 'input' | 'number'
  field: string
  label: string
  placeholder?: string
  options?: FilterOption[]
  multiple?: boolean
  clearable?: boolean
  defaultValue?: any
}

const props = defineProps<{
  filters: FilterItem[]
  loading?: boolean
  showReset?: boolean
  collapsed?: boolean
}>()

const emit = defineEmits<{
  filter: [params: Record<string, any>]
  reset: []
}>()

// 初始化表单数据
const initFormData = () => {
  const data: Record<string, any> = {}
  props.filters.forEach(filter => {
    data[filter.field] = filter.defaultValue !== undefined ? filter.defaultValue : undefined
  })
  return data
}

const formData = reactive(initFormData())
const formRef = ref()

// 提交筛选
const handleFilter = () => {
  emit('filter', { ...formData })
}

// 重置筛选
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    Object.keys(formData).forEach(key => {
      const filter = props.filters.find(f => f.field === key)
      formData[key] = filter?.defaultValue !== undefined ? filter.defaultValue : undefined
    })
  }
  emit('reset')
  emit('filter', { ...formData })
}

// 当默认值变化时更新表单
watch(
  () => props.filters,
  () => {
    props.filters.forEach(filter => {
      if (filter.defaultValue !== undefined && formData[filter.field] === undefined) {
        formData[filter.field] = filter.defaultValue
      }
    })
  },
  { deep: true }
)
</script>

<template>
  <div class="filter-panel">
    <el-form
      ref="formRef"
      :model="formData"
      inline
      size="default"
      class="filter-form"
    >
      <template v-for="(filter, index) in filters" :key="filter.field">
        <el-form-item :label="filter.label" :prop="filter.field">
          <!-- 选择器 -->
          <el-select
            v-if="filter.type === 'select'"
            v-model="formData[filter.field]"
            :placeholder="filter.placeholder || `请选择${filter.label}`"
            :multiple="filter.multiple"
            :clearable="filter.clearable !== false"
            class="filter-item"
            :loading="loading"
            :disabled="loading"
          >
            <el-option
              v-for="option in filter.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </el-select>

          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="filter.type === 'date'"
            v-model="formData[filter.field]"
            type="date"
            :placeholder="filter.placeholder || `请选择${filter.label}`"
            :clearable="filter.clearable !== false"
            class="filter-item"
            :disabled="loading"
          />

          <!-- 日期范围选择器 -->
          <el-date-picker
            v-else-if="filter.type === 'daterange'"
            v-model="formData[filter.field]"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :clearable="filter.clearable !== false"
            class="filter-item-wide"
            :disabled="loading"
          />

          <!-- 文本输入框 -->
          <el-input
            v-else-if="filter.type === 'input'"
            v-model="formData[filter.field]"
            :placeholder="filter.placeholder || `请输入${filter.label}`"
            :clearable="filter.clearable !== false"
            class="filter-item"
            :disabled="loading"
          />

          <!-- 数字输入框 -->
          <el-input
            v-else-if="filter.type === 'number'"
            v-model.number="formData[filter.field]"
            type="number"
            :placeholder="filter.placeholder || `请输入${filter.label}`"
            :clearable="filter.clearable !== false"
            class="filter-item"
            :disabled="loading"
          />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="handleFilter" :loading="loading">
          筛选
        </el-button>
        <el-button v-if="showReset" @click="handleReset" :disabled="loading">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.filter-panel {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-item {
  width: 200px;
}

.filter-item-wide {
  width: 350px;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .filter-item,
  .filter-item-wide {
    width: 100%;
  }
}
</style> 