<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import BaseChart from '../../components/charts/BaseChart.vue'
import BoxplotChart from '../../components/charts/BoxplotChart.vue'
import LoadingState from '../../components/LoadingState.vue'
import ErrorMessage from '../../components/ErrorMessage.vue'
import { useSalaryStore } from '../../stores/salary'
import echarts from '../../utils/echarts'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

const pageTitle = ref('招聘数据可视化平台 - 薪资分析')
const salaryStore = useSalaryStore()

// 薪资区间分布图表配置
const salaryDistributionChartOptions = computed<any>(() => {
  if (!salaryStore.salaryDistributionOverview) {
    return {}
  }

  const { salary_ranges, counts, percentages } = salaryStore.salaryDistributionOverview

  return {
    title: {
      text: '薪资区间分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        return `${salary_ranges[dataIndex]}<br/>数量: ${counts[dataIndex]}<br/>占比: ${percentages[dataIndex].toFixed(2)}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: salary_ranges,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '职位数量',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: '#5470c6'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ]
  }
})

// 不同学历薪资对比图表配置
const educationSalaryChartOptions = computed<any>(() => {
  if (!salaryStore.salaryChartData) {
    return {}
  }

  const { education_levels, avg_salaries, min_salaries, max_salaries } = salaryStore.salaryChartData
  
  // 计算Y轴最大值，确保有足够空间显示数据标签
  const allSalaries = [...avg_salaries, ...min_salaries, ...max_salaries];
  const maxSalary = Math.max(...allSalaries.filter(val => typeof val === 'number' && !isNaN(val)));
  const yAxisMax = Math.ceil(maxSalary * 1.2); // 增加20%的空间

  return {
    title: {
      text: '不同学历薪资对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        let result = params[0].name + '<br/>';
        params.forEach((item: any) => {
          if (typeof item.value === 'number') {
            result += item.seriesName + ': ' + item.value.toLocaleString() + ' 元<br/>';
          } else {
            result += item.seriesName + ': ' + item.value + '<br/>';
          }
        });
        return result;
      }
    },
    legend: {
      data: ['平均薪资', '最低薪资', '最高薪资'],
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '6%',  // 增加右侧空间
      bottom: '8%',
      top: '25%',   // 增加顶部空间
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: education_levels,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '薪资 (元)',
      max: yAxisMax,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 10000) {
            return (value / 10000).toFixed(0) + '万';
          }
          return value.toLocaleString();
        }
      }
    },
    series: [
      {
        name: '平均薪资',
        type: 'bar',
        data: avg_salaries,
        itemStyle: {
          color: '#5470c6'
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            if (typeof params.value === 'number') {
              return params.value >= 10000 
                ? (params.value / 10000).toFixed(1) + '万' 
                : (params.value / 1000).toFixed(1) + 'K';
            }
            return params.value;
          }
        }
      },
      {
        name: '最低薪资',
        type: 'bar',
        data: min_salaries,
        itemStyle: {
          color: '#91cc75'
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            if (typeof params.value === 'number') {
              return params.value >= 10000 
                ? (params.value / 10000).toFixed(1) + '万' 
                : (params.value / 1000).toFixed(1) + 'K';
            }
            return params.value;
          }
        }
      },
      {
        name: '最高薪资',
        type: 'bar',
        data: max_salaries,
        itemStyle: {
          color: '#ee6666'
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            if (typeof params.value === 'number') {
              return params.value >= 10000 
                ? (params.value / 10000).toFixed(1) + '万' 
                : (params.value / 1000).toFixed(1) + 'K';
            }
            return params.value;
          }
        }
      }
    ]
  }
})

// 高薪职位学历分布图表配置
const highSalaryChartOptions = computed<any>(() => {
  if (!salaryStore.highSalaryChartData) {
    return {}
  }

  const { education_levels, counts, percentages } = salaryStore.highSalaryChartData

  return {
    title: {
      text: '高薪职位学历分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      data: education_levels
    },
    series: [
      {
        name: '学历分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: education_levels.map((item, index) => ({
          value: counts[index],
          name: item,
          percentage: percentages[index]
        }))
      }
    ]
  }
})

