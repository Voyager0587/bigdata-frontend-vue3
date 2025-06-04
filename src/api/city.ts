import request from '../utils/request'
import type { ApiResponse, CityDistribution, CityChartData, SalaryCityHeatmapData, CityComparisonData } from './types'

/**
 * 获取城市分布数据
 */
export const getCityDistribution = () => {
  return request.get<any, ApiResponse<CityDistribution[]>>('/city-distribution')
}

/**
 * 获取招聘数量前N的城市数据
 * @param limit 返回的城市数量
 */
export const getTopCities = (limit: number) => {
  return request.get<any, ApiResponse<CityDistribution[]>>(`/city-distribution/top/${limit}`)
}

/**
 * 获取适合图表展示的城市分布数据
 * @param limit 返回的城市数量
 */
export const getCityChartData = (limit: number) => {
  return request.get<any, ApiResponse<CityChartData>>(`/city-distribution/chart/${limit}`)
}

/**
 * 获取城市薪资热力图数据
 * @param limit 返回的城市数量，默认为10
 */
export const getSalaryCityHeatmap = (limit: number = 10) => {
  return request.get<any, ApiResponse<SalaryCityHeatmapData>>(`/salary-city-heatmap?limit=${limit}`)
}

/**
 * 获取城市招聘对比数据
 * @param cities 要对比的城市列表，以逗号分隔
 */
export const getCityComparison = (cities: string[]) => {
  return request.get<any, ApiResponse<CityComparisonData>>(`/city-comparison?cities=${cities.join(',')}`)
} 