<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { EChartsOption } from 'echarts/types/dist/shared'
import BaseChart from './BaseChart.vue'

const props = defineProps<{
  xAxisData: string[]
  yAxisData: string[]
  data: number[][] | Array<[number, number, number]>
  visualMin?: number
  visualMax?: number
  height?: string
  width?: string
  autoResize?: boolean
  title?: string
  showLabel?: boolean
}>()

// 计算热力图的配置选项
const chartOptions = computed<EChartsOption>(() => {
  // 确定数据格式并转换
  let formattedData: Array<[number, number, number]>
  
  if (Array.isArray(props.data[0])) {
    // 如果是二维数组，转换为热力图所需的格式 [x, y, value]
    if (typeof props.data[0][0] === 'number' && !Array.isArray(props.data[0][0])) {
      formattedData = []
      for (let i = 0; i < props.data.length; i++) {
        for (let j = 0; j < (props.data[i] as number[]).length; j++) {
          formattedData.push([j, i, (props.data[i] as number[])[j]])
        }
      }
    } else {
      // 已经是 [x, y, value] 格式
      formattedData = props.data as Array<[number, number, number]>
    }
  } else {
    formattedData = []
  }

  // 计算visualMap的最小值和最大值
  const visualMin = props.visualMin !== undefined ? props.visualMin : 
    Math.min(...formattedData.map(item => item[2]))
  const visualMax = props.visualMax !== undefined ? props.visualMax : 
    Math.max(...formattedData.map(item => item[2]))

  return {
    title: props.title ? {
      text: props.title,
      left: 'center'
    } : undefined,
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const xValue = props.xAxisData[params.data[0]]
        const yValue = props.yAxisData[params.data[1]]
        const value = params.data[2]
        return `${yValue} / ${xValue}: ${value}`
      }
    },
    grid: {
      height: '70%',
      top: props.title ? '15%' : '10%'
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: props.yAxisData,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: visualMin,
      max: visualMax,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%'
    },
    series: [{
      name: '热力图',
      type: 'heatmap',
      data: formattedData,
      label: {
        show: props.showLabel,
        formatter: (params: any) => params.data[2]
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
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