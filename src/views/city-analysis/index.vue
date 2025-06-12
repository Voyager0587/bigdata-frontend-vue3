<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useCityStore } from '../../stores'
import BaseChart from '../../components/charts/BaseChart.vue'
import HeatmapChart from '../../components/charts/HeatmapChart.vue'
import LoadingState from '../../components/LoadingState.vue'
import ErrorMessage from '../../components/ErrorMessage.vue'
import FilterPanel from '../../components/FilterPanel.vue'
import CityComparisonConfig from '../../components/CityComparisonConfig.vue'
import { Download, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import type { EChartsOption } from 'echarts/types/dist/shared'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus'

const cityStore = useCityStore()
const limitValue = ref(10)
const activeTab = ref('distribution')
const selectedCities = ref<string[]>([])

// 格式化最后更新时间
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化最后更新时间
const formattedLastUpdated = computed(() => {
  if (!cityStore.lastUpdated) return '未更新'
  return formatDate(cityStore.lastUpdated)
})

// 城市表格数据
const cityTableData = computed(() => {
  if (!cityStore.cityDistribution.length) return []
  
  const total = cityStore.totalJobs
  
  return cityStore.cityDistribution.map(city => ({
    city: city.工作地点,
    count: city.count,
    percentage: ((city.count / total) * 100).toFixed(2) + '%'
  }))
})

// 筛选器配置
const filterItems = [
  {
    type: 'select' as const,
    field: 'limit',
    label: '显示数量',
    options: [
      { label: 'Top 5', value: 5 },
      { label: 'Top 10', value: 10 },
      { label: 'Top 20', value: 20 },
      { label: 'Top 50', value: 50 }
    ],
    defaultValue: 10
  }
]

// 城市分布图表配置
const cityDistributionOptions = computed<EChartsOption>(() => {
  if (!cityStore.cityDistribution.length) return {}
  
  // 获取前N个城市数据
  const topCities = cityStore.cityDistribution.slice(0, limitValue.value)
  
  return {
    title: {
      text: '城市招聘分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 个职位 ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
      data: topCities.map(city => city.工作地点)
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
        data: topCities.map(city => ({
          value: city.count,
          name: city.工作地点
        }))
      }
    ]
  } as EChartsOption
})

// 处理筛选器变化
const handleFilter = (params: Record<string, any>) => {
  if (params.limit !== limitValue.value) {
    limitValue.value = params.limit
  }
}

// 刷新数据
const refreshData = () => {
  return cityStore.updateLimit(limitValue.value)
}

