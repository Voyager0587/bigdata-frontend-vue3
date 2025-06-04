<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { EChartsOption } from 'echarts/types/dist/shared'
import echarts from '../../utils/echarts'
import { useElementSize } from '@vueuse/core'

// 定义LoadingOption类型
interface LoadingOption {
  text?: string;
  color?: string;
  textColor?: string;
  maskColor?: string;
  zlevel?: number;
  fontSize?: number;
  showSpinner?: boolean;
  spinnerRadius?: number;
  lineWidth?: number;
}

const props = defineProps<{
  options: EChartsOption
  height?: string
  width?: string
  autoResize?: boolean
  animation?: boolean
  animationDuration?: number
  animationThreshold?: number
  animationEasing?: string
  showLoading?: boolean
  loadingOptions?: LoadingOption
}>()

const emit = defineEmits(['chartReady', 'chartClick', 'chartMouseover', 'chartMouseout'])

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const isLoading = ref(false)

// 使用VueUse的useElementSize获取元素尺寸变化
const { width, height } = useElementSize(chartRef)

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    
    // 设置默认动画配置
    const defaultOptions: EChartsOption = {
      animation: props.animation !== false,
      animationDuration: props.animationDuration || 1000,
      animationThreshold: props.animationThreshold || 2000,
      animationEasing: props.animationEasing || 'cubicOut' as any,
      animationDelay: function () {
        return Math.random() * 200;
      }
    }
    
    // 合并默认选项和传入选项
    const mergedOptions = {
      ...defaultOptions,
      ...props.options
    }
    
    chartInstance.setOption(mergedOptions)
    
    // 添加事件监听
    chartInstance.on('click', (params) => {
      emit('chartClick', params)
    })
    
    chartInstance.on('mouseover', (params) => {
      emit('chartMouseover', params)
    })
    
    chartInstance.on('mouseout', (params) => {
      emit('chartMouseout', params)
    })
    
    // 通知父组件图表已准备好
    emit('chartReady', chartInstance)
  }
}

// 更新图表尺寸
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 显示加载状态
const showLoading = () => {
  if (chartInstance && props.showLoading) {
    isLoading.value = true
    const defaultLoadingOptions: LoadingOption = {
      text: '数据加载中...',
      color: 'var(--primary-500)',
      textColor: 'var(--gray-600)',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0,
      fontSize: 14,
      showSpinner: true,
      spinnerRadius: 10,
      lineWidth: 5,
    }
    
    chartInstance.showLoading(props.loadingOptions || defaultLoadingOptions)
  }
}

// 隐藏加载状态
const hideLoading = () => {
  if (chartInstance && isLoading.value) {
    chartInstance.hideLoading()
    isLoading.value = false
  }
}

// 监听窗口大小变化
watch([width, height], () => {
  if (props.autoResize !== false) {
    nextTick(() => {
      resizeChart()
    })
  }
})

// 监听options变化
watch(
  () => props.options,
  (newOptions) => {
    if (chartInstance) {
      // 如果正在加载，先隐藏加载状态
      if (isLoading.value) {
        hideLoading()
      }
      
      // 更新图表配置
      chartInstance.setOption(newOptions, true)
    }
  },
  { deep: true }
)

// 监听showLoading变化
watch(
  () => props.showLoading,
  (newVal) => {
    if (newVal) {
      showLoading()
    } else {
      hideLoading()
    }
  }
)

onMounted(() => {
  nextTick(() => {
    initChart()
    if (props.showLoading) {
      showLoading()
    }
  })
})

// 销毁图表实例，避免内存泄漏
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 暴露方法给父组件
defineExpose({
  getEchartsInstance: () => chartInstance,
  resize: resizeChart,
  showLoading,
  hideLoading
})
</script>

<template>
  <div class="chart-container animate-fade-in">
    <div 
      ref="chartRef" 
      :style="{ 
        width: width || '100%', 
        height: height || '400px',
        position: 'relative'
      }"
      class="echarts-container hover-shadow"
    ></div>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.echarts-container {
  min-height: 200px;
  border-radius: var(--border-radius-md);
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.hover-shadow:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
</style> 