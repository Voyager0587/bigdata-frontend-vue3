import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getSalaryDistribution,
  getSalaryDistributionByEducation,
  getSalaryDistributionByRange,
  getSalaryDistributionOverview,
  getHighSalaryChartData,
  getSalaryAnalysis,
  getSalaryChartData,
  getSalaryDetailedDistribution
} from '../api/salary'
import type {
  SalaryDistribution,
  SalaryDistributionOverview,
  HighSalaryChartData,
  SalaryChartData,
  SalaryDetailedDistribution
} from '../api/types'
import type { EChartsOption } from 'echarts/types/dist/shared'

export const useSalaryStore = defineStore('salary', () => {
  // 薪资区间分布数据
  const salaryDistribution = ref<SalaryDistribution[]>([])
  const salaryDistributionLoading = ref(false)
  const salaryDistributionError = ref('')

  // 薪资区间总体分布数据
  const salaryDistributionOverview = ref<SalaryDistributionOverview | null>(null)
  const salaryDistributionOverviewLoading = ref(false)
  const salaryDistributionOverviewError = ref('')

  // 按学历分组的薪资区间分布数据
  const salaryDistributionByEducation = ref<any>(null)
  const salaryDistributionByEducationLoading = ref(false)
  const salaryDistributionByEducationError = ref('')

  // 按薪资区间分组的学历分布数据
  const salaryDistributionByRange = ref<any>(null)
  const salaryDistributionByRangeLoading = ref(false)
  const salaryDistributionByRangeError = ref('')

  // 高薪职位学历分布数据
  const highSalaryChartData = ref<HighSalaryChartData | null>(null)
  const highSalaryChartDataLoading = ref(false)
  const highSalaryChartDataError = ref('')

  // 学历薪资对比数据
  const salaryChartData = ref<SalaryChartData | null>(null)
  const salaryChartDataLoading = ref(false)
  const salaryChartDataError = ref('')

  // 薪资详细分布数据
  const salaryDetailedDistribution = ref<SalaryDetailedDistribution | null>(null)
  const salaryDetailedDistributionLoading = ref(false)
  const salaryDetailedDistributionError = ref('')
  const salaryGroupInterval = ref(1000) // 薪资分组间隔，默认为1000

  // 获取薪资区间分布数据
  const fetchSalaryDistribution = async () => {
    salaryDistributionLoading.value = true
    salaryDistributionError.value = ''
    try {
      const res = await getSalaryDistribution()
      if (res.code === 200) {
        salaryDistribution.value = res.data
      } else {
        salaryDistributionError.value = res.message || '获取薪资区间分布数据失败'
      }
    } catch (error: any) {
      salaryDistributionError.value = error.message || '获取薪资区间分布数据失败'
    } finally {
      salaryDistributionLoading.value = false
    }
  }

  // 获取薪资区间总体分布数据
  const fetchSalaryDistributionOverview = async () => {
    salaryDistributionOverviewLoading.value = true
    salaryDistributionOverviewError.value = ''
    try {
      const res = await getSalaryDistributionOverview()
      if (res.code === 200) {
        salaryDistributionOverview.value = res.data
      } else {
        salaryDistributionOverviewError.value = res.message || '获取薪资区间总体分布数据失败'
      }
    } catch (error: any) {
      salaryDistributionOverviewError.value = error.message || '获取薪资区间总体分布数据失败'
    } finally {
      salaryDistributionOverviewLoading.value = false
    }
  }

  // 获取按学历分组的薪资区间分布数据
  const fetchSalaryDistributionByEducation = async () => {
    salaryDistributionByEducationLoading.value = true
    salaryDistributionByEducationError.value = ''
    try {
      const res = await getSalaryDistributionByEducation()
      if (res.code === 200) {
        salaryDistributionByEducation.value = res.data
      } else {
        salaryDistributionByEducationError.value = res.message || '获取按学历分组的薪资区间分布数据失败'
      }
    } catch (error: any) {
      salaryDistributionByEducationError.value = error.message || '获取按学历分组的薪资区间分布数据失败'
    } finally {
      salaryDistributionByEducationLoading.value = false
    }
  }

  // 获取按薪资区间分组的学历分布数据
  const fetchSalaryDistributionByRange = async () => {
    salaryDistributionByRangeLoading.value = true
    salaryDistributionByRangeError.value = ''
    try {
      const res = await getSalaryDistributionByRange()
      if (res.code === 200) {
        salaryDistributionByRange.value = res.data
      } else {
        salaryDistributionByRangeError.value = res.message || '获取按薪资区间分组的学历分布数据失败'
      }
    } catch (error: any) {
      salaryDistributionByRangeError.value = error.message || '获取按薪资区间分组的学历分布数据失败'
    } finally {
      salaryDistributionByRangeLoading.value = false
    }
  }

  // 获取高薪职位学历分布数据
  const fetchHighSalaryChartData = async () => {
    highSalaryChartDataLoading.value = true
    highSalaryChartDataError.value = ''
    try {
      const res = await getHighSalaryChartData()
      if (res.code === 200) {
        highSalaryChartData.value = res.data
      } else {
        highSalaryChartDataError.value = res.message || '获取高薪职位学历分布数据失败'
      }
    } catch (error: any) {
      highSalaryChartDataError.value = error.message || '获取高薪职位学历分布数据失败'
    } finally {
      highSalaryChartDataLoading.value = false
    }
  }

  // 获取学历薪资对比数据
  const fetchSalaryChartData = async () => {
    salaryChartDataLoading.value = true
    salaryChartDataError.value = ''
    try {
      const res = await getSalaryChartData()
      if (res.code === 200) {
        salaryChartData.value = res.data
      } else {
        salaryChartDataError.value = res.message || '获取学历薪资对比数据失败'
      }
    } catch (error: any) {
      salaryChartDataError.value = error.message || '获取学历薪资对比数据失败'
    } finally {
      salaryChartDataLoading.value = false
    }
  }

  // 获取薪资详细分布数据
  const fetchSalaryDetailedDistribution = async (interval?: number) => {
    salaryDetailedDistributionLoading.value = true
    salaryDetailedDistributionError.value = ''
    
    // 如果提供了间隔参数，更新状态
    if (interval !== undefined) {
      salaryGroupInterval.value = interval
    }
    
    try {
      const res = await getSalaryDetailedDistribution(salaryGroupInterval.value)
      if (res.code === 200) {
        salaryDetailedDistribution.value = res.data
      } else {
        salaryDetailedDistributionError.value = res.message || '获取薪资详细分布数据失败'
      }
    } catch (error: any) {
      salaryDetailedDistributionError.value = error.message || '获取薪资详细分布数据失败'
    } finally {
      salaryDetailedDistributionLoading.value = false
    }
  }

  // 更新薪资分组间隔
  const updateSalaryGroupInterval = (interval: number) => {
    salaryGroupInterval.value = interval
    // 重新获取数据
    fetchSalaryDetailedDistribution(interval)
  }

  // 薪资详细分布直方图配置
  const histogramOptions = computed<EChartsOption>(() => {
    if (!salaryDetailedDistribution.value) return {}

    const { salary_points, counts, percentages } = salaryDetailedDistribution.value

    return {
      title: {
        text: '薪资详细分布直方图',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          const index = params[0].dataIndex
          return `${salary_points[index]}元: ${counts[index]}个职位 (${percentages[index]}%)`
        }
      },
      xAxis: {
        type: 'category',
        data: salary_points.map(p => p + '元'),
        name: '月薪',
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '职位数量'
      },
      series: [{
        data: counts,
        type: 'bar',
        barWidth: '90%',
        itemStyle: {
          color: function(params: any) {
            // 根据数量设置渐变色
            return {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#83bff6'
              }, {
                offset: 1, color: '#188df0'
              }]
            }
          }
        }
      }],
      grid: {
        bottom: 100
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 100
      }, {
        start: 0,
        end: 100
      }]
    } as EChartsOption
  })

  // 薪资分布密度曲线图配置
  const densityCurveOptions = computed<EChartsOption>(() => {
    if (!salaryDetailedDistribution.value) return {}

    const { distribution_curve } = salaryDetailedDistribution.value
    const { x_axis, y_axis } = distribution_curve

    return {
      title: {
        text: '薪资分布密度曲线图',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          const index = params[0].dataIndex
          return `${x_axis[index]}元: ${y_axis[index]}个职位`
        }
      },
      xAxis: {
        type: 'category',
        data: x_axis.map(x => x + '元'),
        name: '月薪',
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '职位数量'
      },
      series: [{
        data: y_axis,
        type: 'line',
        smooth: true,
        symbol: 'none',
        areaStyle: {
          opacity: 0.5,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#ff7300'
            }, {
              offset: 1, color: 'rgba(255, 115, 0, 0.1)'
            }]
          }
        },
        lineStyle: {
          color: '#ff7300',
          width: 2
        }
      }],
      grid: {
        bottom: 100
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 100
      }, {
        start: 0,
        end: 100
      }]
    } as EChartsOption
  })

  // 薪资统计特征箱线图配置
  const boxplotOptions = computed<EChartsOption>(() => {
    if (!salaryDetailedDistribution.value || !salaryChartData.value) return {}

    const { statistics } = salaryDetailedDistribution.value
    const { education_levels } = salaryChartData.value

    // 准备箱线图数据
    // 每个学历对应一个箱线图数据：[最小值, 下四分位数, 中位数, 上四分位数, 最大值]
    const boxplotData = education_levels.map((edu, index) => {
      // 这里假设后端返回的是每个学历的箱线图数据
      // 实际应用中可能需要根据API返回的数据进行调整
      return [
        statistics.min,
        statistics.quartiles[0],
        statistics.median,
        statistics.quartiles[2],
        statistics.max
      ]
    })

    return {
      title: {
        text: '薪资统计特征箱线图',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
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
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: education_levels,
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
        type: 'value',
        name: '薪资 (元)',
        splitArea: {
          show: true
        }
      },
      series: [{
        name: '薪资分布',
        type: 'boxplot',
        data: boxplotData,
        itemStyle: {
          color: '#5470c6',
          borderColor: '#5470c6'
        }
      }]
    } as EChartsOption
  })

  return {
    // 状态
    salaryDistribution,
    salaryDistributionLoading,
    salaryDistributionError,
    salaryDistributionOverview,
    salaryDistributionOverviewLoading,
    salaryDistributionOverviewError,
    salaryDistributionByEducation,
    salaryDistributionByEducationLoading,
    salaryDistributionByEducationError,
    salaryDistributionByRange,
    salaryDistributionByRangeLoading,
    salaryDistributionByRangeError,
    highSalaryChartData,
    highSalaryChartDataLoading,
    highSalaryChartDataError,
    salaryChartData,
    salaryChartDataLoading,
    salaryChartDataError,
    salaryDetailedDistribution,
    salaryDetailedDistributionLoading,
    salaryDetailedDistributionError,
    salaryGroupInterval,
    
    // 计算属性
    histogramOptions,
    densityCurveOptions,
    boxplotOptions,
    
    // 方法
    fetchSalaryDistribution,
    fetchSalaryDistributionOverview,
    fetchSalaryDistributionByEducation,
    fetchSalaryDistributionByRange,
    fetchHighSalaryChartData,
    fetchSalaryChartData,
    fetchSalaryDetailedDistribution,
    updateSalaryGroupInterval
  }
}) 