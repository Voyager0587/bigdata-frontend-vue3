<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EChartsOption } from 'echarts/types/dist/shared'
import BaseChart from './BaseChart.vue'

interface RadarIndicator {
  name: string
  max?: number
}

interface RadarSeriesData {
  name: string
  value: number[]
}

const props = defineProps<{
  indicators: RadarIndicator[]
  seriesData: RadarSeriesData[]
  title?: string
  height?: string
  width?: string
  autoResize?: boolean
  shape?: 'polygon' | 'circle'
  areaStyle?: boolean
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
}>()

// 计算雷达图的最大值（如果未提供）
const processedIndicators = computed(() => {
  if (props.indicators.every(indicator => indicator.max !== undefined)) {
    return props.indicators
  }
  
  // 计算每个维度的最大值
  const maxValues: number[] = []
  for (let i = 0; i < props.indicators.length; i++) {
    const values = props.seriesData.map(item => item.value[i] || 0)
    maxValues[i] = Math.max(...values) * 1.2 // 增加20%的余量
  }
  
  return props.indicators.map((indicator, index) => ({
    ...indicator,
    max: indicator.max !== undefined ? indicator.max : maxValues[index]
  }))
})

// 计算雷达图的配置选项
const chartOptions = computed<EChartsOption>(() => {
  return {
    title: props.title ? {
      text: props.title,
      left: 'center'
    } : undefined,
    tooltip: {
      trigger: 'item'
    },
    legend: props.showLegend !== false ? {
      orient: props.legendPosition === 'left' || props.legendPosition === 'right' ? 'vertical' : 'horizontal',
      [props.legendPosition || 'bottom']: 10,
      data: props.seriesData.map(item => item.name)
    } : undefined,
    radar: {
      indicator: processedIndicators.value,
      shape: props.shape || 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#333',
        backgroundColor: '#eee',
        borderRadius: 3,
        padding: [3, 5]
      }
    },
    series: [{
      type: 'radar',
      data: props.seriesData.map(item => ({
        name: item.name,
        value: item.value,
        areaStyle: props.areaStyle ? { opacity: 0.3 } : undefined
      }))
    }]
  }
})

// 暴露BaseChart的方法
const baseChartRef = ref<InstanceType<typeof BaseChart> | null>(null)

defineExpose({
  getEchartsInstance: () => baseChartRef.value?.getEchartsInstance(),
  resize: () => baseChartRef.value?.resize()
})
</script>

<template>
  <BaseChart 
    ref="baseChartRef"
    :options="chartOptions" 
    :height="height" 
    :width="width"
    :auto-resize="autoResize"
  />
</template> 