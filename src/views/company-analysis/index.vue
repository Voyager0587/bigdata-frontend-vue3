<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import LoadingState from '../../components/LoadingState.vue'
import ErrorMessage from '../../components/ErrorMessage.vue'
import FilterPanel from '../../components/FilterPanel.vue'
import { useCompanyStore } from '../../stores/company'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

const pageTitle = ref('招聘数据可视化平台 - 公司分析')
const companyStore = useCompanyStore()

// 筛选条件
const filters = ref([
  {
    type: 'select' as const,
    field: 'companySize',
    label: '公司规模',
    options: [
      { label: '全部', value: 'all' },
      { label: '少于50人', value: '少于50人' },
      { label: '50-150人', value: '50-150人' },
      { label: '150-500人', value: '150-500人' },
      { label: '500-1000人', value: '500-1000人' },
      { label: '1000-5000人', value: '1000-5000人' },
      { label: '5000人以上', value: '5000人以上' }
    ],
    defaultValue: 'all',
    clearable: true
  },
  {
    type: 'select' as const,
    field: 'timeRange',
    label: '时间范围',
    options: [
      { label: '全部', value: 'all' },
      { label: '最近一个月', value: 'last_month' },
      { label: '最近三个月', value: 'last_quarter' },
      { label: '最近半年', value: 'last_half_year' },
      { label: '最近一年', value: 'last_year' }
    ],
    defaultValue: 'all',
    clearable: true
  },
  {
    type: 'select' as const,
    field: 'region',
    label: '地区',
    options: [
      { label: '全部', value: 'all' },
      { label: '北京', value: '北京' },
      { label: '上海', value: '上海' },
      { label: '广州', value: '广州' },
      { label: '深圳', value: '深圳' },
      { label: '杭州', value: '杭州' }
    ],
    defaultValue: 'all',
    clearable: true
  },
  {
    type: 'select' as const,
    field: 'jobCategory',
    label: '职位类别',
    options: [
      { label: '全部', value: 'all' },
      { label: '开发', value: '开发' },
      { label: '测试', value: '测试' },
      { label: '运维', value: '运维' },
      { label: '产品', value: '产品' },
      { label: '设计', value: '设计' }
    ],
    defaultValue: 'all',
    clearable: true
  }
])

const filterParams = reactive({
  companySize: 'all',
  timeRange: 'all',
  region: 'all',
  jobCategory: 'all'
})

// 处理筛选
const handleFilter = (params: any) => {
  Object.assign(filterParams, params)
  // 根据筛选条件重新加载数据
  loadData()
}

// 重置筛选
const handleReset = () => {
  // 重置筛选条件后重新加载数据
  loadData()
}

// 公司规模分布图表配置
const companySizeChartOptions = computed<any>(() => {
  if (!companyStore.companySizeChartData) {
    return {}
  }

  const { sizes, counts, percentages } = companyStore.companySizeChartData

  return {
    title: {
      text: '公司规模分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '公司规模',
        type: 'pie',
        radius: ['30%', '60%'],  // 缩小饼图
        center: ['55%', '50%'],  // 向左调整中心点
        avoidLabelOverlap: true, // 避免标签重叠
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside', // 标签放在外部
          formatter: '{b}: {c}\n({d}%)', // 换行显示百分比
          alignTo: 'edge',
          edgeDistance: '10%',
          lineHeight: 15,
          rich: {
            b: {
              fontSize: 12,
              lineHeight: 20
            },
            per: {
              fontSize: 12,
              color: '#666'
            }
          }
        },
        labelLine: {
          length: 15,
          length2: 10,
          smooth: true
        },
        emphasis: {
          label: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: sizes.map((item: string, index: number) => ({
          value: counts[index],
          name: item,
          percentage: percentages[index]
        }))
      }
    ]
  }
})

