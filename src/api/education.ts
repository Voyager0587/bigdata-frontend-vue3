import request from '../utils/request'
import type { ApiResponse, EducationDistribution, EducationChartData, CityEducationAnalysisData } from './types'

/**
 * 获取学历分布数据
 */
export const getEducationDistribution = () => {
  return request.get<any, ApiResponse<EducationDistribution[]>>('/education-distribution')
}

/**
 * 获取适合图表展示的学历分布数据
 */
export const getEducationChartData = () => {
  return request.get<any, ApiResponse<EducationChartData>>('/education-distribution/chart')
}

/**
 * 获取城市与学历交叉分析数据
 * @param cityLimit 返回的城市数量，默认为5
 */
export const getCityEducationAnalysis = (cityLimit: number = 5) => {
  return request.get<any, ApiResponse<CityEducationAnalysisData>>(`/city-education-analysis?city_limit=${cityLimit}`)
} 