// 导出数据
const exportData = () => {
  try {
    if (!cityStore.cityDistribution.length) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    // 城市分布数据
    const cityData = cityStore.cityDistribution.map(city => ({
      '城市': city.工作地点,
      '职位数量': city.count,
      '占比': ((city.count / cityStore.totalJobs) * 100).toFixed(2) + '%'
    }))
    
    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new()
    const citySheet = XLSX.utils.json_to_sheet(cityData)
    
    XLSX.utils.book_append_sheet(workbook, citySheet, '城市分布数据')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `城市招聘分布数据-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 导出城市招聘数量排名数据
const exportCityRankingData = () => {
  try {
    if (!cityStore.topCities.length) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    // 城市排名数据
    const rankingData = cityStore.topCities.map((city, index) => ({
      '排名': index + 1,
      '城市': city.工作地点,
      '职位数量': city.count,
      '占比': ((city.count / cityStore.totalJobs) * 100).toFixed(2) + '%'
    }))
    
    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new()
    const rankingSheet = XLSX.utils.json_to_sheet(rankingData)
    
    XLSX.utils.book_append_sheet(workbook, rankingSheet, '城市招聘数量排名')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `城市招聘数量排名-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 导出城市招聘分布数据
const exportCityDistributionData = () => {
  try {
    if (!cityStore.cityChartData) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    const { cities, counts } = cityStore.cityChartData
    
    // 城市分布数据
    const distributionData = cities.map((city, index) => ({
      '城市': city,
      '职位数量': counts[index],
      '占比': ((counts[index] / counts.reduce((a, b) => a + b, 0)) * 100).toFixed(2) + '%'
    }))
    
    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new()
    const distributionSheet = XLSX.utils.json_to_sheet(distributionData)
    
    XLSX.utils.book_append_sheet(workbook, distributionSheet, '城市招聘分布')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `城市招聘分布数据-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 导出城市薪资热力图数据
const exportHeatmapData = () => {
  try {
    if (!cityStore.salaryCityHeatmap) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    const { cities, salary_ranges, heatmap_data } = cityStore.salaryCityHeatmap
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 热力图数据
    const heatmapData = []
    
    // 添加表头（薪资区间）
    const header = ['城市', ...salary_ranges]
    heatmapData.push(header)
    
    // 添加每个城市的数据
    cities.forEach((city, cityIndex) => {
      const row = [city]
      salary_ranges.forEach((_, salaryIndex) => {
        row.push(heatmap_data[cityIndex][salaryIndex].toString())
      })
      heatmapData.push(row)
    })
    
    // 创建工作表
    const heatmapSheet = XLSX.utils.aoa_to_sheet(heatmapData)
    
    XLSX.utils.book_append_sheet(workbook, heatmapSheet, '城市薪资热力图')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `城市薪资热力图数据-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 导出城市对比数据
const exportCityComparisonData = () => {
  try {
    if (!cityStore.cityComparison) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    const { cities, counts, percentages, salary_comparison } = cityStore.cityComparison
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 城市对比数据
    const comparisonData = cities.map((city, index) => ({
      '城市': city,
      '职位数量': counts[index],
      '占比': percentages[index].toFixed(2) + '%',
      '平均薪资': salary_comparison[city].avg,
      '最低薪资': salary_comparison[city].min,
      '最高薪资': salary_comparison[city].max
    }))
    
    // 创建工作表
    const comparisonSheet = XLSX.utils.json_to_sheet(comparisonData)
    
    XLSX.utils.book_append_sheet(workbook, comparisonSheet, '城市对比数据')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `城市对比数据-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 导出城市公司规模分布对比数据
const exportCityCompanySizeData = () => {
  try {
    if (!cityStore.rawComparisonData || !cityStore.cityComparison) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    const { cities } = cityStore.cityComparison
    const { company_size_distribution } = cityStore.rawComparisonData
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 获取所有公司规模类别
    const allSizes = Array.from(
      new Set(
        Object.values(company_size_distribution)
          .flatMap(cityData => Object.keys(cityData as Record<string, number>))
      )
    )
    
    // 城市公司规模分布数据
    const companySizeData = []
    
    // 添加表头
    const header = ['城市', ...allSizes]
    companySizeData.push(header)
    
    // 添加每个城市的数据
    cities.forEach(city => {
      const row = [city]
      const cityData = company_size_distribution[city] || {}
      
      allSizes.forEach(size => {
        row.push((cityData[size] || 0).toString())
      })
      
      companySizeData.push(row)
    })
    
    // 创建工作表
    const companySizeSheet = XLSX.utils.aoa_to_sheet(companySizeData)
    
    XLSX.utils.book_append_sheet(workbook, companySizeSheet, '城市公司规模分布')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `城市公司规模分布数据-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 导出城市教育程度分布对比数据
const exportCityEducationData = () => {
  try {
    if (!cityStore.rawComparisonData || !cityStore.cityComparison) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    const { cities } = cityStore.cityComparison
    const { education_distribution } = cityStore.rawComparisonData
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 获取所有教育程度类别
    const allEducations = Array.from(
      new Set(
        Object.values(education_distribution)
          .flatMap(cityData => Object.keys(cityData as Record<string, number>))
      )
    )
    
    // 城市教育程度分布数据
    const educationData = []
    
    // 添加表头
    const header = ['城市', ...allEducations]
    educationData.push(header)
    
    // 添加每个城市的数据
    cities.forEach(city => {
      const row = [city]
      const cityData = education_distribution[city] || {}
      
      allEducations.forEach(edu => {
        row.push((cityData[edu] || 0).toString())
      })
      
      educationData.push(row)
    })
    
    // 创建工作表
    const educationSheet = XLSX.utils.aoa_to_sheet(educationData)
    
    XLSX.utils.book_append_sheet(workbook, educationSheet, '城市教育程度分布')
    
    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `城市教育程度分布数据-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
  }
}

// 监听limitValue变化
watch(limitValue, (newValue) => {
  cityStore.updateLimit(newValue)
})

// 选项卡切换处理
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  
  // 根据选项卡加载不同的数据
  if (tab === 'heatmap' && !cityStore.salaryCityHeatmap) {
    cityStore.fetchSalaryCityHeatmap()
  }
}

// 热力图筛选器配置
const heatmapFilterItems = [
  {
    type: 'select' as const,
    field: 'limit',
    label: '显示城市数量',
    options: [
      { label: 'Top 5', value: 5 },
      { label: 'Top 10', value: 10 },
      { label: 'Top 15', value: 15 },
      { label: 'Top 20', value: 20 }
    ],
    defaultValue: 10
  }
]

// 处理热力图筛选器变化
const handleHeatmapFilter = (params: Record<string, any>) => {
  if (params.limit !== cityStore.heatmapLimit) {
    cityStore.updateHeatmapLimit(params.limit)
  }
}

// 刷新热力图数据
const refreshHeatmapData = () => {
  return cityStore.fetchSalaryCityHeatmap()
}

// 处理城市对比
const handleCityComparison = () => {
  if (selectedCities.value.length >= 2) {
    cityStore.fetchCityComparison(selectedCities.value)
  }
}

// 获取可用于对比的城市列表
const availableCities = computed(() => {
  return cityStore.cityDistribution.map(city => city.工作地点)
})

onMounted(async () => {
  await cityStore.updateLimit(limitValue.value)
  await cityStore.fetchCityData()
})
</script>

<template>
  <div class="city-analysis-container p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">城市分析</h1>
      <div class="flex items-center">
        <span class="text-sm text-gray-500 mr-2">最后更新: {{ formattedLastUpdated }}</span>
        <el-button 
          :icon="Refresh" 
          circle 
          @click="refreshData" 
          :loading="cityStore.isLoading"
          type="primary"
          class="mr-2"
        />
        <el-button 
          :icon="Download" 
          circle 
          @click="exportData" 
          :disabled="cityStore.isLoading || !cityStore.cityDistribution.length"
          type="success"
        />
      </div>
    </div>
    
    <ErrorMessage 
      :error="cityStore.error" 
      title="获取数据失败" 
      show-retry 
      @retry="refreshData" 
    />
    
    <!-- 选项卡 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="mb-4">
      <el-tab-pane label="城市分布" name="distribution"></el-tab-pane>
      <el-tab-pane label="薪资热力图" name="heatmap"></el-tab-pane>
      <el-tab-pane label="城市对比" name="comparison"></el-tab-pane>
    </el-tabs>
    
    <!-- 城市分布视图 -->
    <div v-show="activeTab === 'distribution'">
    <!-- 筛选器 -->
    <FilterPanel 
      :filters="filterItems" 
      :loading="cityStore.isLoading" 
      show-reset 
      @filter="handleFilter"
      class="mb-4"
    />
    
    <!-- 城市招聘数量排名图表 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>城市招聘数量排名</span>
          <div class="flex items-center">
            <el-button 
              type="primary" 
              size="small" 
              @click="exportCityRankingData" 
              :disabled="cityStore.isLoading || !cityStore.topCities.length"
              class="mr-2"
            >
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
            <span class="text-sm text-gray-500">显示前 {{ limitValue }} 个城市</span>
          </div>
        </div>
      </template>
      <LoadingState :loading="cityStore.isLoading" skeleton>
        <BaseChart :options="cityStore.cityRankingOptions" height="400px" auto-resize />
      </LoadingState>
    </el-card>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 城市分布图表 -->
      <el-card shadow="hover" class="lg:col-span-2">
        <template #header>
          <div class="flex justify-between items-center">
            <span>城市招聘分布图表</span>
            <div class="flex items-center">
              <el-button 
                type="primary" 
                size="small" 
                @click="exportCityDistributionData" 
                :disabled="cityStore.isLoading || !cityStore.cityChartData"
                class="mr-2"
              >
                <el-icon><Download /></el-icon> 导出数据
              </el-button>
              <span class="text-sm text-gray-500">显示前 {{ limitValue }} 个城市</span>
            </div>
          </div>
        </template>
        <LoadingState :loading="cityStore.isLoading" skeleton>
          <div class="text-xs text-gray-500 mb-2">
            提示：饼图展示了各个城市招聘职位的占比情况
          </div>
          <BaseChart :options="cityDistributionOptions" height="500px" auto-resize />
        </LoadingState>
      </el-card>
      </div>
    </div>
    
    <!-- 薪资热力图视图 -->
    <div v-show="activeTab === 'heatmap'">
      <!-- 热力图筛选器 -->
      <FilterPanel 
        :filters="heatmapFilterItems" 
        :loading="cityStore.isHeatmapLoading" 
        show-reset 
        @filter="handleHeatmapFilter"
        class="mb-4"
      />
      
      <!-- 城市薪资热力图 -->
      <el-card shadow="hover" class="mb-6">
        <template #header>
          <div class="flex justify-between items-center">
            <span>城市薪资热力图</span>
            <div class="flex items-center">
              <el-button 
                type="primary" 
                size="small" 
                @click="exportHeatmapData" 
                :disabled="cityStore.isHeatmapLoading || !cityStore.salaryCityHeatmap"
                class="mr-2"
              >
                <el-icon><Download /></el-icon> 导出数据
              </el-button>
              <span class="text-sm text-gray-500 mr-2">显示前 {{ cityStore.heatmapLimit }} 个城市</span>
              <el-button 
                :icon="Refresh" 
                circle 
                @click="refreshHeatmapData" 
                :loading="cityStore.isHeatmapLoading"
                type="primary"
                size="small"
              />
            </div>
          </div>
        </template>
        <ErrorMessage 
          :error="cityStore.heatmapError" 
          title="获取热力图数据失败" 
          show-retry 
          @retry="refreshHeatmapData" 
        />
        <LoadingState :loading="cityStore.isHeatmapLoading" skeleton>
          <div class="text-xs text-gray-500 mb-2">
            提示：热力图展示了不同城市在各薪资区间的职位数量分布，颜色越深表示职位数量越多
          </div>
          <BaseChart :options="cityStore.heatmapOptions" height="600px" auto-resize />
        </LoadingState>
      </el-card>
    </div>
    
    <!-- 城市对比视图 -->
    <div v-show="activeTab === 'comparison'">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 城市对比参数配置面板 -->
        <el-card shadow="hover" class="lg:col-span-1">
          <template #header>
            <div class="flex justify-between items-center">
              <span>城市对比参数配置</span>
            </div>
          </template>
          <LoadingState :loading="cityStore.isLoading" skeleton>
            <CityComparisonConfig 
              :available-cities="availableCities"
              :loading="cityStore.isComparisonLoading"
              :max-selection="5"
              v-model:cities="selectedCities"
              @compare="handleCityComparison"
            />
          </LoadingState>
        </el-card>
        
        <!-- 城市对比结果 -->
        <el-card shadow="hover" class="lg:col-span-2" v-if="cityStore.cityComparison">
          <template #header>
            <div class="flex justify-between items-center">
              <span>城市招聘数据对比</span>
              <div class="flex items-center">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="exportCityComparisonData" 
                  :disabled="cityStore.isComparisonLoading || !cityStore.cityComparison"
                  class="mr-2"
                >
                  <el-icon><Download /></el-icon> 导出数据
                </el-button>
                <span class="text-sm text-gray-500">
                  {{ cityStore.cityComparison?.cities.join(' vs ') }}
                </span>
              </div>
            </div>
          </template>
          <ErrorMessage 
            :error="cityStore.comparisonError" 
            title="获取城市对比数据失败" 
            show-retry 
            @retry="handleCityComparison" 
          />
          <LoadingState :loading="cityStore.isComparisonLoading" skeleton>
            <div class="text-xs text-gray-500 mb-2">
              提示：雷达图展示了所选城市在不同维度上的对比情况
            </div>
            <BaseChart :options="cityStore.cityComparisonRadarOptions" height="400px" auto-resize />
          </LoadingState>
        </el-card>
        
        <!-- 城市职位数量对比 -->
        <el-card shadow="hover" class="lg:col-span-3" v-if="cityStore.cityComparison">
          <template #header>
            <div class="flex justify-between items-center">
              <span>城市招聘职位数量对比</span>
            </div>
          </template>
          <LoadingState :loading="cityStore.isComparisonLoading" skeleton>
            <BaseChart :options="cityStore.cityComparisonBarOptions" height="400px" auto-resize />
          </LoadingState>
        </el-card>
        
        <!-- 城市公司规模分布对比 -->
        <el-card shadow="hover" class="lg:col-span-3" v-if="cityStore.cityComparison && cityStore.rawComparisonData">
          <template #header>
            <div class="flex justify-between items-center">
              <span>城市公司规模分布对比</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="exportCityCompanySizeData" 
                :disabled="cityStore.isComparisonLoading || !cityStore.rawComparisonData"
              >
                <el-icon><Download /></el-icon> 导出数据
              </el-button>
            </div>
          </template>
          <LoadingState :loading="cityStore.isComparisonLoading" skeleton>
            <BaseChart :options="cityStore.cityCompanySizeOptions" height="400px" auto-resize />
          </LoadingState>
        </el-card>
        
        <!-- 城市教育程度分布对比 -->
        <el-card shadow="hover" class="lg:col-span-3" v-if="cityStore.cityComparison && cityStore.rawComparisonData">
          <template #header>
            <div class="flex justify-between items-center">
              <span>城市教育程度分布对比</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="exportCityEducationData" 
                :disabled="cityStore.isComparisonLoading || !cityStore.rawComparisonData"
              >
                <el-icon><Download /></el-icon> 导出数据
              </el-button>
            </div>
          </template>
          <LoadingState :loading="cityStore.isComparisonLoading" skeleton>
            <BaseChart :options="cityStore.cityEducationOptions" height="400px" auto-resize />
          </LoadingState>
        </el-card>
        
        <el-card shadow="hover" class="lg:col-span-3" v-if="!cityStore.cityComparison && !cityStore.isComparisonLoading">
          <div class="p-8 text-center text-gray-500">
            <el-empty description="请在左侧选择至少两个城市进行对比" />
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 数据来源说明 -->
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <span>数据说明</span>
        </div>
      </template>
      <div class="p-4">

        <p class="text-gray-500 text-sm">
          <template v-if="activeTab === 'distribution'">
          当前展示的数据为静态招聘数据分析结果，包括城市招聘数量排名和城市分布饼图。
          </template>
          <template v-else-if="activeTab === 'heatmap'">
            热力图展示了不同城市在各薪资区间的职位数量分布，可以直观地看出各城市的薪资水平差异。
          </template>
          <template v-else-if="activeTab === 'comparison'">
            城市对比功能允许您选择多个城市进行多维度对比，包括职位数量、平均薪资、最高薪资等指标。
          </template>
          如需查看更多详细数据，请使用右上角的导出功能下载完整数据集。
        </p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.city-analysis-container {
  min-height: calc(100vh - 64px);
}
</style> 