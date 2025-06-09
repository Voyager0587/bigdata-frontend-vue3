<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import BaseChart from '../../components/charts/BaseChart.vue'
import HeatmapChart from '../../components/charts/HeatmapChart.vue'
import LoadingState from '../../components/LoadingState.vue'
import ErrorMessage from '../../components/ErrorMessage.vue'
import FilterPanel from '../../components/FilterPanel.vue'
import { useEducationStore } from '../../stores/education'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { Download, Refresh } from '@element-plus/icons-vue'

const pageTitle = ref('招聘数据可视化平台 - 学历分析')
const educationStore = useEducationStore()
const activeTab = ref('basic') // 'basic' 或 'advanced'
const cityLimitValue = ref(5)

// 筛选条件
const filters = ref([])

const filterParams = reactive({})

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

// 学历分布图表配置
const educationChartOptions = computed<any>(() => {
  if (!educationStore.educationChartData) {
    return {}
  }

  const { education_levels, counts, percentages } = educationStore.educationChartData

  return {
    title: {
      text: '学历分布',
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
        data: education_levels.map((item: string, index: number) => ({
          value: counts[index],
          name: item,
          percentage: percentages[index]
        }))
      }
    ]
  }
})

// 不同学历薪资对比图表配置
const educationSalaryChartOptions = computed<any>(() => {
  if (!educationStore.educationSalaryData) {
    return {}
  }

  const { education_levels, avg_salaries, min_salaries, max_salaries } = educationStore.educationSalaryData
  
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

// 城市与学历交叉分析筛选器配置
const cityEducationFilters = ref([
  {
    type: 'select' as const,
    field: 'cityLimit',
    label: '城市数量',
    options: [
      { label: 'Top 5', value: 5 },
      { label: 'Top 10', value: 10 },
      { label: 'Top 15', value: 15 }
    ],
    defaultValue: 5
  }
])

// 处理城市与学历交叉分析筛选器变化
const handleCityEducationFilter = (params: any) => {
  if (params.cityLimit !== cityLimitValue.value) {
    cityLimitValue.value = params.cityLimit
    educationStore.fetchCityEducationAnalysis(params.cityLimit)
  }
}

// 处理选项卡切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  
  // 如果切换到高级分析选项卡，加载城市与学历交叉分析数据
  if (tab === 'advanced' && !educationStore.cityEducationData) {
    educationStore.fetchCityEducationAnalysis(cityLimitValue.value)
  }
}

// 刷新城市与学历交叉分析数据
const refreshCityEducationData = () => {
  return educationStore.fetchCityEducationAnalysis(cityLimitValue.value)
}

// 导出城市与学历交叉分析数据
const exportCityEducationData = () => {
  try {
    if (!educationStore.cityEducationData) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    const { cities, education_levels, distribution } = educationStore.cityEducationData
    const data: any[] = []
    
    // 添加表头
    const header = ['城市', ...education_levels]
    
    // 添加数据行
    cities.forEach((city, cityIndex) => {
      const row: any = { '城市': city }
      education_levels.forEach((edu, eduIndex) => {
        row[edu] = distribution[cityIndex][eduIndex] + '%'
      })
      data.push(row)
    })
    
    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      
      // 生成Excel文件并下载
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, `城市学历需求分析-${new Date().toISOString().split('T')[0]}.xlsx`)
      
      ElMessage.success('数据导出成功')
    } else {
      ElMessage.warning('没有可导出的数据')
    }
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      educationStore.fetchEducationChartData(),
      educationStore.fetchEducationSalaryData()
    ])
  } catch (error) {
    console.error('加载学历分析数据失败', error)
  }
}

