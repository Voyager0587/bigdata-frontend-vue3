<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '../../stores'
import { Location, Reading, OfficeBuilding, Money, Refresh, DataLine } from '@element-plus/icons-vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import LoadingState from '../../components/LoadingState.vue'
import ErrorMessage from '../../components/ErrorMessage.vue'
import DataCard from '../../components/DataCard.vue'
import type { EChartsOption } from 'echarts/types/dist/shared'
import echarts from '../../utils/echarts'

const router = useRouter()
const dashboardStore = useDashboardStore()

// 格式化日期为字符串
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 刷新数据
const refreshData = async () => {
  await dashboardStore.refreshData()
}

// 行业显示数量选项
const industryCountOptions = [
  { label: '前10名', value: 10 },
  { label: '前20名', value: 20 }
]

// 更改行业显示数量
const handleIndustryCountChange = (value: number) => {
  dashboardStore.updateIndustryDisplayCount(value)
}

// 城市分布图表配置
const cityChartOptions = computed<EChartsOption>(() => {
  if (!dashboardStore.cityDistribution) {
    return {
      title: {
        text: '城市分布',
        left: 'center'
      }
    }
  }
  
  return {
    title: {
      text: '热门城市招聘分布',
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
      type: 'category',
      data: dashboardStore.cityDistribution.cities,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '职位数量'
    },
    series: [
      {
        name: '职位数量',
        type: 'bar',
        data: dashboardStore.cityDistribution.counts,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
})

// 薪资分布图表配置
const salaryChartOptions = computed<EChartsOption>(() => {
  if (!dashboardStore.salaryDistribution) {
    return {
      title: {
        text: '薪资区间分布',
        left: 'center'
      }
    }
  }
  
  return {
    title: {
      text: '薪资区间分布概览',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: dashboardStore.salaryDistribution.salary_ranges
    },
    series: [
      {
        name: '薪资区间',
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
        data: dashboardStore.salaryDistribution.salary_ranges.map((range, index) => ({
          value: dashboardStore.salaryDistribution!.counts[index],
          name: range,
          itemStyle: {
            color: [
              '#5470c6',
              '#91cc75',
              '#fac858',
              '#ee6666',
              '#73c0de',
              '#3ba272',
              '#fc8452',
              '#9a60b4'
            ][index % 8]
          }
        }))
      }
    ]
  }
})

// 导航到详情页
const navigateToDetail = (path: string) => {
  router.push(path)
}

// 格式化最后更新时间
const formattedLastUpdated = computed(() => {
  if (!dashboardStore.lastUpdated) return '未更新'
  return formatDate(dashboardStore.lastUpdated)
})

onMounted(() => {
  if (!dashboardStore.lastUpdated) {
    refreshData()
  }
})
</script>

<template>
  <div class="dashboard-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">数据概览</h1>
        <div class="flex items-center">
        <span class="text-sm text-gray-500 mr-2">最后更新: {{ formattedLastUpdated }}</span>
        <el-button 
          :icon="Refresh" 
          circle 
          @click="refreshData" 
          :loading="dashboardStore.isLoading"
          type="primary"
        />
          </div>
        </div>
    
    <ErrorMessage 
      :error="dashboardStore.error" 
      title="获取数据失败" 
      show-retry 
      @retry="refreshData" 
    />
    
    <!-- 关键数据指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DataCard
        title="招聘职位总数"
        :value="dashboardStore.totalJobs"
        sub-title="全部职位数量"
        :icon="DataLine"
        icon-color="#409EFF"
        :loading="dashboardStore.isLoading"
      />
      
      <DataCard
        title="热门城市"
        :value="dashboardStore.mostPopularCity?.工作地点 || '加载中'"
        :sub-title="dashboardStore.mostPopularCity ? `${dashboardStore.mostPopularCity.count} 个职位` : ''"
        :icon="Location"
        icon-color="#67C23A"
        :loading="dashboardStore.isLoading"
      />
      
      <DataCard
        title="主要学历要求"
        :value="dashboardStore.mostPopularEducation?.name || '加载中'"
        :sub-title="dashboardStore.mostPopularEducation ? `${dashboardStore.mostPopularEducation.count} 个职位` : ''"
        :icon="Reading"
        icon-color="#E6A23C"
        :loading="dashboardStore.isLoading"
      />
      
      <DataCard
        title="主要薪资区间"
        :value="dashboardStore.averageSalaryRange || '加载中'"
        :icon="Money"
        icon-color="#F56C6C"
        :loading="dashboardStore.isLoading"
      />
    </div>
    
    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="flex justify-between items-center">
            <span>城市分布</span>
            <el-button type="primary" link @click="navigateToDetail('/city')">
              查看详情
            </el-button>
          </div>
        </template>
        <LoadingState :loading="dashboardStore.isLoading" skeleton>
          <BaseChart :options="cityChartOptions" height="350px" auto-resize />
        </LoadingState>
      </el-card>
      
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="flex justify-between items-center">
            <span>薪资区间分布</span>
            <el-button type="primary" link @click="navigateToDetail('/salary')">
              查看详情
            </el-button>
          </div>
        </template>
        <LoadingState :loading="dashboardStore.isLoading" skeleton>
          <BaseChart :options="salaryChartOptions" height="350px" auto-resize />
        </LoadingState>
      </el-card>
    </div>
    
    <!-- 高薪行业排行 -->
    <div class="mb-6">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <span>高薪行业排行</span>
              <el-select
                v-model="dashboardStore.industryDisplayCount"
                class="ml-4"
                size="small"
                @change="handleIndustryCountChange"
                :disabled="!dashboardStore.industrySalaryData"
              >
                <el-option
                  v-for="option in industryCountOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
            <el-button type="primary" link @click="navigateToDetail('/company')">
              查看详情
            </el-button>
          </div>
        </template>
        <LoadingState :loading="dashboardStore.isLoading" skeleton>
          <BaseChart 
            v-if="dashboardStore.industrySalaryData" 
            :options="dashboardStore.industrySalaryChartOptions" 
            height="350px" 
            auto-resize 
          />
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            暂无行业薪资数据
          </div>
        </LoadingState>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.chart-card {
  transition: all 0.3s;
}

.chart-card:hover {
  transform: translateY(-5px);
}
</style> 