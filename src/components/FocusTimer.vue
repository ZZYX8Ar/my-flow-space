<template>
  <div class="timer-card">
    <!-- 顶部功能栏 -->
    <div class="card-header">
      <span class="card-label">FOCUS TIMER</span>
      <el-tooltip content="设置时长 (T)" placement="top">
        <div class="icon-btn setting-btn" @click="openSetting">
          <el-icon><Setting /></el-icon>
        </div>
      </el-tooltip>
    </div>

    <!-- 中间时间显示 -->
    <div class="time-display" @click="openSetting">
      {{ format(remainingSeconds) }}
    </div>

    <!-- 底部控制按钮 -->
    <div class="control-area">
      <div
        class="main-btn"
        :class="{ 'is-running': isRunning }"
        @click="toggleTimer"
      >
        <el-icon size="28" v-if="!isRunning"><VideoPlay /></el-icon>
        <el-icon size="28" v-else class="spinning"><Loading /></el-icon>
        <span class="btn-text">{{ isRunning ? 'PAUSE' : 'START' }}</span>
      </div>
    </div>

    <!-- 设置弹窗 (保持逻辑不变，只改样式) -->
    <el-dialog
      v-model="settingVisible"
      title="设置专注时长 (分钟)"
      class="focus-settings-dialog"
      :append-to-body="true"
      center
    >
      <div class="setting-content">
        <el-input-number
          v-model="customMinutes"
          :min="1"
          :max="999"
          label="分钟"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingVisible = false" class="cancel-btn"
            >取消</el-button
          >
          <el-button type="primary" @click="confirmTime" class="confirm-btn"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Setting, VideoPlay, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['finish'])
const STORAGE_KEY = 'flow-focus-minutes'
const HISTORY_KEY = 'flow-focus-history'

const settingVisible = ref(false)
const customMinutes = ref(25)
const remainingSeconds = ref(25 * 60)
const isRunning = ref(false)
const sessionDuration = ref(0)

// 🔥 1. 新增：定义闹钟音效 (确保文件存在于 public/sounds/alarm.mp3)
//const alarmAudio = new Audio('public/music/alarm.mp3')

// 🔥🔥🔥 修改为：使用在线链接 (这是一个清脆的提示音) 🔥🔥🔥
const alarmAudio = new Audio(
  'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
)

let timerInterval: any = null

onMounted(() => {
  const savedMinutes = localStorage.getItem(STORAGE_KEY)
  if (savedMinutes) {
    const mins = parseInt(savedMinutes)
    if (!isNaN(mins) && mins > 0) {
      customMinutes.value = mins
      remainingSeconds.value = mins * 60
    }
  }
})

const format = (s: number) => {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

const openSetting = () => {
  if (isRunning.value) {
    ElMessage.warning('请先暂停计时器')
    return
  }
  customMinutes.value = Math.ceil(remainingSeconds.value / 60)
  settingVisible.value = true
}

const confirmTime = () => {
  remainingSeconds.value = customMinutes.value * 60
  localStorage.setItem(STORAGE_KEY, customMinutes.value.toString())
  settingVisible.value = false
  ElMessage.success(`已设置为 ${customMinutes.value} 分钟`)
}

const saveHistory = (minutes: number) => {
  const historyStr = localStorage.getItem(HISTORY_KEY)
  let history = historyStr ? JSON.parse(historyStr) : []
  const today = new Date().toISOString().split('T')[0]
  history.push({ date: today, minutes: minutes, timestamp: Date.now() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval)
    isRunning.value = false
  } else {
    if (
      sessionDuration.value === 0 ||
      remainingSeconds.value === customMinutes.value * 60
    ) {
      sessionDuration.value = remainingSeconds.value
    }
    isRunning.value = true
    timerInterval = setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value--
      } else {
        clearInterval(timerInterval)
        isRunning.value = false
        // 🔥 2. 新增：播放音效
        alarmAudio
          .play()
          .catch((e) => console.warn('播放闹钟失败，可能需要用户交互', e))
        if (Notification.permission === 'granted')
          new Notification('专注完成！')
        const minutesEarned = Math.floor(sessionDuration.value / 60)
        if (minutesEarned > 0) saveHistory(minutesEarned)
        emit('finish', minutesEarned)
        /* alert('专注完成！休息一下吧。') */
        remainingSeconds.value = customMinutes.value * 60
        sessionDuration.value = 0
      }
    }, 1000)
  }
}

