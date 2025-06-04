import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCityChartData, getTopCities } from '../api/city'
import { getSalaryDistributionOverview } from '../api/salary'
import { getEducationChartData } from '../api/education'
import { getCompanySizeChartData, getIndustrySalary } from '../api/company'
import type { CityChartData, CityDistribution, SalaryDistributionOverview, EducationChartData, CompanySizeChartData, IndustrySalaryData } from '../api/types'
import type { EChartsOption } from 'echarts/types/dist/shared'

export const useDashboardStore = defineStore('dashboard', () => {
  // 状态
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const lastUpdated = ref<Date | null>(null)
  
  // 数据
  const cityDistribution = ref<CityChartData | null>(null)
  const topCities = ref<CityDistribution[]>([])
  const salaryDistribution = ref<SalaryDistributionOverview | null>(null)
  const educationDistribution = ref<EducationChartData | null>(null)
  const companySizeDistribution = ref<CompanySizeChartData | null>(null)
  const industrySalaryData = ref<IndustrySalaryData | null>(null)
  
  // 高薪行业显示数量
  const industryDisplayCount = ref<number>(10)
  
  // 计算属性
  const totalJobs = computed(() => {
    return salaryDistribution.value?.total || 0
  })
  
  const mostPopularCity = computed(() => {
    if (!topCities.value.length) return null
    return topCities.value[0]
  })
  
  const mostPopularEducation = computed(() => {
    if (!educationDistribution.value) return null
    const { education_levels, counts } = educationDistribution.value
    const maxIndex = counts.indexOf(Math.max(...counts))
    return {
      name: education_levels[maxIndex],
      count: counts[maxIndex]
    }
  })
  
  const mostPopularCompanySize = computed(() => {
    if (!companySizeDistribution.value) return null
    const { sizes, counts } = companySizeDistribution.value
    const maxIndex = counts.indexOf(Math.max(...counts))
    return {
      name: sizes[maxIndex],
      count: counts[maxIndex]
    }
  })
  
  const averageSalaryRange = computed(() => {
    if (!salaryDistribution.value) return null
    const { salary_ranges, counts } = salaryDistribution.value
    const maxIndex = counts.indexOf(Math.max(...counts))
    return salary_ranges[maxIndex]
  })
  
  // 排序后的行业薪资数据
  const sortedIndustrySalaryData = computed(() => {
    if (!industrySalaryData.value) return []
    
    const { industries, avg_salaries } = industrySalaryData.value
    
    // 按照薪资从高到低排序
    return industries.map((industry, index) => ({
      industry,
      salary: avg_salaries[index]
    })).sort((a, b) => b.salary - a.salary)
  })
  
  // 高薪行业排行图表配置
  const industrySalaryChartOptions = computed<EChartsOption>(() => {
    if (!industrySalaryData.value) return {}
    
    // 只取前N个行业，避免图表过于拥挤
    const topIndustries = sortedIndustrySalaryData.value.slice(0, industryDisplayCount.value)
    const sortedIndustries = topIndustries.map(item => item.industry)
    const sortedSalaries = topIndustries.map(item => item.salary)
    
    return {
      title: {
        text: `高薪行业排行 (前${industryDisplayCount.value}名)`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0]
          return `${data.name}<br/>${data.seriesName}: ${(data.value / 1000).toFixed(1)}K 元`
        }
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '平均薪资 (元)'
      },
      yAxis: {
        type: 'category',
        data: sortedIndustries,
        axisLabel: {
          interval: 0
        }
      },
      series: [
        {
          name: '平均薪资',
          type: 'bar',
          data: sortedSalaries,
          itemStyle: {
            color: function(params: any) {
              // 使用渐变色
              return {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#188df0' }
                ]
              }
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              if (typeof params.value === 'number') {
                return (params.value / 1000).toFixed(1) + 'K'
              }
              return params.value
            }
          }
        }
      ]
    }
  })
  
  // 更新行业显示数量
  const updateIndustryDisplayCount = (count: number) => {
    industryDisplayCount.value = count
  }
  
  // 方法
  const fetchDashboardData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // 并行请求所有数据
      const [cityData, topCitiesData, salaryData, educationData, companySizeData, industryData] = await Promise.all([
        getCityChartData(10),
        getTopCities(10),
        getSalaryDistributionOverview(),
        getEducationChartData(),
        getCompanySizeChartData(),
        getIndustrySalary()
      ])
      
      cityDistribution.value = cityData.data
      topCities.value = topCitiesData.data
      salaryDistribution.value = salaryData.data
      educationDistribution.value = educationData.data
      companySizeDistribution.value = companySizeData.data
      industrySalaryData.value = industryData.data
      
      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('获取数据失败')
      console.error('获取仪表盘数据失败:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const refreshData = () => {
    return fetchDashboardData()
  }
  
  return {
    // 状态
    isLoading,
    error,
    lastUpdated,
    
    // 数据
    cityDistribution,
    topCities,
    salaryDistribution,
    educationDistribution,
    companySizeDistribution,
    industrySalaryData,
    industryDisplayCount,
    sortedIndustrySalaryData,
    
    // 计算属性
    totalJobs,
    mostPopularCity,
    mostPopularEducation,
    mostPopularCompanySize,
    averageSalaryRange,
    industrySalaryChartOptions,
    
    // 方法
    fetchDashboardData,
    refreshData,
    updateIndustryDisplayCount
  }
}) 