// 不同规模公司的薪资水平图表配置
const companySizeSalaryChartOptions = computed<any>(() => {
  if (!companyStore.companySizeSalaryData) {
    return {}
  }

  const { company_sizes, avg_salaries, min_salaries, max_salaries } = companyStore.companySizeSalaryData
  
  // 计算Y轴最大值，确保有足够空间显示数据标签
  const allSalaries = [...avg_salaries, ...min_salaries, ...max_salaries];
  const maxSalary = Math.max(...allSalaries.filter(val => typeof val === 'number' && !isNaN(val)));
  const yAxisMax = Math.ceil(maxSalary * 1.2); // 增加20%的空间

  return {
    title: {
      text: '不同规模公司的薪资水平',
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
      data: company_sizes,
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

// 公司规模与职位需求关系图表配置
const companySizeJobChartOptions = computed<any>(() => {
  if (!companyStore.companySizeJobData) {
    return {}
  }

  const { company_sizes, job_categories, data } = companyStore.companySizeJobData

  const series = company_sizes.map((size: string, index: number) => ({
    name: size,
    type: 'bar',
    stack: 'total',
    emphasis: {
      focus: 'series'
    },
    data: job_categories.map((_: string, jobIndex: number) => data[index][jobIndex])
  }))

  return {
    title: {
      text: '公司规模与职位需求关系',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: company_sizes,
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
      data: job_categories
    },
    yAxis: {
      type: 'value',
      name: '职位数量'
    },
    series
  }
})

// 公司规模薪资对比选择器
const selectedCompanySizes = ref<string[]>([])
const companySizeOptions = computed(() => {
  if (!companyStore.companySizeSalaryData) return []
  return companyStore.companySizeSalaryData.company_sizes.map((size: string) => ({
    label: size,
    value: size
  }))
})

// 监听选择变化
watch(selectedCompanySizes, (newSizes) => {
  companyStore.updateSelectedCompanySizes(newSizes)
})

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      companyStore.fetchCompanySizeChartData(),
      companyStore.fetchCompanySizeSalaryData(),
      companyStore.fetchCompanySizeJobData(),
      companyStore.fetchCompanySizeSalaryDistribution({
        timeRange: filterParams.timeRange !== 'all' ? filterParams.timeRange : undefined,
        region: filterParams.region !== 'all' ? filterParams.region : undefined,
        jobCategory: filterParams.jobCategory !== 'all' ? filterParams.jobCategory : undefined
      }),
      companyStore.fetchCompanyTypeSalaryData()
    ])
  } catch (error) {
    console.error('加载公司分析数据失败', error)
  }
}