// 按学历分组的薪资区间分布图表配置
const salaryByEducationChartOptions = computed<any>(() => {
  if (!salaryStore.salaryDistributionByEducation) {
    return {}
  }

  const apiData = salaryStore.salaryDistributionByEducation
  const educationLevels = apiData.education_levels || []
  const salaryRanges = apiData.salary_ranges || []
  
  const series = educationLevels.map((education: string, eduIndex: number) => ({
    name: education,
    type: 'bar' as const,
    stack: 'total',
    emphasis: {
      focus: 'series'
    },
    data: salaryRanges.map((range: string, rangeIndex: number) => {
      // 确保 apiData.data[eduIndex] 和 apiData.data[eduIndex][rangeIndex] 存在
      return apiData.data?.[eduIndex]?.[rangeIndex]?.count || 0;
    })
  }))

  return {
    title: {
      text: '按学历分组的薪资区间分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: educationLevels,
      top: '10%',
      type: 'scroll',
      width: '80%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: salaryRanges,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series
  }
})

// 按薪资区间分组的学历分布图表配置
const educationBySalaryChartOptions = computed<any>(() => {
  if (!salaryStore.salaryDistributionByRange) {
    return {}
  }

  const apiData = salaryStore.salaryDistributionByRange
  const salaryRanges = apiData.salary_ranges || []
  const educationLevels = apiData.education_levels || []
  
  const series = salaryRanges.map((range: string, rangeIndex: number) => ({
    name: range,
    type: 'bar' as const,
    stack: 'total',
    emphasis: {
      focus: 'series'
    },
    data: educationLevels.map((edu: string, eduIndex: number) => {
       // 确保 apiData.data[rangeIndex] 和 apiData.data[rangeIndex][eduIndex] 存在
      return apiData.data?.[rangeIndex]?.[eduIndex]?.count || 0;
    })
  }))

  return {
    title: {
      text: '按薪资区间分组的学历分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: salaryRanges,
      top: '10%',
      type: 'scroll',
      width: '80%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: educationLevels,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series
  }
})

// 薪资详细分布直方图配置
const salaryHistogramOptions = computed<any>(() => {
  if (!salaryStore.salaryDetailedDistribution) {
    return {}
  }

  const { salary_points, counts, percentages } = salaryStore.salaryDetailedDistribution

  return {
    title: {
      text: '薪资详细分布直方图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        return `薪资: ${salary_points[dataIndex]}元<br/>数量: ${counts[dataIndex]}<br/>占比: ${percentages[dataIndex].toFixed(2)}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: salary_points,
      axisLabel: {
        interval: 'auto',
        rotate: 30,
        formatter: (value: number) => `${value/1000}k`
      },
      name: '薪资(k)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '职位数量'
    },
    series: [
      {
        name: '职位数量',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: '#5470c6'
        },
        barWidth: '90%'
      }
    ]
  }
})

// 薪资分布密度曲线图配置
const salaryDensityCurveOptions = computed<any>(() => {
  if (!salaryStore.salaryDetailedDistribution) {
    return {}
  }

  const { salary_points, percentages, statistics } = salaryStore.salaryDetailedDistribution
  
  // 计算平滑曲线点
  const smoothPercentages = percentages.map((p: number) => p * 3) // 放大比例以便更好地可视化
  
  return {
    title: {
      text: '薪资分布密度曲线图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        return `薪资: ${salary_points[dataIndex]}元<br/>密度: ${percentages[dataIndex].toFixed(4)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: salary_points,
      axisLabel: {
        interval: 'auto',
        rotate: 30,
        formatter: (value: number) => `${value/1000}k`
      },
      name: '薪资(k)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '密度',
      axisLabel: {
        formatter: (value: number) => `${(value / 3).toFixed(4)}`
      }
    },
    series: [
      {
        name: '密度',
        type: 'line',
        data: smoothPercentages,
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#91cc75'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(145, 204, 117, 0.5)' },
            { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
          ])
        },
        markLine: {
          data: [
            { 
              name: '平均值', 
              xAxis: statistics.mean,
              lineStyle: { color: '#ee6666', width: 2, type: 'dashed' },
              label: { formatter: '平均值: {c}' }
            },
            { 
              name: '中位数', 
              xAxis: statistics.median,
              lineStyle: { color: '#5470c6', width: 2, type: 'dashed' },
              label: { formatter: '中位数: {c}' }
            }
          ]
        }
      }
    ]
  }
})

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      salaryStore.fetchSalaryDistributionOverview(),
      salaryStore.fetchSalaryChartData(),
      salaryStore.fetchHighSalaryChartData(),
      salaryStore.fetchSalaryDistributionByEducation(),
      salaryStore.fetchSalaryDistributionByRange(),
      salaryStore.fetchSalaryDetailedDistribution()
    ])
  } catch (error) {
    console.error('加载薪资分析数据失败', error)
  }
}

