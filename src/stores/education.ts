import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getEducationDistribution, getEducationChartData, getCityEducationAnalysis } from '../api/education'
import { getSalaryChartData } from '../api/salary'
import type { EducationDistribution, EducationChartData, SalaryChartData, CityEducationAnalysisData } from '../api/types'
import type { EChartsOption } from 'echarts/types/dist/shared'

export const useEducationStore = defineStore('education', () => {
  // 学历分布数据
  const educationDistribution = ref<EducationDistribution[]>([])
  const educationDistributionLoading = ref(false)
  const educationDistributionError = ref('')

  // 学历图表数据
  const educationChartData = ref<EducationChartData | null>(null)
  const educationChartDataLoading = ref(false)
  const educationChartDataError = ref('')

  // 学历薪资对比数据
  const educationSalaryData = ref<SalaryChartData | null>(null)
  const educationSalaryDataLoading = ref(false)
  const educationSalaryDataError = ref('')

  // 城市与学历交叉分析数据
  const cityEducationData = ref<CityEducationAnalysisData | null>(null)
  const cityEducationLoading = ref(false)
  const cityEducationError = ref('')
  const cityLimit = ref(5)
  const selectedCities = ref<string[]>([])

  // 获取学历分布数据
  const fetchEducationDistribution = async () => {
    educationDistributionLoading.value = true
    educationDistributionError.value = ''
    try {
      const res = await getEducationDistribution()
      if (res.code === 200) {
        educationDistribution.value = res.data
      } else {
        educationDistributionError.value = res.message || '获取学历分布数据失败'
      }
    } catch (error: any) {
      educationDistributionError.value = error.message || '获取学历分布数据失败'
    } finally {
      educationDistributionLoading.value = false
    }
  }

  // 获取学历图表数据
  const fetchEducationChartData = async () => {
    educationChartDataLoading.value = true
    educationChartDataError.value = ''
    try {
      const res = await getEducationChartData()
      if (res.code === 200) {
        educationChartData.value = res.data
      } else {
        educationChartDataError.value = res.message || '获取学历图表数据失败'
      }
    } catch (error: any) {
      educationChartDataError.value = error.message || '获取学历图表数据失败'
    } finally {
      educationChartDataLoading.value = false
    }
  }

  // 获取学历薪资对比数据
  const fetchEducationSalaryData = async () => {
    educationSalaryDataLoading.value = true
    educationSalaryDataError.value = ''
    try {
      const res = await getSalaryChartData()
      if (res.code === 200) {
        educationSalaryData.value = res.data
      } else {
        educationSalaryDataError.value = res.message || '获取学历薪资对比数据失败'
      }
    } catch (error: any) {
      educationSalaryDataError.value = error.message || '获取学历薪资对比数据失败'
    } finally {
      educationSalaryDataLoading.value = false
    }
  }

  // 城市与学历交叉分析堆叠柱状图配置
  const cityEducationStackedBarOptions = computed<EChartsOption>(() => {
    if (!cityEducationData.value) return {}

    const { cities, education_levels, distribution } = cityEducationData.value

    return {
      title: {
        text: '城市与学历需求交叉分析',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: education_levels,
        top: '10%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: cities,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '占比 (%)'
      },
      series: education_levels.map((level, index) => {
        return {
          name: level,
          type: 'bar',
          stack: '总量',
          emphasis: {
            focus: 'series'
          },
          data: cities.map((_, cityIndex) => distribution[cityIndex][index])
        }
      })
    } as EChartsOption
  })

  // 学历需求城市分布热力图配置
  const cityEducationHeatmapOptions = computed<EChartsOption>(() => {
    if (!cityEducationData.value) return {}

    const { cities, education_levels, distribution } = cityEducationData.value

    // 准备热力图数据
    const formattedData: [number, number, number][] = []
    for (let i = 0; i < cities.length; i++) {
      for (let j = 0; j < education_levels.length; j++) {
        formattedData.push([j, i, distribution[i][j]])
      }
    }

    return {
      title: {
        text: '学历需求城市分布热力图',
        left: 'center'
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const city = cities[params.data[1]]
          const education = education_levels[params.data[0]]
          const value = params.data[2]
          return `${city} / ${education}: ${value}%`
        }
      },
      grid: {
        height: '70%',
        top: '15%'
      },
      xAxis: {
        type: 'category',
        data: education_levels,
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: cities,
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 50, // 假设最高占比为50%
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%'
      },
      series: [{
        name: '学历需求占比',
        type: 'heatmap',
        data: formattedData,
        label: {
          show: true,
          formatter: (params: any) => params.data[2] + '%'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    } as EChartsOption
  })

  // 学历需求城市对比雷达图配置
  const cityEducationRadarOptions = computed<EChartsOption>(() => {
    if (!cityEducationData.value || !selectedCities.value.length) return {}

    const { cities, education_levels, distribution } = cityEducationData.value
    const selectedCityIndices = selectedCities.value.map(city => cities.indexOf(city)).filter(index => index !== -1)

    if (selectedCityIndices.length === 0) return {}

    return {
      title: {
        text: '学历需求城市对比',
        left: 'center'
      },
      tooltip: {},
      legend: {
        data: selectedCities.value,
        bottom: '5%'
      },
      radar: {
        indicator: education_levels.map(level => ({
          name: level,
          max: 60 // 假设最高占比为60%
        })),
        shape: 'polygon',
        splitNumber: 5
      },
      series: [{
        type: 'radar',
        data: selectedCityIndices.map(cityIndex => ({
          name: cities[cityIndex],
          value: distribution[cityIndex],
          areaStyle: {
            opacity: 0.3
          }
        }))
      }]
    } as EChartsOption
  })

  // 获取城市与学历交叉分析数据
  const fetchCityEducationAnalysis = async (limit: number = cityLimit.value) => {
    cityEducationLoading.value = true
    cityEducationError.value = ''
    cityLimit.value = limit
    
    try {
      const res = await getCityEducationAnalysis(limit)
      if (res.code === 200) {
        cityEducationData.value = res.data
        // 默认选择前两个城市进行对比
        if (res.data.cities.length >= 2) {
          selectedCities.value = res.data.cities.slice(0, 2)
        }
      } else {
        cityEducationError.value = res.message || '获取城市与学历交叉分析数据失败'
      }
    } catch (error: any) {
      cityEducationError.value = error.message || '获取城市与学历交叉分析数据失败'
    } finally {
      cityEducationLoading.value = false
    }
  }

  // 更新选中的城市
  const updateSelectedCities = (cities: string[]) => {
    selectedCities.value = cities
  }

  return {
    // 状态
    educationDistribution,
    educationDistributionLoading,
    educationDistributionError,
    educationChartData,
    educationChartDataLoading,
    educationChartDataError,
    educationSalaryData,
    educationSalaryDataLoading,
    educationSalaryDataError,
    cityEducationData,
    cityEducationLoading,
    cityEducationError,
    cityLimit,
    selectedCities,
    
    // 计算属性
    cityEducationStackedBarOptions,
    cityEducationHeatmapOptions,
    cityEducationRadarOptions,
    
    // 方法
    fetchEducationDistribution,
    fetchEducationChartData,
    fetchEducationSalaryData,
    fetchCityEducationAnalysis,
    updateSelectedCities
  }
}) 