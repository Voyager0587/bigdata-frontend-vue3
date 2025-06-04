import request from '../utils/request'
import type { ApiResponse, CompanySizeDistribution, CompanySizeChartData, CompanySizeSalaryDistribution, CompanySizeSalaryData, CompanyTypeSalaryData, IndustrySalaryData } from './types'

/**
 * 获取公司规模分布数据
 */
export const getCompanySizeDistribution = () => {
  return request.get<any, ApiResponse<CompanySizeDistribution[]>>('/company-size-distribution')
}

/**
 * 获取适合图表展示的公司规模分布数据
 */
export const getCompanySizeChartData = () => {
  return request.get<any, ApiResponse<CompanySizeChartData>>('/company-size-distribution/chart')
}

/**
 * 获取公司规模与薪资分布堆叠柱状图数据
 */
export const getCompanySalaryDistribution = (params?: {
  timeRange?: string;
  region?: string;
  jobCategory?: string;
}) => {
  return request.get<any, ApiResponse<CompanySizeSalaryDistribution>>('/company/salary-distribution', { params })
}

/**
 * 获取不同规模公司的薪资水平数据
 */
export const getCompanySizeSalary = () => {
  return request.get<any, ApiResponse<CompanySizeSalaryData>>('/company-size-salary')
}

/**
 * 获取不同公司类型的平均工资水平数据
 */
export const getCompanyTypeSalary = () => {
  return request.get<any, ApiResponse<CompanyTypeSalaryData>>('/excel/company-type-salary')
}

/**
 * 获取不同行业的平均工资水平数据
 */
export const getIndustrySalary = () => {
  return request.get<any, ApiResponse<IndustrySalaryData>>('/excel/industry-salary')
} 