// 导出数据为Excel
const exportToExcel = (type: 'distribution' | 'education' | 'highSalary') => {
  try {
    let data: any[] = []
    let fileName = ''

    if (type === 'distribution' && salaryStore.salaryDistributionOverview) {
      const { salary_ranges, counts, percentages } = salaryStore.salaryDistributionOverview
      data = salary_ranges.map((range, index) => ({
        '薪资区间': range,
        '职位数量': counts[index],
        '占比': `${percentages[index].toFixed(2)}%`
      }))
      fileName = '薪资区间分布数据'
    } else if (type === 'education' && salaryStore.salaryChartData) {
      const { education_levels, avg_salaries, min_salaries, max_salaries, job_counts } = salaryStore.salaryChartData
      data = education_levels.map((edu, index) => ({
        '学历': edu,
        '平均薪资(K)': avg_salaries[index],
        '最低薪资(K)': min_salaries[index],
        '最高薪资(K)': max_salaries[index],
        '职位数量': job_counts[index]
      }))
      fileName = '学历薪资对比数据'
    } else if (type === 'highSalary' && salaryStore.highSalaryChartData) {
      const { education_levels, counts, percentages } = salaryStore.highSalaryChartData
      data = education_levels.map((edu, index) => ({
        '学历': edu,
        '高薪职位数': counts[index],
        '占比': `${percentages[index].toFixed(2)}%`
      }))
      fileName = '高薪职位学历分布数据'
    }

    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      
      // 生成Excel文件并下载
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`)
      
      ElMessage.success('数据导出成功')
    } else {
      ElMessage.warning('没有可导出的数据')
    }
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 导出详细薪资分布数据为Excel
const exportDetailedDistribution = () => {
  try {
    if (!salaryStore.salaryDetailedDistribution) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const { salary_points, counts, percentages, statistics } = salaryStore.salaryDetailedDistribution
    
    // 薪资点位数据
    const pointData = salary_points.map((point, index) => ({
      '薪资点位': point,
      '职位数量': counts[index],
      '占比': `${percentages[index].toFixed(2)}%`
    }))
    
    // 统计特征数据
    const statsData = [{
      '平均值': statistics.mean,
      '中位数': statistics.median,
      '众数': statistics.mode,
      '最小值': statistics.min,
      '最大值': statistics.max,
      '下四分位数': statistics.quartiles[0],
      '上四分位数': statistics.quartiles[2]
    }]
    
    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new()
    const pointsSheet = XLSX.utils.json_to_sheet(pointData)
    const statsSheet = XLSX.utils.json_to_sheet(statsData)
    
    XLSX.utils.book_append_sheet(workbook, pointsSheet, '薪资分布数据')
    XLSX.utils.book_append_sheet(workbook, statsSheet, '统计特征')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `薪资详细分布数据-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  document.title = pageTitle.value
  loadData()
})
</script>

