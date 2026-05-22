import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import ElementPlus from 'element-plus'
import I18nDemo from '@/views/advanced/I18nDemo.vue'
import DragDropDemo from '@/views/advanced/DragDropDemo.vue'
import VirtualScrollDemo from '@/views/advanced/VirtualScrollDemo.vue'

describe('Mount Views Without Stubs', () => {
  const pinia = createPinia()
  const globalConfig = {
    plugins: [pinia, i18n, ElementPlus]
  }

  it('mounts I18nDemo successfully', () => {
    const wrapper = mount(I18nDemo, {
      global: globalConfig
    })
    expect(wrapper.exists()).toBe(true)
    console.log('I18nDemo html length:', wrapper.html().length)
  })

  it('mounts DragDropDemo successfully', () => {
    const wrapper = mount(DragDropDemo, {
      global: globalConfig
    })
    expect(wrapper.exists()).toBe(true)
    console.log('DragDropDemo html length:', wrapper.html().length)
  })

  it('mounts VirtualScrollDemo successfully', () => {
    const wrapper = mount(VirtualScrollDemo, {
      global: globalConfig
    })
    expect(wrapper.exists()).toBe(true)
    console.log('VirtualScrollDemo html length:', wrapper.html().length)
  })
})
