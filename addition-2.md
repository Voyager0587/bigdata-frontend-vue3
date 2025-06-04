# Excel数据分析API文档

本文档描述了基于Excel文件数据的分析API接口，包括不同公司类型的平均工资水平和不同行业的平均工资水平数据。

## 1. 不同公司类型的平均工资水平接口

### 接口信息

- **接口路径**：`/api/v1/excel/company-type-salary`
- **请求方式**：GET
- **接口描述**：获取不同公司类型的平均工资水平数据

### 请求参数

无

### 返回数据格式

```json
{
  "code": 200,
  "message": "获取不同公司类型的平均工资水平数据成功",
  "data": {
    "company_types": ["国企", "外企", "民营企业", "合资企业", "创业公司"],
    "avg_salaries": [12000, 15000, 10000, 13000, 9000],
    "data": [
      {"company_type": "国企", "avg_salary": 12000},
      {"company_type": "外企", "avg_salary": 15000},
      {"company_type": "民营企业", "avg_salary": 10000},
      {"company_type": "合资企业", "avg_salary": 13000},
      {"company_type": "创业公司", "avg_salary": 9000}
    ]
  }
}
```

### 数据说明

- `company_types`: 公司类型列表
- `avg_salaries`: 对应公司类型的平均工资
- `data`: 包含公司类型和平均工资的详细数据


## 2. 不同行业的平均工资水平接口

### 接口信息

- **接口路径**：`/api/v1/excel/industry-salary`
- **请求方式**：GET
- **接口描述**：获取不同行业的平均工资水平数据

### 请求参数

无

### 返回数据格式

```json
{
  "code": 200,
  "message": "获取不同行业的平均工资水平数据成功",
  "data": {
    "industries": ["互联网", "金融", "教育", "医疗", "制造业"],
    "avg_salaries": [14000, 16000, 8000, 10000, 9000],
    "data": [
      {"industry": "互联网", "avg_salary": 14000},
      {"industry": "金融", "avg_salary": 16000},
      {"industry": "教育", "avg_salary": 8000},
      {"industry": "医疗", "avg_salary": 10000},
      {"industry": "制造业", "avg_salary": 9000}
    ]
  }
}
```

### 数据说明

- `industries`: 行业列表
- `avg_salaries`: 对应行业的平均工资
- `data`: 包含行业和平均工资的详细数据
