// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 城市分布数据类型
export interface CityDistribution {
  工作地点: string
  count: number
}

// 图表数据类型
export interface CityChartData {
  cities: string[]
  counts: number[]
}

// 城市薪资热力图数据类型
export interface SalaryCityHeatmapData {
  cities: string[]
  salary_ranges: string[]
  heatmap_data: number[][]
}

// 实际API返回的城市对比数据类型
export interface ActualCityComparisonData {
  city_company_size: Record<string, Record<string, number>>
  city_education: Record<string, Record<string, number>>
  city_job_counts: Record<string, number>
  city_salary: Record<string, {
    avg: number
    min: number
    max: number
  }>
}

// 城市招聘对比数据类型
export interface CityComparisonData {
  cities: string[]
  counts: number[]
  percentages: number[]
  ranking: number[]
  comparison: Record<string, number>
  salary_comparison: Record<string, {
    avg: number
    min: number
    max: number
  }>
}

// 公司规模分布数据类型
export interface CompanySizeDistribution {
  公司规模: string
  count: number
}

// 公司规模图表数据类型
export interface CompanySizeChartData {
  sizes: string[]
  counts: number[]
  percentages: number[]
  total: number
}

// 不同公司类型平均工资水平数据类型
export interface CompanyTypeSalaryData {
  company_types: string[]
  avg_salaries: number[]
  data: Array<{
    company_type: string
    avg_salary: number
  }>
}

// 不同行业平均工资水平数据类型
export interface IndustrySalaryData {
  industries: string[]
  avg_salaries: number[]
  data: Array<{
    industry: string
    avg_salary: number
  }>
}

// 学历分布数据类型
export interface EducationDistribution {
  学历: string
  count: number
}

// 学历图表数据类型
export interface EducationChartData {
  education_levels: string[]
  counts: number[]
  percentages: number[]
  total: number
}

// 城市与学历交叉分析数据类型
export interface CityEducationAnalysisData {
  cities: string[]
  education_levels: string[]
  distribution: number[][]
  highest_demand: Record<string, string>
  total_counts: number[][]
}

// 高薪职位学历分布数据类型
export interface HighSalaryEducation {
  学历: string
  高薪职位数: number
  占比: number
}

// 高薪职位图表数据类型
export interface HighSalaryChartData {
  education_levels: string[]
  counts: number[]
  percentages: number[]
}

// 学历薪资分析数据类型
export interface SalaryAnalysis {
  学历: string
  职位数量: number
  平均薪资: number
  最低薪资: string
  最高薪资: string
}

// 学历薪资图表数据类型
export interface SalaryChartData {
  education_levels: string[]
  avg_salaries: number[]
  min_salaries: number[]
  max_salaries: number[]
  job_counts: number[]
}

// 薪资区间分布数据类型
export interface SalaryDistribution {
  学历: string
  薪资区间: string
  数量: number
}

// 薪资区间总体分布数据类型
export interface SalaryDistributionOverview {
  salary_ranges: string[]
  counts: number[]
  percentages: number[]
  total: number
}

// 薪资详细分布数据类型
export interface SalaryDetailedDistribution {
  salary_points: number[]
  counts: number[]
  percentages: number[]
  distribution_curve: {
    x_axis: number[]
    y_axis: number[]
  }
  statistics: {
    mean: number
    median: number
    mode: number
    min: number
    max: number
    quartiles: number[]
  }
} 

// 公司规模与薪资分布数据类型
export interface CompanySizeSalaryDistribution {
  company_sizes: string[]
  salary_ranges: string[]
  data: number[][]
} 

// 公司规模薪资水平数据类型
export interface CompanySizeSalaryData {
  company_sizes: string[]
  avg_salaries: number[]
  min_salaries: number[]
  max_salaries: number[]
  salary_distributions: Record<string, Record<string, number>>
  salary_ranges: string[]
} 