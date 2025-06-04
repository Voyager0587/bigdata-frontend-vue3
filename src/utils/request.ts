import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    // 例如：添加token
    // if (store.getters.token) {
    //   config.headers['Authorization'] = `Bearer ${store.getters.token}`
    // }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 根据API约定，code为200表示成功
    if (res.code === 200) {
      return res
    } else {
      // 处理业务错误
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    // 处理HTTP错误
    console.error('响应错误：', error)
    const message = error.response?.data?.message || error.message || '网络错误'
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 