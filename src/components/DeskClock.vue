<template>
  <div class="clock-container">
    <!-- 日期显示 -->
    <div class="date-display">{{ dateStr }}</div>

    <!-- 时间显示 -->
    <div class="time-wrapper">
      <span class="digit">{{ timeObj.h }}</span>
      <span class="colon" :class="{ blink: tick }">:</span>
      <span class="digit">{{ timeObj.m }}</span>
      <span class="colon small" :class="{ blink: tick }">:</span>
      <span class="digit small">{{ timeObj.s }}</span>
    </div>

    <!-- 装饰性文字 -->
    <div class="label">FLOW SPACE SYSTEM</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const timeObj = ref({ h: '00', m: '00', s: '00' })
const dateStr = ref('')
const tick = ref(false) // 用于控制冒号闪烁
let timer: any = null

const updateTime = () => {
  const now = new Date()

  // 更新时间
  timeObj.value = {
    h: String(now.getHours()).padStart(2, '0'),
    m: String(now.getMinutes()).padStart(2, '0'),
    s: String(now.getSeconds()).padStart(2, '0'),
  }

  // 更新日期 (例如: 2023-10-27 FRI)
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const day = days[now.getDay()]
  dateStr.value = `${y}-${m}-${d} ${day}`

  // 冒号闪烁逻辑
  tick.value = !tick.value
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 10px;

  /* background: transparent;
  backdrop-filter: none;
  border: var(--panel-border);
  box-shadow: var(--clock-shadow, 0 0 20px rgba(0, 0, 0, 0.5)); */

  /* 🔥🔥🔥 核心修改：全部设为透明/无，由父级统一控制 🔥🔥🔥 */
  background: transparent;
  backdrop-filter: none;
  border: none;
  box-shadow: none;

  border-radius: var(--border-radius); /* 🔥 */
  font-family: inherit;
  color: var(--text-color); /* 🔥 */
  user-select: none;
}

.date-display {
  font-size: 20px;
  opacity: 0.8;
  letter-spacing: 2px;
  margin-bottom: 5px;
  margin-top: 5px;
  margin-left: 40px;
  margin-right: 40px;
}

.time-wrapper {
  display: flex;
  align-items: baseline;
  line-height: 1;
  /* 简单的发光效果，可以使用 accent-color */
  text-shadow: 0 0 10px var(--accent-color); /* 🔥 */
}

.digit {
  font-size: 60px;
  font-weight: bold;
}
.digit.small {
  font-size: 40px;
  opacity: 0.8;
}
.colon {
  font-size: 50px;
  margin: 0 10px;
  position: relative;
  top: -5px;
}
.colon.small {
  font-size: 30px;
}
.blink {
  opacity: 0.3;
}

.label {
  margin-top: 5px;
  font-size: 12px;
  opacity: 0.6;
  letter-spacing: 4px;
}
</style>