defineExpose({ openSetting })
</script>

<style scoped>
/* 卡片容器 */
.timer-card {
  width: 220px;
  background: var(--panel-bg); /* 跟随主题 */
  backdrop-filter: blur(8px);
  border: var(--panel-border);
  border-radius: var(--border-radius);
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  color: var(--text-color);
  font-family: inherit;
  transition: transform 0.2s;
}

.timer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

/* 顶部栏 */
.card-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 5px;
}

.card-label {
  font-size: 12px;
  opacity: 0.7;
  letter-spacing: 2px;
  font-weight: bold;
}

.icon-btn {
  cursor: pointer;
  opacity: 0.6;
  transition: 0.2s;
  font-size: 18px;
}
.icon-btn:hover {
  opacity: 1;
  color: var(--accent-color);
  transform: rotate(90deg);
}

/* 时间显示 */
.time-display {
  font-size: 50px;
  font-weight: bold;
  line-height: 1;
  margin: 10px 0 20px 0;
  cursor: pointer;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3); /* 基础发光 */
  transition: 0.3s;
}
.time-display:hover {
  color: var(--accent-color);
  text-shadow: 0 0 20px var(--accent-color); /* 悬停强发光 */
}

/* 底部按钮 */
.main-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 25px;
  border-radius: 30px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.main-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.main-btn.is-running {
  background: rgba(255, 255, 255, 0.05);
  opacity: 0.8;
}

.btn-text {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
}

.spinning {
  animation: spin 2s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* 全局样式覆盖 (弹窗) */
.setting-content {
  text-align: center;
  padding: 10px;
}
</style>

<style>
/* 弹窗样式覆盖 (保持不变) */
.el-dialog.focus-settings-dialog {
  background: var(--panel-bg) !important;
  border: var(--panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
  width: 300px;
}
.focus-settings-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
  font-weight: bold;
}
.focus-settings-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--text-color) !important;
}
.focus-settings-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: var(--accent-color) !important;
}
.focus-settings-dialog .el-input-number {
  width: 100%;
}
.focus-settings-dialog .el-input-number__decrease {
  background: transparent !important;
  border-right: 1px solid var(--text-color) !important;
  color: var(--text-color) !important;
}
.focus-settings-dialog .el-input-number__increase {
  background: transparent !important;
  border-left: 1px solid var(--text-color) !important;
  color: var(--text-color) !important;
}
.focus-settings-dialog .el-input-number__decrease:hover,
.focus-settings-dialog .el-input-number__increase:hover {
  color: var(--accent-color) !important;
}
.focus-settings-dialog .el-input__wrapper {
  background: transparent !important;
  box-shadow: 0 0 0 1px var(--text-color) inset !important;
}
.focus-settings-dialog .el-input__inner {
  color: var(--text-color) !important;
  font-family: inherit;
  font-weight: bold;
}
.focus-settings-dialog .cancel-btn {
  background: transparent !important;
  border: 1px solid var(--text-color) !important;
  color: var(--text-color) !important;
}
.focus-settings-dialog .cancel-btn:hover {
  opacity: 0.8;
}
.focus-settings-dialog .confirm-btn {
  background: var(--accent-color) !important;
  border: 1px solid var(--accent-color) !important;
  color: #000 !important;
  font-weight: bold;
}
.focus-settings-dialog .confirm-btn:hover {
  opacity: 0.9;
  transform: scale(1.05);
}
</style>
