import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCompanySizeDistribution, getCompanySizeChartData, getCompanySalaryDistribution, getCompanySizeSalary, getCompanyTypeSalary, getIndustrySalary } from '../api/company'
import type { CompanySizeDistribution, CompanySizeChartData, ApiResponse, CompanySizeSalaryDistribution, CompanySizeSalaryData, CompanyTypeSalaryData, IndustrySalaryData } from '../api/types'
import type { EChartsOption } from 'echarts/types/dist/shared'
import * as echarts from 'echarts/core'

export const useCompanyStore = defineStore('company', () => {
  // 公司规模分布数据
  const companySizeDistribution = ref<CompanySizeDistribution[]>([])
  const companySizeDistributionLoading = ref(false)
  const companySizeDistributionError = ref('')

  // 公司规模图表数据
  const companySizeChartData = ref<CompanySizeChartData | null>(null)
  const companySizeChartDataLoading = ref(false)
  const companySizeChartDataError = ref('')

  // 不同规模公司的薪资水平数据
  const companySizeSalaryData = ref<CompanySizeSalaryData | null>(null)
  const companySizeSalaryDataLoading = ref(false)
  const companySizeSalaryDataError = ref('')

  // 公司规模与职位需求关系数据
  const companySizeJobData = ref<any>(null)
  const companySizeJobDataLoading = ref(false)
  const companySizeJobDataError = ref('')

  // 公司规模与薪资分布堆叠柱状图数据
  const companySizeSalaryDistribution = ref<CompanySizeSalaryDistribution | null>(null)
  const companySizeSalaryDistributionLoading = ref(false)
  const companySizeSalaryDistributionError = ref('')

  // 公司规模薪资分布箱线图数据
  const companySizeSalaryBoxplot = ref<any>(null)
  const companySizeSalaryBoxplotLoading = ref(false)
  const companySizeSalaryBoxplotError = ref('')

  // 不同公司类型的平均工资水平数据
  const companyTypeSalaryData = ref<CompanyTypeSalaryData | null>(null)
  const companyTypeSalaryDataLoading = ref(false)
  const companyTypeSalaryDataError = ref('')

  // 不同行业的平均工资水平数据
  const industrySalaryData = ref<IndustrySalaryData | null>(null)
  const industrySalaryDataLoading = ref(false)
  const industrySalaryDataError = ref('')

  // 公司规模薪资对比数据
  const selectedCompanySizes = ref<string[]>([])

  // 获取公司规模分布数据
  const fetchCompanySizeDistribution = async () => {
    companySizeDistributionLoading.value = true
    companySizeDistributionError.value = ''
    try {
      const res = await getCompanySizeDistribution()
      if (res.code === 200) {
        companySizeDistribution.value = res.data
      } else {
        companySizeDistributionError.value = res.message || '获取公司规模分布数据失败'
      }
    } catch (error: any) {
      companySizeDistributionError.value = error.message || '获取公司规模分布数据失败'
    } finally {
      companySizeDistributionLoading.value = false
    }
  }

  // 获取公司规模图表数据
  const fetchCompanySizeChartData = async () => {
    companySizeChartDataLoading.value = true
    companySizeChartDataError.value = ''
    try {
      const res = await getCompanySizeChartData()
      if (res.code === 200) {
        companySizeChartData.value = res.data
      } else {
        companySizeChartDataError.value = res.message || '获取公司规模图表数据失败'
      }
    } catch (error: any) {
      companySizeChartDataError.value = error.message || '获取公司规模图表数据失败'
    } finally {
      companySizeChartDataLoading.value = false
    }
  }

  // 获取不同规模公司的薪资水平数据
  const fetchCompanySizeSalaryData = async () => {
    companySizeSalaryDataLoading.value = true
    companySizeSalaryDataError.value = ''
    try {
      const res = await getCompanySizeSalary()
      if (res.code === 200) {
        companySizeSalaryData.value = res.data
      } else {
        companySizeSalaryDataError.value = res.message || '获取不同规模公司的薪资水平数据失败'
      }
    } catch (error: any) {
      companySizeSalaryDataError.value = error.message || '获取不同规模公司的薪资水平数据失败'
    } finally {
      companySizeSalaryDataLoading.value = false
    }
  }

  // 获取不同公司类型的平均工资水平数据
  const fetchCompanyTypeSalaryData = async () => {
    companyTypeSalaryDataLoading.value = true
    companyTypeSalaryDataError.value = ''
    try {
      const res = await getCompanyTypeSalary()
      if (res.code === 200) {
        companyTypeSalaryData.value = res.data
      } else {
        companyTypeSalaryDataError.value = res.message || '获取不同公司类型的平均工资水平数据失败'
      }
    } catch (error: any) {
      companyTypeSalaryDataError.value = error.message || '获取不同公司类型的平均工资水平数据失败'
    } finally {
      companyTypeSalaryDataLoading.value = false
    }
  }

  // 获取不同行业的平均工资水平数据
  const fetchIndustrySalaryData = async () => {
    industrySalaryDataLoading.value = true
    industrySalaryDataError.value = ''
    try {
      const res = await getIndustrySalary()
      if (res.code === 200) {
        industrySalaryData.value = res.data
      } else {
        industrySalaryDataError.value = res.message || '获取不同行业的平均工资水平数据失败'
      }
    } catch (error: any) {
      industrySalaryDataError.value = error.message || '获取不同行业的平均工资水平数据失败'
    } finally {
      industrySalaryDataLoading.value = false
    }
  }

  // 模拟获取公司规模与职位需求关系数据(废弃)
  const fetchCompanySizeJobData = async () => {
    companySizeJobDataLoading.value = true
    companySizeJobDataError.value = ''
    try {
  
      await new Promise(resolve => setTimeout(resolve, 500))
      
 
      companySizeJobData.value = {
        company_sizes: ['少于50人', '50-150人', '150-500人', '500-1000人', '1000-5000人', '5000人以上'],
        job_categories: ['开发', '测试', '运维', '产品', '设计', '市场'],
        data: [
          [120, 80, 40, 50, 30, 20],
          [150, 100, 60, 70, 50, 30],
          [180, 120, 80, 90, 70, 50],
          [200, 150, 100, 110, 90, 70],
          [220, 170, 120, 130, 110, 90],
          [240, 190, 140, 150, 130, 110]
        ]
      }
    } catch (error: any) {
      companySizeJobDataError.value = error.message || '获取公司规模与职位需求关系数据失败'
    } finally {
      companySizeJobDataLoading.value = false
    }
  }

  // 获取公司规模与薪资分布堆叠柱状图数据
  const fetchCompanySizeSalaryDistribution = async (params?: {
    timeRange?: string;
    region?: string;
    jobCategory?: string;
  }) => {
    companySizeSalaryDistributionLoading.value = true
    companySizeSalaryDistributionError.value = ''
    try {
      const res = await getCompanySalaryDistribution(params)
      if (res.code === 200) {
        companySizeSalaryDistribution.value = res.data
      } else {
        companySizeSalaryDistributionError.value = res.message || '获取公司规模与薪资分布数据失败'
      }
    } catch (error: any) {
      companySizeSalaryDistributionError.value = error.message || '获取公司规模与薪资分布数据失败'
    } finally {
      companySizeSalaryDistributionLoading.value = false
    }
  }

  // 模拟获取公司规模薪资分布箱线图数据（废弃）
  const fetchCompanySizeSalaryBoxplot = async () => {
    companySizeSalaryBoxplotLoading.value = true
    companySizeSalaryBoxplotError.value = ''
    try {

      await new Promise(resolve => setTimeout(resolve, 500))
      
      //  每个公司规模对应一组箱线图数据 [最小值, 下四分位数, 中位数, 上四分位数, 最大值]
      companySizeSalaryBoxplot.value = {
        company_sizes: ['少于50人', '50-150人', '150-500人', '500-1000人', '1000-5000人', '5000人以上'],
        boxplot_data: [
          [5000, 7000, 9000, 11000, 15000],  // 少于50人
          [6000, 8500, 11000, 14000, 18000],  // 50-150人
          [7000, 10000, 13000, 16000, 22000],  // 150-500人
          [8000, 12000, 15000, 19000, 25000],  // 500-1000人
          [10000, 14000, 18000, 22000, 28000],  // 1000-5000人
          [12000, 16000, 20000, 25000, 35000]   // 5000人以上
        ],
        outliers: [
          [[0, 16000], [0, 17000]],  // 少于50人的异常值
          [[1, 20000], [1, 22000]],  // 50-150人的异常值
          [[2, 24000], [2, 26000]],  // 150-500人的异常值
          [[3, 28000], [3, 30000]],  // 500-1000人的异常值
          [[4, 32000], [4, 35000]],  // 1000-5000人的异常值
          [[5, 40000], [5, 45000]]   // 5000人以上的异常值
        ]
      }
    } catch (error: any) {
      companySizeSalaryBoxplotError.value = error.message || '获取公司规模薪资分布箱线图数据失败'
    } finally {
      companySizeSalaryBoxplotLoading.value = false
    }
  }

  // 更新选中的公司规模
  const updateSelectedCompanySizes = (sizes: string[]) => {
    selectedCompanySizes.value = sizes
  }

  // 公司规模与薪资分布堆叠柱状图配置
  const companySizeSalaryDistributionOptions = computed<EChartsOption>(() => {
    if (!companySizeSalaryDistribution.value) return {}

    const { company_sizes, salary_ranges, data } = companySizeSalaryDistribution.value

    // 构建系列数据
    const series = salary_ranges.map((range: string, rangeIndex: number) => ({
      name: range,
      type: 'bar' as const,
      stack: 'total',
      emphasis: {
        focus: 'series'
      },
      label: {
        show: true,
        position: 'inside',
        formatter: (params: any) => {
          return params.value > 0 ? params.value : ''
        }
      },
      data: company_sizes.map((_: string, sizeIndex: number) => data[sizeIndex][rangeIndex])
    }))

    return {
      title: {
        text: '公司规模与薪资分布堆叠柱状图',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          let result = `${params[0].axisValue}<br/>`
          let total = 0
          params.forEach((item: any) => {
            total += item.value
            result += `${item.marker} ${item.seriesName}: ${item.value} 个职位<br/>`
          })
          result += `<b>总计: ${total} 个职位</b>`
          return result
        }
      },
      legend: {
        data: salary_ranges,
        top: '10%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: company_sizes
      },
      yAxis: {
        type: 'value',
        name: '职位数量'
      },
      series
    } as EChartsOption
  })

  // 公司规模薪资分布箱线图配置
  const companySizeSalaryBoxplotOptions = computed<EChartsOption>(() => {
    if (!companySizeSalaryBoxplot.value) return {}

    const { company_sizes, boxplot_data, outliers } = companySizeSalaryBoxplot.value

    return {
      title: {
        text: '公司规模薪资分布箱线图',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          if (params.seriesType === 'boxplot') {
            const data = params.data
            return `${params.name}<br/>
              <b>最大值:</b> ${data[5]}元<br/>
              <b>上四分位数:</b> ${data[4]}元<br/>
              <b>中位数:</b> ${data[3]}元<br/>
              <b>下四分位数:</b> ${data[2]}元<br/>
              <b>最小值:</b> ${data[1]}元`
          } else {
            return `${params.name}: 异常值 ${params.data[1]}元`
          }
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '25%'
      },
      xAxis: {
        type: 'category',
        data: company_sizes,
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
      series: [
        {
          name: '薪资分布',
          type: 'boxplot',
          data: boxplot_data,
          itemStyle: {
            color: '#5470c6',
            borderColor: '#5470c6'
          },
          emphasis: {
            itemStyle: {
              borderWidth: 2,
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowColor: 'rgba(0,0,0,0.3)'
            }
          }
        },
        {
          name: '异常值',
          type: 'scatter',
          data: outliers.flat(),
          symbolSize: 6,
          itemStyle: {
            color: '#ee6666'
          }
        }
      ]
    } as EChartsOption
  })

  // 不同公司类型的平均工资水平图表配置
  const companyTypeSalaryChartOptions = computed<EChartsOption>(() => {
    if (!companyTypeSalaryData.value) return {}

    const { company_types, avg_salaries } = companyTypeSalaryData.value

    return {
      title: {
        text: '不同公司类型的平均工资水平',
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
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: company_types,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '平均薪资 (元)'
      },
      series: [
        {
          name: '平均薪资',
          type: 'bar',
          data: avg_salaries,
          itemStyle: {
            color: function(params: any) {
              // 使用不同的颜色区分不同公司类型
              const colorList = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
                '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
              ]
              return colorList[params.dataIndex % colorList.length]
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              if (typeof params.value === 'number') {
                return (params.value / 1000).toFixed(1) + 'K'
              }
              return params.value
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    } as EChartsOption
  })

  // 不同行业的平均工资水平图表配置
  const industrySalaryChartOptions = computed<EChartsOption>(() => {
    if (!industrySalaryData.value) return {}

    const { industries, avg_salaries } = industrySalaryData.value

    // 按照薪资从高到低排序
    const sortedData = industries.map((industry, index) => ({
      industry,
      salary: avg_salaries[index]
    })).sort((a, b) => b.salary - a.salary)

    const sortedIndustries = sortedData.map(item => item.industry)
    const sortedSalaries = sortedData.map(item => item.salary)

    return {
      title: {
        text: '不同行业的平均工资水平',
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
        right: '4%',
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
              // 使用渐变色区分不同行业
              const colorList = [
                '#83bff6', '#188df0', '#188df0', '#188df0', '#188df0',
                '#188df0', '#188df0', '#188df0', '#188df0', '#188df0'
              ]
              return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
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
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    } as EChartsOption
  })

  return {
    // 状态
    companySizeDistribution,
    companySizeDistributionLoading,
    companySizeDistributionError,
    companySizeChartData,
    companySizeChartDataLoading,
    companySizeChartDataError,
    companySizeSalaryData,
    companySizeSalaryDataLoading,
    companySizeSalaryDataError,
    companySizeJobData,
    companySizeJobDataLoading,
    companySizeJobDataError,
    companySizeSalaryDistribution,
    companySizeSalaryDistributionLoading,
    companySizeSalaryDistributionError,
    companySizeSalaryBoxplot,
    companySizeSalaryBoxplotLoading,
    companySizeSalaryBoxplotError,
    selectedCompanySizes,
    companyTypeSalaryData,
    companyTypeSalaryDataLoading,
    companyTypeSalaryDataError,
    industrySalaryData,
    industrySalaryDataLoading,
    industrySalaryDataError,
    
    // 计算属性
    companySizeSalaryDistributionOptions,
    companySizeSalaryBoxplotOptions,
    companyTypeSalaryChartOptions,
    industrySalaryChartOptions,
    
    // 方法
    fetchCompanySizeDistribution,
    fetchCompanySizeChartData,
    fetchCompanySizeSalaryData,
    fetchCompanySizeJobData,
    fetchCompanySizeSalaryDistribution,
    fetchCompanySizeSalaryBoxplot,
    fetchCompanyTypeSalaryData,
    fetchIndustrySalaryData,
    updateSelectedCompanySizes
  }
}) 