// 导出数据为Excel
const exportToExcel = (type: 'distribution' | 'salary') => {
  try {
    let data: any[] = []
    let fileName = ''

    if (type === 'distribution' && educationStore.educationChartData) {
      const { education_levels, counts, percentages } = educationStore.educationChartData
      data = education_levels.map((edu: string, index: number) => ({
        '学历': edu,
        '职位数量': counts[index],
        '占比': `${percentages[index].toFixed(2)}%`
      }))
      fileName = '学历分布数据'
    } else if (type === 'salary' && educationStore.educationSalaryData) {
      const { education_levels, avg_salaries, min_salaries, max_salaries } = educationStore.educationSalaryData
      data = education_levels.map((edu: string, index: number) => ({
        '学历': edu,
        '平均薪资': avg_salaries[index],
        '最低薪资': min_salaries[index],
        '最高薪资': max_salaries[index]
      }))
      fileName = '不同学历薪资对比数据'
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
  <div class="education-analysis-container p-4">
    <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>
    
    <!-- 选项卡 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="mb-4">
      <el-tab-pane label="基础分析" name="basic"></el-tab-pane>
      <el-tab-pane label="城市交叉分析" name="advanced"></el-tab-pane>
    </el-tabs>
    
    <!-- 基础分析视图 -->
    <div v-show="activeTab === 'basic'">
      <!-- 筛选面板 -->
      <!-- <FilterPanel
        :filters="filters"
        :loading="educationStore.educationChartDataLoading"
        :show-reset="true"
        @filter="handleFilter"
        @reset="handleReset"
      /> -->
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 学历分布饼图 -->
        <el-card shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span>学历分布</span>
              <el-button type="primary" size="small" @click="exportToExcel('distribution')" :disabled="!educationStore.educationChartData">
                <el-icon><Download /></el-icon> 导出数据
              </el-button>
            </div>
          </template>
          <div class="h-96">
            <LoadingState v-if="educationStore.educationChartDataLoading" :loading="true" />
            <ErrorMessage v-else-if="educationStore.educationChartDataError" :error="educationStore.educationChartDataError" />
            <BaseChart v-else-if="educationStore.educationChartData" :options="educationChartOptions" height="100%" auto-resize />
            <div v-else class="flex items-center justify-center h-full text-gray-400">
              暂无学历分布数据
            </div>
          </div>
        </el-card>
        
        <!-- 学历数据详情 -->
        <el-card shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span>学历数据详情</span>
            </div>
          </template>
          <div class="overflow-auto" style="max-height: 384px;">
            <LoadingState v-if="educationStore.educationChartDataLoading" :loading="true" />
            <ErrorMessage v-else-if="educationStore.educationChartDataError" :error="educationStore.educationChartDataError" />
            <el-table 
              v-else-if="educationStore.educationChartData" 
              :data="educationStore.educationChartData.education_levels.map((edu, index) => ({
                education: edu,
                count: educationStore.educationChartData?.counts[index],
                percentage: educationStore.educationChartData?.percentages[index]
              }))" 
              style="width: 100%" 
              empty-text="暂无数据"
            >
              <el-table-column prop="education" label="学历" />
              <el-table-column prop="count" label="职位数量" />
              <el-table-column prop="percentage" label="占比">
                <template #default="scope">
                  {{ scope.row.percentage.toFixed(2) }}%
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="flex items-center justify-center h-20 text-gray-400">
              暂无学历数据
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 不同学历薪资对比 -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex justify-between items-center">
            <span>不同学历薪资对比</span>
            <el-button type="primary" size="small" @click="exportToExcel('salary')" :disabled="!educationStore.educationSalaryData">
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
          </div>
        </template>
        <div class="h-96">
          <LoadingState v-if="educationStore.educationSalaryDataLoading" :loading="true" />
          <ErrorMessage v-else-if="educationStore.educationSalaryDataError" :error="educationStore.educationSalaryDataError" />
          <BaseChart v-else-if="educationStore.educationSalaryData" :options="educationSalaryChartOptions" height="100%" auto-resize />
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            暂无不同学历薪资对比数据
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 城市交叉分析视图 -->
    <div v-show="activeTab === 'advanced'">
      <!-- 城市与学历交叉分析筛选器 -->
      <div class="flex justify-between items-center mb-4">
        <FilterPanel
          :filters="cityEducationFilters"
          :loading="educationStore.cityEducationLoading"
          :show-reset="false"
          @filter="handleCityEducationFilter"
          class="flex-1"
        />
        <div class="flex items-center ml-4">
          <el-button 
            :icon="Refresh" 
            circle 
            @click="refreshCityEducationData" 
            :loading="educationStore.cityEducationLoading"
            type="primary"
            class="mr-2"
          />
          <el-button 
            :icon="Download" 
            circle 
            @click="exportCityEducationData" 
            :disabled="educationStore.cityEducationLoading || !educationStore.cityEducationData"
            type="success"
          />
        </div>
      </div>
      
      <ErrorMessage 
        :error="educationStore.cityEducationError" 
        title="获取城市与学历交叉分析数据失败" 
        show-retry 
        @retry="refreshCityEducationData" 
      />
      
      <!-- 城市与学历交叉分析图表 -->
      <el-card shadow="hover" class="mb-6">
        <template #header>
          <div class="flex justify-between items-center">
            <span>城市与学历需求交叉分析</span>
            <span class="text-sm text-gray-500">显示前 {{ cityLimitValue }} 个城市</span>
          </div>
        </template>
        <LoadingState :loading="educationStore.cityEducationLoading" skeleton>
          <div class="text-xs text-gray-500 mb-2">
            提示：堆叠柱状图展示了各个城市对不同学历的需求占比
          </div>
          <BaseChart :options="educationStore.cityEducationStackedBarOptions" height="500px" auto-resize />
        </LoadingState>
      </el-card>
      
      <!-- 学历需求城市分布热力图 -->
      <el-card shadow="hover" class="mb-6">
        <template #header>
          <div class="flex justify-between items-center">
            <span>学历需求城市分布热力图</span>
          </div>
        </template>
        <LoadingState :loading="educationStore.cityEducationLoading" skeleton>
          <div class="text-xs text-gray-500 mb-2">
            提示：热力图展示了不同城市对各学历层次的需求占比，颜色越深表示需求占比越高
          </div>
          <BaseChart :options="educationStore.cityEducationHeatmapOptions" height="500px" auto-resize />
        </LoadingState>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.education-analysis-container {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .education-analysis-container {
    padding: 10px;
  }
}
</style> 