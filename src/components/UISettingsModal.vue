<template>
  <el-dialog :model-value="visible" title="界面个性化设置" width="400px" center :before-close="handleClose"
    class="ui-settings-dialog">
    <div class="settings-container">
      <!-- 1. 缩放设置 -->
      <div class="group-title">尺寸与缩放</div>
      <div class="setting-item">
        <span class="label">整体 UI 缩放</span>
        <el-slider v-model="settings.scale" :min="0.5" :max="1.5" :step="0.05" :format-tooltip="(v: number) => `x${v}`"
          @input="emitChange" />
      </div>
      <div class="setting-item">
        <span class="label">桌面时钟大小</span>
        <el-slider v-model="settings.clockScale" :min="0.5" :max="3.0" :step="0.05"
          :format-tooltip="(v: number) => `x${v}`" @input="emitChange" />
      </div>

      <!-- 2. 面板样式设置 -->
      <div class="group-title">面板风格</div>

      <div class="setting-item switch-item">
        <span class="label">显示面板背景与边框</span>
        <el-switch v-model="settings.showPanel" @change="emitChange" />
      </div>

      <!-- 只有开启面板显示时，才显示以下选项 -->
      <template v-if="settings.showPanel">
        <div class="setting-item">
          <span class="label">面板底色不透明度</span>
          <el-slider v-model="settings.panelBgOpacity" :min="0" :max="1" :step="0.05"
            :format-tooltip="(v: number) => `${Math.round(v * 100)}%`" @input="emitChange" />
        </div>
        <div class="setting-item">
          <span class="label">面板边框发光</span>
          <el-slider v-model="settings.panelBorderGlow" :min="0" :max="20" @input="emitChange" />
        </div>
      </template>

      <!-- 3. 全局透明度与发光 -->
      <div class="group-title">全局效果</div>
      <div class="setting-item">
        <span class="label">整体透明度 (淡出效果)</span>
        <el-slider v-model="settings.opacity" :min="0" :max="1" :step="0.05"
          :format-tooltip="(v: number) => `${Math.round(v * 100)}%`" @input="emitChange" />
      </div>
      <div class="setting-item">
        <span class="label">文字/图标发光强度</span>
        <el-slider v-model="settings.textGlow" :min="0" :max="30" @input="emitChange" />
      </div>

      <!-- 🔥🔥🔥 4. 新增：数据管理区域 🔥🔥🔥 -->
      <div class="group-title" style="
          margin-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 10px;
        ">
        数据存档管理
      </div>
      <div class="data-actions">
        <button class="action-btn export-btn" @click="handleExport">
          📤 导出存档 (备份)
        </button>

        <div class="upload-wrapper" style="width: 100%">
          <button class="action-btn import-btn" @click="triggerFileInput">
            📥 导入存档 (恢复)
          </button>
          <!-- 隐藏的文件输入框 -->
          <input type="file" ref="fileInput" accept=".json" style="display: none" @change="handleImport" />
        </div>

        <button class="action-btn reset-danger-btn" @click="handleResetAll">
          ⚠️ 重置所有数据 (慎用)
        </button>
      </div>

      <div class="reset-btn" @click="resetSettings">恢复默认界面设置</div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义接口
export interface UISettings {
  scale: number
  clockScale: number
  opacity: number
  textGlow: number
  showPanel: boolean
  panelBgOpacity: number
  panelBorderGlow: number
}

const props = defineProps<{
  visible: boolean
  initialSettings: UISettings
}>()

const emit = defineEmits(['update:visible', 'change', 'save'])

const settings = reactive<UISettings>({ ...props.initialSettings })
const fileInput = ref<HTMLInputElement | null>(null)

// 监听外部传入的设置变化
watch(
  () => props.initialSettings,
  (newVal) => {
    Object.assign(settings, newVal)
  },
  { deep: true }
)

const emitChange = () => {
  emit('change', { ...settings })
}

const handleClose = () => {
  emit('save', { ...settings })
  emit('update:visible', false)
}

const resetSettings = () => {
  const defaults: UISettings = {
    scale: 1.0,
    clockScale: 1.0,
    opacity: 0.9,
    textGlow: 7,
    showPanel: true,
    panelBgOpacity: 0.3,
    panelBorderGlow: 8,
  }
  Object.assign(settings, defaults)
  emitChange()
}

