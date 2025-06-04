import request from '../utils/request'
import type { 
  ApiResponse, 
  SalaryAnalysis, 
  SalaryChartData, 
  SalaryDistribution,
  SalaryDistributionOverview,
  HighSalaryEducation,
  HighSalaryChartData,
  SalaryDetailedDistribution
} from './types'

/**
 * 获取学历薪资分析数据
 */
export const getSalaryAnalysis = () => {
  return request.get<any, ApiResponse<SalaryAnalysis[]>>('/salary-analysis')
}

/**
 * 获取适合图表展示的学历薪资分析数据
 */
export const getSalaryChartData = () => {
  return request.get<any, ApiResponse<SalaryChartData>>('/salary-analysis/chart')
}

/**
 * 获取薪资区间分布原始数据
 */
export const getSalaryDistribution = () => {
  return request.get<any, ApiResponse<SalaryDistribution[]>>('/salary-distribution')
}

/**
 * 获取按学历分组的薪资区间分布数据
 */
export const getSalaryDistributionByEducation = () => {
  return request.get<any, ApiResponse<any>>('/salary-distribution/by-education')
}

/**
 * 获取按薪资区间分组的学历分布数据
 */
export const getSalaryDistributionByRange = () => {
  return request.get<any, ApiResponse<any>>('/salary-distribution/by-range')
}

/**
 * 获取薪资区间总体分布数据
 */
export const getSalaryDistributionOverview = () => {
  return request.get<any, ApiResponse<SalaryDistributionOverview>>('/salary-distribution/overview')
}

/**
 * 获取高薪职位学历分布数据
 */
export const getHighSalaryAnalysis = () => {
  return request.get<any, ApiResponse<HighSalaryEducation[]>>('/high-salary-analysis')
}

/**
 * 获取适合图表展示的高薪职位学历分布数据
 */
export const getHighSalaryChartData = () => {
  return request.get<any, ApiResponse<HighSalaryChartData>>('/high-salary-analysis/chart')
}

/**
 * 获取薪资详细分布数据
 * @param interval 薪资分组间隔，默认为1000
 */
export const getSalaryDetailedDistribution = (interval: number = 1000) => {
  return request.get<any, ApiResponse<SalaryDetailedDistribution>>(`/salary-detailed-distribution?interval=${interval}`)
} 