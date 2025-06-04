<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EChartsOption } from 'echarts/types/dist/shared'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  xAxisData: {
    type: Array as () => string[],
    required: true
  },
  boxplotData: {
    type: Array as () => Array<{
      name: string,
      data: number[] | number[][]
    }>,
    required: true
  },
  title: String,
  height: String,
  width: String,
  autoResize: {
    type: Boolean,
    default: true
  },
  yAxisName: String,
  showTooltip: {
    type: Boolean,
    default: true
  },
  colorScheme: Array as () => string[]
})

// 手动计算箱线图数据
const calculateBoxplotData = (data: number[]): number[] => {
  // 对数据进行排序
  const sortedData = [...data].sort((a, b) => a - b)
  const len = sortedData.length
  
  // 计算最小值、最大值
  const min = sortedData[0]
  const max = sortedData[len - 1]
  
  // 计算中位数
  const median = len % 2 === 0
    ? (sortedData[len / 2 - 1] + sortedData[len / 2]) / 2
    : sortedData[Math.floor(len / 2)]
  
  // 计算下四分位数Q1
  const q1Index = Math.floor(len * 0.25)
  const q1 = len % 4 === 0
    ? (sortedData[q1Index - 1] + sortedData[q1Index]) / 2
    : sortedData[q1Index]
  
  // 计算上四分位数Q3
  const q3Index = Math.floor(len * 0.75)
  const q3 = len % 4 === 0
    ? (sortedData[q3Index - 1] + sortedData[q3Index]) / 2
    : sortedData[q3Index]
  
  return [min, q1, median, q3, max]
}

// 计算箱线图的配置选项
const chartOptions = computed<EChartsOption>(() => {
  // 处理数据，如果提供的是原始数据，则计算箱线图所需的统计值
  const processedData = props.boxplotData.map(item => {
    if (item.data.length > 0 && Array.isArray(item.data[0])) {
      // 已经是处理好的箱线图数据 [min, Q1, median, Q3, max]
      return {
        name: item.name,
        data: item.data
      }
    } else {
      // 原始数据，需要计算箱线图统计值
      const boxData = calculateBoxplotData(item.data as number[])
      return {
        name: item.name,
        data: [boxData] // 封装为二维数组，因为每个系列可能有多个箱线图
      }
    }
  })

  return {
    title: props.title ? {
      text: props.title,
      left: 'center'
    } : undefined,
    tooltip: props.showTooltip ? {
      trigger: 'item' as const,
      axisPointer: {
        type: 'shadow' as const
      },
      formatter: (params: any) => {
        if (params.seriesType === 'boxplot') {
          const data = params.data
          return `${params.name}<br/>
            最大值: ${data[4]}<br/>
            上四分位数: ${data[3]}<br/>
            中位数: ${data[2]}<br/>
            下四分位数: ${data[1]}<br/>
            最小值: ${data[0]}`
        } else {
          return `${params.name}: ${params.value}`
        }
      }
    } : undefined,
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category' as const,
      data: props.xAxisData,
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false
      },
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value' as const,
      name: props.yAxisName || '',
      splitArea: {
        show: true
      }
    },
    series: processedData.map((item, index) => {
      const color = props.colorScheme && props.colorScheme[index % (props.colorScheme.length || 1)]
      
      return {
        name: item.name,
        type: 'boxplot' as const,
        data: item.data,
        itemStyle: color ? {
          color: color,
          borderColor: color
        } : undefined
      }
    })
  } as EChartsOption
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
