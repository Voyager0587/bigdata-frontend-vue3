# 招聘数据分析扩展API设计

本文档描述了基于现有招聘数据分析API的扩展接口设计，以及相应的前端图表展示建议。

## 1. 薪资热力图接口

### 接口设计

- **接口**: `/salary-city-heatmap`
- **方法**: GET
- **描述**: 提供城市与薪资水平的交叉数据，用于热力图展示
- **参数**:
  - `limit` (查询参数, 整数, 可选): 返回的城市数量，默认为10
- **返回格式**: application/json
- **响应**:
  - **200**: 成功获取薪资城市热力图数据
    ```json
    {
      "code": 200,
      "message": "获取薪资城市热力图数据成功",
      "data": {
        "cities": ["上海", "北京", "深圳", "广州", "杭州"],
        "salary_ranges": ["5000以下", "5000-8000", "8000-12000", "12000-15000", "15000以上"],
        "heatmap_data": [
          [120, 85, 65, 32, 25],  // 上海各薪资区间职位数
          [95, 75, 60, 30, 20],   // 北京各薪资区间职位数
          [110, 80, 55, 28, 18],  // 深圳各薪资区间职位数
          [90, 70, 50, 25, 15],   // 广州各薪资区间职位数
          [80, 65, 45, 22, 12]    // 杭州各薪资区间职位数
        ]
      }
    }
    ```
  - **500**: 服务器错误

### 前端图表展示建议

- **推荐图表类型**: 热力图 (Heatmap)
- **图表库**: ECharts, Highcharts
- **展示效果**: 横轴为薪资区间，纵轴为城市，颜色深浅表示职位数量多少
- **交互功能**: 鼠标悬停显示具体数值，支持筛选特定城市或薪资区间
- **示例代码**:
  ```javascript
  // ECharts示例
  option = {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: data.salary_ranges,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: data.cities,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 120,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: '职位数量',
      type: 'heatmap',
      data: data.heatmap_data.flat().map((value, index) => {
        const row = Math.floor(index / data.salary_ranges.length);
        const col = index % data.salary_ranges.length;
        return [col, row, value];
      }),
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  ```

## 2. 公司规模与薪资关系接口

### 接口设计

- **接口**: `/company-size-salary`
- **方法**: GET
- **描述**: 分析不同规模公司的薪资分布情况
- **返回格式**: application/json
- **响应**:
  - **200**: 成功获取公司规模与薪资关系数据
    ```json
    {
      "code": 200,
      "message": "获取公司规模与薪资关系数据成功",
      "data": {
        "company_sizes": ["少于50人", "50-150人", "150-500人", "500-1000人", "1000-5000人", "5000-10000人", "10000人以上"],
        "avg_salaries": [8500, 9200, 10500, 12000, 13500, 15000, 18000],
        "salary_distributions": {
          "少于50人": {
            "5000以下": 45,
            "5000-8000": 78,
            "8000-12000": 65,
            "12000-15000": 32,
            "15000以上": 14
          },
          "50-150人": {
            "5000以下": 350,
            "5000-8000": 1200,
            "8000-12000": 1500,
            "12000-15000": 650,
            "15000以上": 309
          },
          // 其他公司规模的薪资分布
        },
        "salary_ranges": ["5000以下", "5000-8000", "8000-12000", "12000-15000", "15000以上"]
      }
    }
    ```
  - **500**: 服务器错误

### 前端图表展示建议

- **推荐图表类型**: 
  1. 柱状图 (Bar Chart) - 展示不同规模公司的平均薪资
  2. 堆叠柱状图 (Stacked Bar Chart) - 展示不同规模公司的薪资分布
  3. 箱线图 (Box Plot) - 展示薪资范围和分布
- **图表库**: ECharts, Chart.js, Highcharts
- **展示效果**: 横轴为公司规模，纵轴为薪资水平
- **交互功能**: 点击切换不同的展示维度，支持筛选特定公司规模
- **示例代码**:
  ```javascript
  // ECharts柱状图示例
  option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['平均薪资']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.company_sizes
    },
    yAxis: {
      type: 'value',
      name: '薪资 (元/月)'
    },
    series: [{
      name: '平均薪资',
      type: 'bar',
      data: data.avg_salaries,
      itemStyle: {
        color: function(params) {
          // 根据薪资高低设置不同颜色
          var colorList = ['#91cc75', '#5470c6', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];
          return colorList[params.dataIndex];
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c} 元'
      }
    }]
  };
  ```

