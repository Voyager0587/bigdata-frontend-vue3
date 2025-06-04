# 公司分析模块 API 接口需求

本文档描述了公司分析模块所需的后端API接口规范，包括接口路径、请求方式、参数和返回数据格式。

## 1. 公司规模与职位需求关系数据接口

### 接口信息

- **接口路径**：`/api/company/job-relation`
- **请求方式**：GET
- **接口描述**：获取不同公司规模下各职位类别的需求数量

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
| ----- | ---- | ---- | ---- | ------ |
| timeRange | string | 否 | 时间范围筛选 | "last_month", "last_quarter", "last_year" |
| region | string | 否 | 地区筛选 | "北京", "上海", "广州" |

### 返回数据格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "company_sizes": ["少于50人", "50-150人", "150-500人", "500-1000人", "1000-5000人", "5000人以上"],
    "job_categories": ["开发", "测试", "运维", "产品", "设计", "市场"],
    "data": [
      [120, 80, 40, 50, 30, 20],  // 少于50人公司各职位类别需求数量
      [150, 100, 60, 70, 50, 30], // 50-150人公司各职位类别需求数量
      [180, 120, 80, 90, 70, 50], // 150-500人公司各职位类别需求数量
      [200, 150, 100, 110, 90, 70], // 500-1000人公司各职位类别需求数量
      [220, 170, 120, 130, 110, 90], // 1000-5000人公司各职位类别需求数量
      [240, 190, 140, 150, 130, 110] // 5000人以上公司各职位类别需求数量
    ]
  }
}
```

### 数据说明

- `company_sizes`: 公司规模分类列表
- `job_categories`: 职位类别列表
- `data`: 二维数组，外层数组的每个元素对应一个公司规模，内层数组的每个元素对应该公司规模下对应职位类别的需求数量

### 错误码

| 错误码 | 描述 |
| ----- | ---- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 500 | 服务器内部错误 |

---

## 2. 公司规模与薪资分布堆叠柱状图数据接口

### 接口信息

- **接口路径**：`/api/company/salary-distribution`
- **请求方式**：GET
- **接口描述**：获取不同公司规模下各薪资区间的职位数量分布

### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
| ----- | ---- | ---- | ---- | ------ |
| timeRange | string | 否 | 时间范围筛选 | "last_month", "last_quarter", "last_year" |
| region | string | 否 | 地区筛选 | "北京", "上海", "广州" |
| jobCategory | string | 否 | 职位类别筛选 | "开发", "测试", "运维" |

### 返回数据格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "company_sizes": ["少于50人", "50-150人", "150-500人", "500-1000人", "1000-5000人", "5000人以上"],
    "salary_ranges": ["0-5k", "5-10k", "10-15k", "15-20k", "20-30k", "30k+"],
    "data": [
      [50, 120, 80, 40, 20, 10],   // 少于50人公司各薪资区间的职位数量
      [30, 100, 150, 70, 30, 15],   // 50-150人公司各薪资区间的职位数量
      [20, 80, 160, 120, 60, 30],   // 150-500人公司各薪资区间的职位数量
      [10, 60, 140, 180, 90, 50],   // 500-1000人公司各薪资区间的职位数量
      [5, 40, 120, 200, 150, 80],   // 1000-5000人公司各薪资区间的职位数量
      [2, 30, 100, 180, 200, 120]   // 5000人以上公司各薪资区间的职位数量
    ]
  }
}
```

### 数据说明

- `company_sizes`: 公司规模分类列表
- `salary_ranges`: 薪资区间列表
- `data`: 二维数组，外层数组的每个元素对应一个公司规模，内层数组的每个元素对应该公司规模下对应薪资区间的职位数量

### 错误码

| 错误码 | 描述 |
| ----- | ---- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 500 | 服务器内部错误 |

---

## 数据结构设计建议

### 数据库表设计

1. **职位表(job_positions)**
   - id: 主键
   - title: 职位名称
   - company_id: 公司ID
   - category_id: 职位类别ID
   - salary_min: 最低薪资
   - salary_max: 最高薪资
   - created_at: 创建时间
   - updated_at: 更新时间

2. **公司表(companies)**
   - id: 主键
   - name: 公司名称
   - size_category: 公司规模类别
   - region: 地区
   - industry: 行业
   - created_at: 创建时间
   - updated_at: 更新时间

3. **职位类别表(job_categories)**
   - id: 主键
   - name: 类别名称
   - description: 类别描述
   - created_at: 创建时间
   - updated_at: 更新时间

### 查询逻辑

1. 公司规模与职位需求关系数据：
   ```sql
   SELECT 
     c.size_category, 
     jc.name, 
     COUNT(jp.id) as job_count
   FROM 
     job_positions jp
   JOIN 
     companies c ON jp.company_id = c.id
   JOIN 
     job_categories jc ON jp.category_id = jc.id
   WHERE 
     jp.created_at BETWEEN :start_date AND :end_date
   GROUP BY 
     c.size_category, jc.name
   ORDER BY 
     c.size_category, jc.name;
   ```

2. 公司规模与薪资分布堆叠柱状图数据：
   ```sql
   SELECT 
     c.size_category,
     CASE 
       WHEN jp.salary_min < 5000 THEN '0-5k'
       WHEN jp.salary_min < 10000 THEN '5-10k'
       WHEN jp.salary_min < 15000 THEN '10-15k'
       WHEN jp.salary_min < 20000 THEN '15-20k'
       WHEN jp.salary_min < 30000 THEN '20-30k'
       ELSE '30k+'
     END as salary_range,
     COUNT(jp.id) as job_count
   FROM 
     job_positions jp
   JOIN 
     companies c ON jp.company_id = c.id
   WHERE 
     jp.created_at BETWEEN :start_date AND :end_date
   GROUP BY 
     c.size_category, salary_range
   ORDER BY 
     c.size_category, salary_range;
   ```

## 接口实现注意事项

1. 接口应支持缓存机制，避免频繁查询数据库
2. 考虑数据量较大时的分页查询
3. 实现数据的定时更新机制，确保数据的时效性
4. 添加适当的权限控制，确保数据安全
5. 对接口进行性能优化，确保响应速度 