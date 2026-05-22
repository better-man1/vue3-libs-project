import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DemoCard from '@/components/common/DemoCard.vue'

describe('DemoCard.vue', () => {
  const globalConfig = {
    stubs: {
      ElCard: {
        template: '<div class="el-card"><div class="el-card__header"><slot name="header"></slot></div><div class="el-card__body"><slot></slot></div></div>'
      },
      ElButton: {
        template: '<button><slot /></button>'
      },
      ElIcon: {
        template: '<span><slot /></span>'
      }
    }
  }

  it('renders title and description when passed', () => {
    const title = '测试卡片标题'
    const description = '这是测试卡片的描述'
    const wrapper = mount(DemoCard, {
      props: { title, description },
      global: globalConfig
    })

    expect(wrapper.text()).toContain(title)
    expect(wrapper.text()).toContain(description)
  })

  it('toggles code preview visibility when click on show code button', async () => {
    const code = 'const a = 123;'
    const wrapper = mount(DemoCard, {
      props: { 
        title: '测试卡片',
        code 
      },
      global: globalConfig
    })

    // Code preview should not exist initially
    expect(wrapper.find('.code-preview-section').exists()).toBe(false)

    // Find the toggle button
    const btn = wrapper.find('.code-toggle-btn')
    expect(btn.exists()).toBe(true)
    
    // Click button to show code
    await btn.trigger('click')
    
    // Now it should show
    expect(wrapper.find('.code-preview-section').exists()).toBe(true)
    expect(wrapper.find('.code-preview-section pre code').text()).toBe(code)

    // Click again to hide
    await btn.trigger('click')
    expect(wrapper.find('.code-preview-section').exists()).toBe(false)
  })
})