## 3. 城市与学历交叉分析接口

### 接口设计

- **接口**: `/city-education-analysis`
- **方法**: GET
- **描述**: 分析主要城市对各学历层次的需求情况
- **参数**:
  - `city_limit` (查询参数, 整数, 可选): 返回的城市数量，默认为5
- **返回格式**: application/json
- **响应**:
  - **200**: 成功获取城市学历需求分析数据
    ```json
    {
      "code": 200,
      "message": "获取城市学历需求分析数据成功",
      "data": {
        "cities": ["上海", "北京", "深圳", "广州", "杭州"],
        "education_levels": ["大专", "本科", "硕士", "博士", "在校生"],
        "distribution": [
          [45, 40, 10, 3, 2],  // 上海各学历占比%
          [35, 50, 12, 2, 1],  // 北京各学历占比%
          [50, 38, 8, 1, 3],   // 深圳各学历占比%
          [48, 40, 7, 1, 4],   // 广州各学历占比%
          [42, 45, 9, 2, 2]    // 杭州各学历占比%
        ],
        "highest_demand": {
          "上海": "大专",
          "北京": "本科",
          "深圳": "大专",
          "广州": "大专",
          "杭州": "本科"
        },
        "total_counts": [
          [890, 790, 197, 59, 37],  // 上海各学历职位数
          [364, 519, 125, 21, 10],  // 北京各学历职位数
          [690, 524, 110, 14, 41],  // 深圳各学历职位数
          [617, 514, 90, 13, 50],   // 广州各学历职位数
          [279, 298, 60, 13, 13]    // 杭州各学历职位数
        ]
      }
    }
    ```
  - **500**: 服务器错误

### 前端图表展示建议

- **推荐图表类型**: 
  1. 堆叠柱状图 (Stacked Bar Chart) - 展示各城市的学历分布
  2. 雷达图 (Radar Chart) - 比较不同城市的学历需求特征
  3. 条形图 (Bar Chart) - 按城市分组展示各学历需求
- **图表库**: ECharts, Chart.js, AntV G2
- **展示效果**: 可切换不同的展示方式，突出城市间的学历需求差异
- **交互功能**: 支持按城市或学历筛选，点击切换百分比/绝对数值显示
- **示例代码**:
  ```javascript
  // ECharts堆叠柱状图示例
  option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: data.education_levels
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.cities
    },
    yAxis: {
      type: 'value',
      name: '占比 (%)'
    },
    series: data.education_levels.map((level, index) => {
      return {
        name: level,
        type: 'bar',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: data.distribution.map(city => city[index])
      };
    })
  };
  ```

## 4. 薪资区间详细分布接口

### 接口设计

- **接口**: `/salary-detailed-distribution`
- **方法**: GET
- **描述**: 提供更精确的薪资分布数据
- **参数**:
  - `interval` (查询参数, 整数, 可选): 薪资分组间隔，默认为1000
- **返回格式**: application/json
- **响应**:
  - **200**: 成功获取详细薪资分布数据
    ```json
    {
      "code": 200,
      "message": "获取详细薪资分布数据成功",
      "data": {
        "salary_points": [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 20000, 25000, 30000],
        "counts": [205, 271, 632, 576, 1543, 525, 1086, 370, 111, 116, 57, 114, 322, 91, 434, 23, 216, 80, 48],
        "percentages": [3.2, 4.3, 9.9, 9.0, 24.2, 8.2, 17.0, 5.8, 1.7, 1.8, 0.9, 1.8, 5.1, 1.4, 6.8, 0.4, 3.4, 1.3, 0.8],
        "distribution_curve": {
          "x_axis": [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 20000, 25000, 30000],
          "y_axis": [205, 271, 632, 576, 1543, 525, 1086, 370, 111, 116, 57, 114, 322, 91, 434, 23, 216, 80, 48]
        },
        "statistics": {
          "mean": 9875.42,
          "median": 8000,
          "mode": 7000,
          "min": 1500,
          "max": 190000,
          "quartiles": [6000, 8000, 12500]
        }
      }
    }
    ```
  - **500**: 服务器错误