// --- 🔥🔥🔥 新增：存档管理逻辑 🔥🔥🔥 ---

// 1. 导出存档
const handleExport = () => {
  // 收集所有 localStorage 中的关键数据
  const data = {
    coins: localStorage.getItem('flow-coins'),
    items: localStorage.getItem('flow-items-state'),
    bg: localStorage.getItem('flow-current-bg'),
    theme: localStorage.getItem('flow-current-theme-id'),
    font: localStorage.getItem('flow-current-font-id'),
    ui: localStorage.getItem('flow-ui-settings'),
    pet: localStorage.getItem('flow-pet-settings'),
    history: localStorage.getItem('flow-focus-history'),
    autoBg: localStorage.getItem('flow-auto-bg'),
  }

  // 生成 JSON 文件并下载
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flow-space-save-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('存档已导出！请妥善保管 json 文件')
}

// 2. 触发导入
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 3. 处理导入文件
const handleImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)

      // 🔥 定义一个辅助函数：如果有值就覆盖，如果没值(null/undefined)就删除旧数据(恢复默认)
      const restore = (key: string, value: any) => {
        if (value !== undefined && value !== null) {
          // 即使是 0 或 "" 也要写入
          localStorage.setItem(key, String(value))
        } else {
          // 存档里没有这个值，说明是初始状态，删除本地旧数据
          localStorage.removeItem(key)
        }
      }

      // 🔥 逐个恢复，不再使用 if (data.xxx) 判断
      restore('flow-coins', data.coins)
      restore('flow-items-state', data.items)
      restore('flow-current-bg', data.bg)
      restore('flow-current-theme-id', data.theme)
      restore('flow-current-font-id', data.font)
      restore('flow-ui-settings', data.ui)
      restore('flow-pet-settings', data.pet)
      restore('flow-focus-history', data.history)
      restore('flow-auto-bg', data.autoBg)

      ElMessage.success('存档读取成功！页面即将刷新...')
      // 延迟刷新以应用更改
      setTimeout(() => location.reload(), 1000)
    } catch (err) {
      console.error(err)
      ElMessage.error('存档文件损坏或格式错误！')
    }
    // 清空 input 防止无法重复导入同名文件
    if (fileInput.value) fileInput.value.value = ''
  }
  reader.readAsText(file)
}

// 4. 重置所有数据
const handleResetAll = () => {
  ElMessageBox.confirm(
    '确定要删除所有进度（金币、解锁物品、桌宠、历史记录）吗？此操作无法撤销！',
    '危险操作警告',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'error',
    }
  )
    .then(() => {
      localStorage.clear()
      location.reload()
    })
    .catch(() => { })
}
</script>

<style scoped>
.settings-container {
  padding: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.group-title {
  font-size: 12px;
  color: var(--accent-color);
  margin: 15px 0 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 2px;
}

.setting-item {
  margin-bottom: 15px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--text-color);
  font-family: inherit;
  font-size: 14px;
}

/* 恢复默认按钮 */
.reset-btn {
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border: 1px solid var(--text-color);
  border-radius: 4px;
  color: var(--text-color);
  opacity: 0.7;
  transition: 0.2s;
  font-family: inherit;
  margin-top: 30px;
  font-size: 12px;
}

.reset-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* 🔥 新增：数据管理按钮样式 */
.data-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.action-btn {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
  transition: 0.2s;
  border: 1px solid var(--text-color);
  background: transparent;
  color: var(--text-color);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

/* 危险按钮样式 */
.reset-danger-btn {
  border-color: #f56c6c;
  color: #f56c6c;
  margin-top: 10px;
  opacity: 0.8;
}

.reset-danger-btn:hover {
  background: #f56c6c;
  color: #fff;
  opacity: 1;
}

:deep(.el-slider__bar) {
  background-color: var(--accent-color);
}

:deep(.el-slider__button) {
  border-color: var(--accent-color);
}

:deep(.el-switch__core) {
  border-color: var(--text-color);
  background: transparent;
}

:deep(.el-switch.is-checked .el-switch__core) {
  border-color: var(--accent-color);
  background: var(--accent-color);
}
</style>

<style>
.el-dialog.ui-settings-dialog {
  background: var(--panel-bg) !important;
  border: var(--panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
}

.ui-settings-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
}

.ui-settings-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--text-color) !important;
}
</style>
