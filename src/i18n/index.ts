import { createI18n } from 'vue-i18n'

const messages = {
  'zh-CN': {
    nav: {
      home: '首页',
      dashboard: '看板',
      title: 'Vue 3 三方库实践游乐场'
    },
    demo: {
      i18nTitle: 'Vue 3 国际化多语言方案',
      i18nDesc: '通过 vue-i18n 实现整站多语言一键切换，完美适配表单字段、Element Plus 动态验证提示规则以及 Day.js 局部多语言格式。',
      langSwitch: '切换语言',
      currentLang: '当前系统语言',
      profileCard: '个人资料管理 (本地化实例)',
      username: '用户名',
      email: '电子邮箱',
      role: '工作角色',
      bio: '个人简介',
      newsletter: '订阅系统推送通知',
      submit: '保存更改',
      reset: '重置表单',
      successMsg: '个人资料保存成功！',
      validation: {
        usernameReq: '请输入用户名',
        usernameMin: '用户名长度不能少于 3 个字符',
        emailReq: '请输入电子邮箱',
        emailInvalid: '请输入合法的电子邮箱地址',
        roleReq: '请选择您的工作角色'
      },
      roles: {
        developer: '前端开发工程师',
        designer: 'UI/UX 设计师',
        manager: '产品经理'
      },
      placeholder: {
        username: '请输入您的用户名',
        email: "例如: example{'@'}domain.com",
        role: '请选择您的岗位',
        bio: '写点什么介绍一下自己...'
      },
      dateTimeTitle: '本地化日期时间展示',
      timeLabel: '当前时间',
      dateLong: '长日期格式',
      relativeTime: '相对时间'
    }
  },
  'en-US': {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      title: 'Vue 3 Library Playground'
    },
    demo: {
      i18nTitle: 'Vue 3 Internationalization (i18n)',
      i18nDesc: 'Implement system-wide translation switching via vue-i18n, supporting forms, Element Plus validation messages, and localized Day.js display.',
      langSwitch: 'Switch Language',
      currentLang: 'Current Language',
      profileCard: 'Profile Management (Localized Demo)',
      username: 'Username',
      email: 'Email Address',
      role: 'Job Role',
      bio: 'Biography',
      newsletter: 'Subscribe to newsletter notifications',
      submit: 'Save Changes',
      reset: 'Reset Form',
      successMsg: 'Profile saved successfully!',
      validation: {
        usernameReq: 'Username is required',
        usernameMin: 'Username must be at least 3 characters',
        emailReq: 'Email address is required',
        emailInvalid: 'Please input a valid email address',
        roleReq: 'Please select your job role'
      },
      roles: {
        developer: 'Frontend Developer',
        designer: 'UI/UX Designer',
        manager: 'Product Manager'
      },
      placeholder: {
        username: 'Please input your username',
        email: "e.g. example{'@'}domain.com",
        role: 'Please select your role',
        bio: 'Write something about yourself...'
      },
      dateTimeTitle: 'Localized Date & Time Display',
      timeLabel: 'Current Time',
      dateLong: 'Long Date Format',
      relativeTime: 'Relative Time'
    }
  }
}

const i18n = createI18n({
  legacy: false, // Must set false to support Composition API
  locale: 'zh-CN', // Default locale
  fallbackLocale: 'en-US',
  messages
})

export default i18n
