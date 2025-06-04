// 按需引入ECharts组件
import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  MapChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
  BoxplotChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  GeoComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  MapChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
  BoxplotChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  GeoComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

// 导出echarts实例
export default echarts 