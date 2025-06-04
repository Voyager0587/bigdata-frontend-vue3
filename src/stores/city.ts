import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCityDistribution, getTopCities, getCityChartData, getSalaryCityHeatmap, getCityComparison } from '../api/city'
import type { CityDistribution, CityChartData, SalaryCityHeatmapData, CityComparisonData, ActualCityComparisonData } from '../api/types'
import type { EChartsOption } from 'echarts/types/dist/shared'

export const useCityStore = defineStore('city', () => {
  // 状态
  const isLoading = ref(false)
  const isHeatmapLoading = ref(false)
  const isComparisonLoading = ref(false)
  const error = ref<Error | null>(null)
  const heatmapError = ref<Error | null>(null)
  const comparisonError = ref<Error | null>(null)
  const lastUpdated = ref<Date | null>(null)
  
  // 筛选条件
  const limit = ref(20)
  const heatmapLimit = ref(10)
  const selectedCities = ref<string[]>([])
  
  // 数据
  const cityDistribution = ref<CityDistribution[]>([])
  const topCities = ref<CityDistribution[]>([])
  const cityChartData = ref<CityChartData | null>(null)
  const salaryCityHeatmap = ref<SalaryCityHeatmapData | null>(null)
  const cityComparison = ref<CityComparisonData | null>(null)
  const rawComparisonData = ref<any>(null)
  
  // 计算属性
  const totalCities = computed(() => cityDistribution.value.length)
  
  const totalJobs = computed(() => {
    return cityDistribution.value.reduce((sum, city) => sum + city.count, 0)
  })
  
  const cityRankingOptions = computed<EChartsOption>(() => {
    if (!topCities.value.length) return {}
    
    return {
      title: {
        text: '城市招聘数量排名',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '职位数量'
      },
      yAxis: {
        type: 'category',
        data: topCities.value.map(city => city.工作地点),
        axisLabel: {
          interval: 0
        }
      },
      series: [
        {
          name: '职位数量',
          type: 'bar',
          data: topCities.value.map(city => city.count),
          itemStyle: {
            color: function(params: any) {
              // 为前三名设置不同颜色
              const colorList = ['#e74c3c', '#f39c12', '#3498db', '#409EFF', '#409EFF', '#409EFF']
              return params.dataIndex < 3 ? colorList[params.dataIndex] : colorList[5]
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}'
          }
        }
      ]
    } as EChartsOption
  })
  
  const cityDistributionOptions = computed<EChartsOption>(() => {
    if (!cityChartData.value) return {}
    
    return {
      title: {
        text: '城市招聘分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        data: cityChartData.value.cities
      },
      series: [
        {
          name: '招聘分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: cityChartData.value.cities.map((city, index) => ({
            value: cityChartData.value!.counts[index],
            name: city
          }))
        }
      ]
    } as EChartsOption
  })
  
  // 热力图选项
  const heatmapOptions = computed<EChartsOption>(() => {
    if (!salaryCityHeatmap.value) return {}
    
    // 准备热力图数据
    const { cities, salary_ranges, heatmap_data } = salaryCityHeatmap.value
    const formattedData: [number, number, number][] = []
    
    // 转换为热力图所需的 [x, y, value] 格式
    for (let i = 0; i < cities.length; i++) {
      for (let j = 0; j < salary_ranges.length; j++) {
        formattedData.push([j, i, heatmap_data[i][j]])
      }
    }
    
    // 计算最大值和最小值
    const values = formattedData.map(item => item[2])
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    return {
      title: {
        text: '城市薪资热力图',
        left: 'center'
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const city = cities[params.data[1]]
          const salaryRange = salary_ranges[params.data[0]]
          const value = params.data[2]
          return `${city} / ${salaryRange}: ${value} 个职位`
        }
      },
      grid: {
        height: '70%',
        top: '15%'
      },
      xAxis: {
        type: 'category',
        data: salary_ranges,
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
        min: min,
        max: max,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%'
      },
      series: [{
        name: '职位数量',
        type: 'heatmap',
        data: formattedData,
        label: {
          show: true
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
  
  // 城市对比雷达图选项
  const cityComparisonRadarOptions = computed<EChartsOption>(() => {
    if (!cityComparison.value) return {}
    
    const { cities, counts, percentages, salary_comparison } = cityComparison.value
    
    // 计算最大值
    const maxCount = Math.max(...counts)
    const maxPercentage = Math.max(...percentages)
    const salaryData = Object.values(salary_comparison)
    const maxAvgSalary = Math.max(...salaryData.map(item => item.avg))
    const maxMinSalary = Math.max(...salaryData.map(item => item.min))
    const maxMaxSalary = Math.max(...salaryData.map(item => item.max))
    
    return {
      title: {
        text: '城市招聘数据对比',
        left: 'center'
      },
      tooltip: {
        formatter: (params: any) => {
          const data = params.data.value
          return `${params.name}<br/>
                 职位数量: ${data[0]}<br/>
                 平均薪资: ${data[1].toFixed(2)}元<br/>
                 最低薪资: ${data[2].toFixed(2)}元<br/>
                 最高薪资: ${data[3].toFixed(2)}元<br/>
                 占比: ${data[4].toFixed(2)}%`
        }
      },
      legend: {
        data: cities,
        bottom: '5%'
      },
      radar: {
        indicator: [
          { name: '职位数量', max: maxCount * 1.2 },
          { name: '平均薪资(元)', max: maxAvgSalary * 1.2 },
          { name: '最低薪资(元)', max: maxMinSalary * 1.2 },
          { name: '最高薪资(元)', max: maxMaxSalary * 1.2 },
          { name: '占比(%)', max: 100 } // 百分比最大值固定为100
        ]
      },
      series: [{
        name: '城市招聘数据',
        type: 'radar',
        data: cities.map((city, index) => {
          return {
            value: [
              counts[index],
              salary_comparison[city].avg,
              salary_comparison[city].min,
              salary_comparison[city].max,
              percentages[index]
            ],
            name: city,
            // 为每个城市设置不同的颜色
            itemStyle: {
              color: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'][index % 6]
            },
            lineStyle: {
              width: 2
            },
            areaStyle: {
              opacity: 0.3
            }
          }
        })
      }]
    } as EChartsOption
  })
  
  // 城市对比柱状图选项
  const cityComparisonBarOptions = computed<EChartsOption>(() => {
    if (!cityComparison.value) return {}
    
    const { cities, counts } = cityComparison.value
    
    return {
      title: {
        text: '城市招聘职位数量对比',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
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
        name: '职位数量'
      },
      series: [{
        name: '职位数量',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: function(params: any) {
            const colorList = ['#e74c3c', '#f39c12', '#3498db', '#409EFF', '#409EFF', '#409EFF']
            return params.dataIndex < 3 ? colorList[params.dataIndex] : colorList[5]
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }]
    } as EChartsOption
  })
  
  // 城市公司规模分布图表选项
  const cityCompanySizeOptions = computed<EChartsOption>(() => {
    if (!cityComparison.value || !rawComparisonData.value) return {}
    
    const { cities } = cityComparison.value
    const actualData = rawComparisonData.value
    
    // 获取所有公司规模
    const allCompanySizes = new Set<string>()
    cities.forEach(city => {
      if (actualData.city_company_size[city]) {
        Object.keys(actualData.city_company_size[city]).forEach(size => {
          allCompanySizes.add(size)
        })
      }
    })
    
    const companySizes = Array.from(allCompanySizes)
    
    // 准备数据
    const series = cities.map(city => {
      return {
        name: city,
        type: 'bar',
        data: companySizes.map(size => {
          return actualData.city_company_size[city]?.[size] || 0
        })
      }
    })
    
    return {
      title: {
        text: '城市公司规模分布对比',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: cities,
        bottom: '5%'
      },
      xAxis: {
        type: 'category',
        data: companySizes,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '职位数量'
      },
      series
    } as EChartsOption
  })
  
  // 城市教育程度分布图表选项
  const cityEducationOptions = computed<EChartsOption>(() => {
    if (!cityComparison.value || !rawComparisonData.value) return {}
    
    const { cities } = cityComparison.value
    const actualData = rawComparisonData.value
    
    // 获取所有教育程度
    const allEducations = new Set<string>()
    cities.forEach(city => {
      if (actualData.city_education[city]) {
        Object.keys(actualData.city_education[city]).forEach(edu => {
          allEducations.add(edu)
        })
      }
    })
    
    const educations = Array.from(allEducations)
    
    // 准备数据
    const series = cities.map(city => {
      return {
        name: city,
        type: 'bar',
        data: educations.map(edu => {
          return actualData.city_education[city]?.[edu] || 0
        })
      }
    })
    
    return {
      title: {
        text: '城市教育程度分布对比',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: cities,
        bottom: '5%'
      },
      xAxis: {
        type: 'category',
        data: educations,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '职位数量'
      },
      series
    } as EChartsOption
  })
  
  // 方法
  const fetchCityData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const [distributionRes, topRes, chartRes] = await Promise.all([
        getCityDistribution(),
        getTopCities(limit.value),
        getCityChartData(limit.value)
      ])
      
      cityDistribution.value = distributionRes.data
      topCities.value = topRes.data
      cityChartData.value = chartRes.data
      
      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('获取城市数据失败')
      console.error('获取城市数据失败:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const updateLimit = (newLimit: number) => {
    limit.value = newLimit
    return fetchCityData()
  }
  
  const exportCityData = () => {
    if (!cityDistribution.value.length) return
    
    // 创建CSV内容
    let csvContent = '城市,职位数量\n'
    
    cityDistribution.value.forEach(city => {
      csvContent += `${city.工作地点},${city.count}\n`
    })
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    // 创建下载链接并触发下载
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `城市招聘分布数据_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // 获取城市薪资热力图数据
  const fetchSalaryCityHeatmap = async () => {
    isHeatmapLoading.value = true
    heatmapError.value = null
    
    try {
      const res = await getSalaryCityHeatmap(heatmapLimit.value)
      salaryCityHeatmap.value = res.data
      lastUpdated.value = new Date()
    } catch (err) {
      heatmapError.value = err instanceof Error ? err : new Error('获取城市薪资热力图数据失败')
      console.error('获取城市薪资热力图数据失败:', err)
    } finally {
      isHeatmapLoading.value = false
    }
  }
  
  // 获取城市对比数据
  const fetchCityComparison = async (cities: string[]) => {
    if (!cities.length) return
    
    isComparisonLoading.value = true
    comparisonError.value = null
    selectedCities.value = cities
    
    try {
      const res = await getCityComparison(cities)
      const actualData = res.data as unknown as ActualCityComparisonData
      
      // 转换数据格式
      const transformedData: CityComparisonData = {
        cities: Object.keys(actualData.city_salary),
        counts: [],
        percentages: [],
        ranking: [],
        comparison: {},
        salary_comparison: {}
      }
      
      // 计算所有选中城市的职位总数
      let selectedCitiesJobCount = 0
      transformedData.cities.forEach(city => {
        const cityCounts = actualData.city_job_counts[city] || 0
        selectedCitiesJobCount += cityCounts
      })
      
      // 处理每个城市的数据
      transformedData.cities.forEach(city => {
        // 获取城市职位数量
        const cityCounts = actualData.city_job_counts[city] || 0
        transformedData.counts.push(cityCounts)
        
        // 计算百分比（使用选中城市的总职位数作为分母）
        const percentage = selectedCitiesJobCount > 0 ? (cityCounts / selectedCitiesJobCount) * 100 : 0
        transformedData.percentages.push(percentage)
        
        // 薪资数据（使用后端提供的真实数据）
        transformedData.salary_comparison[city] = {
          avg: actualData.city_salary[city].avg || 0,
          min: actualData.city_salary[city].min || 0,
          max: actualData.city_salary[city].max || 0
        }
        
        // 比较数据
        transformedData.comparison[city] = cityCounts
      })
      
      // 计算排名
      const sortedCities = [...transformedData.cities].sort((a, b) => 
        (transformedData.counts[transformedData.cities.indexOf(b)] || 0) - 
        (transformedData.counts[transformedData.cities.indexOf(a)] || 0)
      )
      
      transformedData.cities.forEach(city => {
        transformedData.ranking.push(sortedCities.indexOf(city) + 1)
      })
      
      cityComparison.value = transformedData
      rawComparisonData.value = actualData
      lastUpdated.value = new Date()
    } catch (err) {
      comparisonError.value = err instanceof Error ? err : new Error('获取城市对比数据失败')
      console.error('获取城市对比数据失败:', err)
    } finally {
      isComparisonLoading.value = false
    }
  }
  
  // 更新热力图限制
  const updateHeatmapLimit = (newLimit: number) => {
    heatmapLimit.value = newLimit
    return fetchSalaryCityHeatmap()
  }
  
  return {
    // 状态
    isLoading,
    isHeatmapLoading,
    isComparisonLoading,
    error,
    heatmapError,
    comparisonError,
    lastUpdated,
    limit,
    heatmapLimit,
    selectedCities,
    
    // 数据
    cityDistribution,
    topCities,
    cityChartData,
    salaryCityHeatmap,
    cityComparison,
    rawComparisonData,
    
    // 计算属性
    totalCities,
    totalJobs,
    cityRankingOptions,
    cityDistributionOptions,
    heatmapOptions,
    cityComparisonRadarOptions,
    cityComparisonBarOptions,
    cityCompanySizeOptions,
    cityEducationOptions,
    
    // 方法
    fetchCityData,
    updateLimit,
    exportCityData,
    fetchSalaryCityHeatmap,
    fetchCityComparison,
    updateHeatmapLimit
  }
}) 