<template>
  <div class="salary-analysis-container p-4">
    <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>
    
    <!-- 薪资区间总体分布 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>薪资区间总体分布</span>
          <el-button type="primary" size="small" @click="exportToExcel('distribution')" :disabled="!salaryStore.salaryDistributionOverview">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="salaryStore.salaryDistributionOverviewLoading" :loading="true" />
        <ErrorMessage v-else-if="salaryStore.salaryDistributionOverviewError" :error="salaryStore.salaryDistributionOverviewError" />
        <BaseChart v-else-if="salaryStore.salaryDistributionOverview" :options="salaryDistributionChartOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无薪资区间分布数据
        </div>
      </div>
    </el-card>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 按学历分组的薪资区间分布 -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex justify-between items-center">
            <span>按学历分组的薪资区间分布</span>
          </div>
        </template>
        <div class="h-96">
          <LoadingState v-if="salaryStore.salaryDistributionByEducationLoading" :loading="true" />
          <ErrorMessage v-else-if="salaryStore.salaryDistributionByEducationError" :error="salaryStore.salaryDistributionByEducationError" />
          <BaseChart v-else-if="salaryStore.salaryDistributionByEducation" :options="salaryByEducationChartOptions" height="100%" auto-resize />
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            暂无按学历分组的薪资区间分布数据
          </div>
        </div>
      </el-card>
      
      <!-- 按薪资区间分组的学历分布 -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex justify-between items-center">
            <span>按薪资区间分组的学历分布</span>
          </div>
        </template>
        <div class="h-96">
          <LoadingState v-if="salaryStore.salaryDistributionByRangeLoading" :loading="true" />
          <ErrorMessage v-else-if="salaryStore.salaryDistributionByRangeError" :error="salaryStore.salaryDistributionByRangeError" />
          <BaseChart v-else-if="salaryStore.salaryDistributionByRange" :options="educationBySalaryChartOptions" height="100%" auto-resize />
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            暂无按薪资区间分组的学历分布数据
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 不同学历薪资对比 -->
    <el-card shadow="hover" class="mt-6 mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>不同学历薪资对比</span>
          <el-button type="primary" size="small" @click="exportToExcel('education')" :disabled="!salaryStore.salaryChartData">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="salaryStore.salaryChartDataLoading" :loading="true" />
        <ErrorMessage v-else-if="salaryStore.salaryChartDataError" :error="salaryStore.salaryChartDataError" />
        <BaseChart v-else-if="salaryStore.salaryChartData" :options="educationSalaryChartOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无不同学历薪资对比数据
        </div>
      </div>
    </el-card>
    
    <!-- 高薪职位学历分布 -->
    <el-card shadow="hover" class="mt-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>高薪职位学历分布</span>
          <el-button type="primary" size="small" @click="exportToExcel('highSalary')" :disabled="!salaryStore.highSalaryChartData">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="salaryStore.highSalaryChartDataLoading" :loading="true" />
        <ErrorMessage v-else-if="salaryStore.highSalaryChartDataError" :error="salaryStore.highSalaryChartDataError" />
        <BaseChart v-else-if="salaryStore.highSalaryChartData" :options="highSalaryChartOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无高薪职位学历分布数据
        </div>
      </div>
    </el-card>
    
    <!-- 薪资详细分析部分 -->
    <h2 class="text-xl font-bold mt-8 mb-4">薪资详细分析</h2>
    
    <!-- 薪资详细分布直方图 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>薪资详细分布直方图</span>
          <el-button type="primary" size="small" @click="exportDetailedDistribution" :disabled="!salaryStore.salaryDetailedDistribution">
            <el-icon><Download /></el-icon> 导出详细数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="salaryStore.salaryDetailedDistributionLoading" :loading="true" />
        <ErrorMessage v-else-if="salaryStore.salaryDetailedDistributionError" :error="salaryStore.salaryDetailedDistributionError" />
        <BaseChart v-else-if="salaryStore.salaryDetailedDistribution" :options="salaryHistogramOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无薪资详细分布数据
        </div>
      </div>
    </el-card>
    
    <!-- 薪资分布密度曲线图 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>薪资分布密度曲线图</span>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="salaryStore.salaryDetailedDistributionLoading" :loading="true" />
        <ErrorMessage v-else-if="salaryStore.salaryDetailedDistributionError" :error="salaryStore.salaryDetailedDistributionError" />
        <BaseChart v-else-if="salaryStore.salaryDetailedDistribution" :options="salaryDensityCurveOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无薪资分布密度曲线数据
        </div>
      </div>
    </el-card>
    
    <!-- 薪资统计特征箱线图 -->
    <!-- <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>薪资统计特征箱线图</span>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="salaryStore.salaryDetailedDistributionLoading || salaryStore.salaryChartDataLoading" :loading="true" />
        <ErrorMessage v-else-if="salaryStore.salaryDetailedDistributionError || salaryStore.salaryChartDataError" 
          :error="salaryStore.salaryDetailedDistributionError || salaryStore.salaryChartDataError" />
        <BaseChart v-else-if="salaryStore.salaryDetailedDistribution && salaryStore.salaryChartData" 
          :options="salaryStore.boxplotOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无薪资统计特征箱线图数据
        </div>
      </div>
    </el-card> -->
  </div>
</template>

<style scoped>
.salary-analysis-container {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .salary-analysis-container {
    padding: 10px;
  }
}
</style> 