// 导出数据为Excel
const exportToExcel = (type: 'distribution' | 'salary' | 'job' | 'salaryDistribution' | 'typeSalary') => {
  try {
    let data: any[] = []
    let fileName = ''

    if (type === 'distribution' && companyStore.companySizeChartData) {
      const { sizes, counts, percentages } = companyStore.companySizeChartData
      data = sizes.map((size: string, index: number) => ({
        '公司规模': size,
        '职位数量': counts[index],
        '占比': `${percentages[index].toFixed(2)}%`
      }))
      fileName = '公司规模分布数据'
    } else if (type === 'salary' && companyStore.companySizeSalaryData) {
      const { company_sizes, avg_salaries, min_salaries, max_salaries } = companyStore.companySizeSalaryData
      data = company_sizes.map((size: string, index: number) => ({
        '公司规模': size,
        '平均薪资': avg_salaries[index],
        '最低薪资': min_salaries[index],
        '最高薪资': max_salaries[index]
      }))
      fileName = '不同规模公司薪资水平数据'
    } else if (type === 'job' && companyStore.companySizeJobData) {
      const { company_sizes, job_categories, data: jobData } = companyStore.companySizeJobData
      data = company_sizes.map((size: string, sizeIndex: number) => {
        const row: any = { '公司规模': size }
        job_categories.forEach((category: string, catIndex: number) => {
          row[category] = jobData[sizeIndex][catIndex]
        })
        return row
      })
      fileName = '公司规模与职位需求关系数据'
    } else if (type === 'salaryDistribution' && companyStore.companySizeSalaryDistribution) {
      const { company_sizes, salary_ranges, data: distData } = companyStore.companySizeSalaryDistribution
      data = company_sizes.map((size: string, sizeIndex: number) => {
        const row: any = { '公司规模': size }
        salary_ranges.forEach((range: string, rangeIndex: number) => {
          row[range] = distData[sizeIndex][rangeIndex]
        })
        return row
      })
      fileName = '公司规模与薪资分布数据'
    } else if (type === 'typeSalary' && companyStore.companyTypeSalaryData) {
      const { company_types, avg_salaries } = companyStore.companyTypeSalaryData
      data = company_types.map((type: string, index: number) => ({
        '公司类型': type,
        '平均薪资': avg_salaries[index]
      }))
      fileName = '不同公司类型平均工资水平数据'
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

// 页面加载时获取数据
onMounted(() => {
  document.title = pageTitle.value
  loadData()
})
</script>

<template>
  <div class="company-analysis-container p-4">
    <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>
    
    <!-- 筛选面板 -->
    <!-- <FilterPanel
      :filters="filters"
      :loading="companyStore.companySizeChartDataLoading"
      :show-reset="true"
      @filter="handleFilter"
      @reset="handleReset"
    /> -->
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 公司规模分布饼图 -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex justify-between items-center">
            <span>公司规模分布</span>
            <el-button type="primary" size="small" @click="exportToExcel('distribution')" :disabled="!companyStore.companySizeChartData">
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
          </div>
        </template>
        <div class="h-96">
          <LoadingState v-if="companyStore.companySizeChartDataLoading" :loading="true" />
          <ErrorMessage v-else-if="companyStore.companySizeChartDataError" :error="companyStore.companySizeChartDataError" />
          <BaseChart v-else-if="companyStore.companySizeChartData" :options="companySizeChartOptions" height="100%" auto-resize />
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            暂无公司规模分布数据
          </div>
        </div>
      </el-card>
      
      <!-- 公司规模数据详情 -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex justify-between items-center">
            <span>公司规模数据详情</span>
          </div>
        </template>
        <div class="overflow-auto" style="max-height: 384px;">
          <LoadingState v-if="companyStore.companySizeChartDataLoading" :loading="true" />
          <ErrorMessage v-else-if="companyStore.companySizeChartDataError" :error="companyStore.companySizeChartDataError" />
          <el-table 
            v-else-if="companyStore.companySizeChartData" 
            :data="companyStore.companySizeChartData.sizes.map((size, index) => ({
              size,
              count: companyStore.companySizeChartData?.counts[index],
              percentage: companyStore.companySizeChartData?.percentages[index]
            }))" 
            style="width: 100%" 
            empty-text="暂无数据"
          >
            <el-table-column prop="size" label="公司规模" />
            <el-table-column prop="count" label="职位数量" />
            <el-table-column prop="percentage" label="占比">
              <template #default="scope">
                {{ scope.row.percentage.toFixed(2) }}%
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="flex items-center justify-center h-20 text-gray-400">
            暂无公司规模数据
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 不同规模公司的薪资水平 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>不同规模公司的薪资水平</span>
          <el-button type="primary" size="small" @click="exportToExcel('salary')" :disabled="!companyStore.companySizeSalaryData">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="companyStore.companySizeSalaryDataLoading" :loading="true" />
        <ErrorMessage v-else-if="companyStore.companySizeSalaryDataError" :error="companyStore.companySizeSalaryDataError" />
        <BaseChart v-else-if="companyStore.companySizeSalaryData" :options="companySizeSalaryChartOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无不同规模公司的薪资水平数据
        </div>
      </div>
    </el-card>
    
    <!-- 公司规模与职位需求关系 -->
    <!-- <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>公司规模与职位需求关系</span>
          <el-button type="primary" size="small" @click="exportToExcel('job')" :disabled="!companyStore.companySizeJobData">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="companyStore.companySizeJobDataLoading" :loading="true" />
        <ErrorMessage v-else-if="companyStore.companySizeJobDataError" :error="companyStore.companySizeJobDataError" />
        <BaseChart v-else-if="companyStore.companySizeJobData" :options="companySizeJobChartOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无公司规模与职位需求关系数据
        </div>
      </div>
    </el-card> -->
    
    <!-- 公司规模薪资分析 -->
    <h2 class="text-xl font-bold mt-8 mb-4">公司规模薪资详细分析</h2>
    
    <!-- 公司规模与薪资分布堆叠柱状图 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>公司规模与薪资分布堆叠柱状图</span>
          <el-button type="primary" size="small" @click="exportToExcel('salaryDistribution')" :disabled="!companyStore.companySizeSalaryDistribution">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="companyStore.companySizeSalaryDistributionLoading" :loading="true" />
        <ErrorMessage v-else-if="companyStore.companySizeSalaryDistributionError" :error="companyStore.companySizeSalaryDistributionError" />
        <BaseChart v-else-if="companyStore.companySizeSalaryDistribution" :options="companyStore.companySizeSalaryDistributionOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无公司规模与薪资分布数据
        </div>
      </div>
    </el-card>
    
    <!-- 不同公司类型的平均工资水平 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>不同公司类型的平均工资水平</span>
          <el-button type="primary" size="small" @click="exportToExcel('typeSalary')" :disabled="!companyStore.companyTypeSalaryData">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
      </template>
      <div class="h-96">
        <LoadingState v-if="companyStore.companyTypeSalaryDataLoading" :loading="true" />
        <ErrorMessage v-else-if="companyStore.companyTypeSalaryDataError" :error="companyStore.companyTypeSalaryDataError" />
        <BaseChart v-else-if="companyStore.companyTypeSalaryData" :options="companyStore.companyTypeSalaryChartOptions" height="100%" auto-resize />
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          暂无不同公司类型的平均工资水平数据
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.company-analysis-container {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .company-analysis-container {
    padding: 10px;
  }
}
</style> 