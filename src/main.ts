import { createApp } from 'vue'
// 引入 Element Plus
import ElementPlus from 'element-plus'
// 引入 Element Plus 的样式文件 (没这个样式会乱)
import 'element-plus/dist/index.css'
// 引入图标库 (为了防止其他地方图标报错)
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'

const app = createApp(App)

// 1. 使用 Element Plus
app.use(ElementPlus)

// 2. 全局注册所有图标 (这样你在任何地方用图标都不用单独引入了)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
