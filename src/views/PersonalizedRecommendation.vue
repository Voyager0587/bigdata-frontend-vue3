<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

interface Education {
  degree: string
  major: string
  school: string
  graduation_year: number
}

interface Experience {
  company: string
  title: string
  duration: string
  responsibilities: string[]
}

interface Project {
  name: string
  description: string
}

interface Preference {
  desired_industries: string[]
  desired_locations: string[]
  expected_salary: string
  position_type: string
  career_goals: string
}

interface FormData {
  name: string
  age: number
  gender: string
  email: string
  phone: string
  location: string
  education: Education
  skills: string[]
  certifications: string[]
  experience: Experience[]
  projects: Project[]
  languages: string[]
  preference: Preference
}

const formData = ref<FormData>({
  name: '',
  age: 28,
  gender: '男',
  email: '',
  phone: '',
  location: '',
  education: {
    degree: '',
    major: '',
    school: '',
    graduation_year: new Date().getFullYear()
  },
  skills: [],
  certifications: [],
  experience: [],
  projects: [],
  languages: [],
  preference: {
    desired_industries: [],
    desired_locations: [],
    expected_salary: '',
    position_type: '',
    career_goals: ''
  }
})

const recommendationResult = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  try {
    loading.value = true
    const response = await axios.post('http://localhost:5010/recommend', formData.value)
    recommendationResult.value = response.data
  } catch (error) {
    ElMessage.error('获取推荐失败，请稍后重试')
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const addExperience = () => {
  formData.value.experience.push({
    company: '',
    title: '',
    duration: '',
    responsibilities: ['']
  })
}

const removeExperience = (index: number) => {
  formData.value.experience.splice(index, 1)
}

const addProject = () => {
  formData.value.projects.push({
    name: '',
    description: ''
  })
}

const removeProject = (index: number) => {
  formData.value.projects.splice(index, 1)
}

const addResponsibility = (expIndex: number) => {
  formData.value.experience[expIndex].responsibilities.push('')
}

const removeResponsibility = (expIndex: number, respIndex: number) => {
  formData.value.experience[expIndex].responsibilities.splice(respIndex, 1)
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">个性化职位推荐</h1>
    
    <el-form :model="formData" label-width="120px" class="max-w-4xl">
      <!-- 基本信息 -->
      <el-card class="mb-6">
        <template #header>
          <div class="font-bold">基本信息</div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="姓名">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="年龄">
              <el-input-number v-model="formData.age" :min="18" :max="65" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别">
              <el-select v-model="formData.gender" class="w-full">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="formData.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="formData.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="所在地">
          <el-input v-model="formData.location" />
        </el-form-item>
      </el-card>
      
      <!-- 教育背景 -->
      <el-card class="mb-6">
        <template #header>
          <div class="font-bold">教育背景</div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="学历">
              <el-input v-model="formData.education.degree" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="专业">
              <el-input v-model="formData.education.major" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="毕业年份">
              <el-input-number v-model="formData.education.graduation_year" :min="2000" :max="2024" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="学校">
          <el-input v-model="formData.education.school" />
        </el-form-item>
      </el-card>
      
      <!-- 技能与证书 -->
      <el-card class="mb-6">
        <template #header>
          <div class="font-bold">技能与证书</div>
        </template>
        
        <el-form-item label="技能">
          <el-select
            v-model="formData.skills"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入技能"
            class="w-full"
          >
            <el-option
              v-for="skill in ['Python', 'SQL', 'Pandas', '机器学习', '深度学习', 'NLP', '数据可视化', 'Tableau', 'Linux', 'Docker']"
              :key="skill"
              :label="skill"
              :value="skill"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="证书">
          <el-select
            v-model="formData.certifications"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入证书"
            class="w-full"
          >
            <el-option
              v-for="cert in ['阿里云大数据分析师认证', 'Google Data Analytics Certificate']"
              :key="cert"
              :label="cert"
              :value="cert"
            />
          </el-select>
        </el-form-item>
      </el-card>
      
      <!-- 工作经验 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold">工作经验</span>
            <el-button type="primary" @click="addExperience">添加经历</el-button>
          </div>
        </template>
        
        <div v-for="(exp, index) in formData.experience" :key="index" class="mb-6 p-4 border rounded">
          <div class="flex justify-between mb-4">
            <h3 class="text-lg font-medium">工作经历 {{ index + 1 }}</h3>
            <el-button type="danger" @click="removeExperience(index)">删除</el-button>
          </div>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="公司">
                <el-input v-model="exp.company" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职位">
                <el-input v-model="exp.title" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="时间段">
            <el-input v-model="exp.duration" />
          </el-form-item>
          
          <el-form-item label="工作职责">
            <div v-for="(resp, respIndex) in exp.responsibilities" :key="respIndex" class="mb-2">
              <div class="flex gap-2">
                <el-input v-model="exp.responsibilities[respIndex]" />
                <el-button type="danger" @click="removeResponsibility(index, respIndex)">删除</el-button>
              </div>
            </div>
            <el-button type="primary" @click="addResponsibility(index)">添加职责</el-button>
          </el-form-item>
        </div>
      </el-card>
      
      <!-- 项目经历 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold">项目经历</span>
            <el-button type="primary" @click="addProject">添加项目</el-button>
          </div>
        </template>
        
        <div v-for="(project, index) in formData.projects" :key="index" class="mb-6 p-4 border rounded">
          <div class="flex justify-between mb-4">
            <h3 class="text-lg font-medium">项目 {{ index + 1 }}</h3>
            <el-button type="danger" @click="removeProject(index)">删除</el-button>
          </div>
          
          <el-form-item label="项目名称">
            <el-input v-model="project.name" />
          </el-form-item>
          
          <el-form-item label="项目描述">
            <el-input
              v-model="project.description"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </div>
      </el-card>
      
      <!-- 语言能力 -->
      <el-card class="mb-6">
        <template #header>
          <div class="font-bold">语言能力</div>
        </template>
        
        <el-form-item label="语言">
          <el-select
            v-model="formData.languages"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入语言能力"
            class="w-full"
          >
            <el-option
              v-for="lang in ['普通话（母语）', '英语（CET-6，能流利阅读英文技术文档）']"
              :key="lang"
              :label="lang"
              :value="lang"
            />
          </el-select>
        </el-form-item>
      </el-card>
      
      <!-- 求职偏好 -->
      <el-card class="mb-6">
        <template #header>
          <div class="font-bold">求职偏好</div>
        </template>
        
        <el-form-item label="期望行业">
          <el-select
            v-model="formData.preference.desired_industries"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入期望行业"
            class="w-full"
          >
            <el-option
              v-for="industry in ['人工智能', '大数据', '互联网']"
              :key="industry"
              :label="industry"
              :value="industry"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="期望城市">
          <el-select
            v-model="formData.preference.desired_locations"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入期望城市"
            class="w-full"
          >
            <el-option
              v-for="city in ['上海', '杭州']"
              :key="city"
              :label="city"
              :value="city"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="期望薪资">
          <el-input v-model="formData.preference.expected_salary" />
        </el-form-item>
        
        <el-form-item label="职位类型">
          <el-input v-model="formData.preference.position_type" />
        </el-form-item>
        
        <el-form-item label="职业目标">
          <el-input
            v-model="formData.preference.career_goals"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-card>
      
      <div class="flex justify-center">
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleSubmit"
        >
          获取推荐
        </el-button>
      </div>
    </el-form>
    
    <!-- 推荐结果 -->
    <el-card v-if="recommendationResult" class="mt-6">
      <template #header>
        <div class="font-bold">推荐结果</div>
      </template>
      
      <div class="whitespace-pre-wrap">{{ recommendationResult }}</div>
    </el-card>
  </div>
</template>

<style scoped>
.el-card {
  margin-bottom: 20px;
}

.el-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
}
</style> 