### 前端图表展示建议

- **推荐图表类型**: 
  1. 柱状图/直方图 (Histogram) - 展示薪资分布频率
  2. 折线图 (Line Chart) - 展示薪资分布曲线
  3. 箱线图 (Box Plot) - 展示薪资统计特征
  4. 密度图 (Density Plot) - 展示薪资分布密度
- **图表库**: ECharts, D3.js, Plotly
- **展示效果**: 展示薪资分布的峰值、偏态和集中趋势
- **交互功能**: 支持调整分组间隔，缩放查看特定薪资区间
- **示例代码**:
  ```javascript
  // ECharts直方图示例
  option = {
    title: {
      text: '招聘薪资详细分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const index = params[0].dataIndex;
        return `${data.salary_points[index]}元: ${data.counts[index]}个职位 (${data.percentages[index]}%)`;
      }
    },
    xAxis: {
      type: 'category',
      data: data.salary_points.map(p => p + '元'),
      name: '月薪',
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '职位数量'
    },
    series: [{
      data: data.counts,
      type: 'bar',
      barWidth: '90%',
      itemStyle: {
        color: function(params) {
          // 根据数量设置渐变色
          return {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#83bff6'
            }, {
              offset: 1, color: '#188df0'
            }]
          };
        }
      }
    }, {
      data: data.counts,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#ff7300',
        width: 2
      }
    }],
    grid: {
      bottom: 100
    },
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }, {
      start: 0,
      end: 100
    }]
  };
  ```

## 5. 城市招聘职位对比接口

### 接口设计

- **接口**: `/city-comparison`
- **方法**: GET
- **描述**: 支持多城市招聘数据对比
- **参数**:
  - `cities` (查询参数, 字符串, 必选): 要对比的城市列表，以逗号分隔
- **返回格式**: application/json
- **响应**:
  - **200**: 成功获取城市招聘对比数据
    ```json
    {
      "code": 200,
      "message": "获取城市招聘对比数据成功",
      "data": {
        "cities": ["上海", "北京", "深圳"],
        "counts": [1973, 1039, 1379],
        "percentages": [14.2, 7.5, 9.9],
        "ranking": [1, 4, 2],
        "comparison": {
          "上海vs北京": 1.9,
          "上海vs深圳": 1.4,
          "北京vs深圳": 0.75
        },
        "salary_comparison": {
          "上海": {
            "avg": 12500,
            "min": 5000,
            "max": 30000
          },
          "北京": {
            "avg": 13500,
            "min": 6000,
            "max": 35000
          },
          "深圳": {
            "avg": 12000,
            "min": 5500,
            "max": 28000
          }
        }
      }
    }
    ```
  - **400**: 参数错误
  - **500**: 服务器错误

### 前端图表展示建议

- **推荐图表类型**: 
  1. 雷达图 (Radar Chart) - 多维度比较城市特征
  2. 条形图 (Bar Chart) - 直观比较城市职位数量
  3. 气泡图 (Bubble Chart) - 同时展示职位数量、平均薪资和其他维度
  4. 对比柱状图 (Grouped Bar Chart) - 多指标对比
- **图表库**: ECharts, AntV G2, Highcharts
- **展示效果**: 突出城市间的差异和特点
- **交互功能**: 支持添加/删除对比城市，切换不同对比维度
- **示例代码**:
  ```javascript
  // ECharts雷达图示例
  option = {
    title: {
      text: '城市招聘数据对比'
    },
    tooltip: {},
    legend: {
      data: data.cities
    },
    radar: {
      indicator: [
        { name: '职位数量', max: 2000 },
        { name: '平均薪资', max: 15000 },
        { name: '最高薪资', max: 40000 },
        { name: '最低薪资', max: 8000 },
        { name: '占比', max: 15 }
      ]
    },
    series: [{
      name: '城市招聘数据',
      type: 'radar',
      data: data.cities.map((city, index) => {
        return {
          value: [
            data.counts[index],
            data.salary_comparison[city].avg,
            data.salary_comparison[city].max,
            data.salary_comparison[city].min,
            data.percentages[index]
          ],
          name: city
        };
      })
    }]
  };
  