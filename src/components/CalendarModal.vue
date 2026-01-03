<template>
  <el-dialog
    :model-value="visible"
    title="专注日历"
    width="500px"
    center
    :before-close="handleClose"
    class="calendar-dialog"
    @opened="initData"
  >
    <div class="calendar-container">
      <!-- 头部 -->
      <div class="calendar-header">
        <div class="nav-btn" @click="changeMonth(-1)">◀</div>
        <div class="current-month">{{ year }}年 {{ month + 1 }}月</div>
        <div class="nav-btn" @click="changeMonth(1)">▶</div>
      </div>

      <!-- 星期 -->
      <div class="weekdays-row">
        <span
          v-for="d in ['日', '一', '二', '三', '四', '五', '六']"
          :key="d"
          >{{ d }}</span
        >
      </div>

      <!-- 网格 -->
      <div class="days-grid">
        <div
          v-for="n in startDayOfWeek"
          :key="'empty-' + n"
          class="day-cell empty"
        ></div>
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="day-cell"
          :class="{
            'is-today': isToday(day),
            'has-data': getFocusMinutes(day) > 0,
          }"
          :style="getDayStyle(day)"
          @click="showDayDetail(day)"
        >
          <span class="day-num">{{ day }}</span>
          <div v-if="getFocusMinutes(day) > 0" class="focus-dot"></div>
        </div>
      </div>

      <!-- 底部详情 -->
      <div class="day-detail" v-if="selectedDayInfo">
        <div class="detail-header">
          <span class="detail-date">{{ selectedDayInfo.dateStr }}</span>
          <span class="detail-coins" v-if="selectedDayInfo.minutes > 0">
            +{{ selectedDayInfo.minutes }} 💰
          </span>
        </div>

        <div class="detail-section">
          <div class="section-label">专注时长</div>
          <div class="detail-time">
            {{ selectedDayInfo.minutes }} <span class="unit">分钟</span>
          </div>
        </div>

        <!-- 🔥 新增：当日完成的任务 🔥 -->
        <div class="detail-section">
          <div class="section-label">
            完成任务 ({{ selectedDayInfo.todos.length }})
          </div>
          <ul class="history-todo-list" v-if="selectedDayInfo.todos.length > 0">
            <li
              v-for="todo in selectedDayInfo.todos"
              :key="todo.id"
              class="history-todo-item"
            >
              <span class="check">✔</span> {{ todo.text }}
            </li>
          </ul>
          <div v-else class="empty-text">无完成任务</div>
        </div>
      </div>
      <div class="day-detail empty-tip" v-else>点击日期查看详细记录</div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['update:visible'])

const FOCUS_KEY = 'flow-focus-history'
const TODO_KEY = 'flow-todos-history' // 🔥 对应 TodoList 里的 Key

const focusHistory = ref<Record<string, number>>({})
const todoHistory = ref<any[]>([]) // 存储所有历史任务

const currentDate = ref(new Date())
const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())
const selectedDayInfo = ref<any>(null)

const daysInMonth = computed(() =>
  new Date(year.value, month.value + 1, 0).getDate()
)
const startDayOfWeek = computed(() =>
  new Date(year.value, month.value, 1).getDay()
)

// --- 数据加载 ---
const initData = () => {
  loadFocusHistory()
  loadTodoHistory()
}

const loadFocusHistory = () => {
  const saved = localStorage.getItem(FOCUS_KEY)
  if (saved) {
    const list = JSON.parse(saved)
    const map: Record<string, number> = {}
    list.forEach((item: any) => {
      map[item.date] = (map[item.date] || 0) + item.minutes
    })
    focusHistory.value = map
  }
}

// 🔥 加载任务历史
const loadTodoHistory = () => {
  const saved = localStorage.getItem(TODO_KEY)
  if (saved) {
    todoHistory.value = JSON.parse(saved)
  }
}

// --- 逻辑 ---
const changeMonth = (delta: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
  selectedDayInfo.value = null
}

const getDateKey = (day: number) => {
  const y = year.value
  const m = String(month.value + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getFocusMinutes = (day: number) => {
  return focusHistory.value[getDateKey(day)] || 0
}

const isToday = (day: number) => {
  const today = new Date()
  return (
    today.getDate() === day &&
    today.getMonth() === month.value &&
    today.getFullYear() === year.value
  )
}

const getDayStyle = (day: number) => {
  const mins = getFocusMinutes(day)
  if (mins <= 0) return {}
  const opacity = Math.min(mins / 60, 1) * 0.8 + 0.2
  return {
    background: `rgba(var(--panel-rgb), ${opacity})`,
    color: 'var(--accent-color)',
    borderColor: 'var(--accent-color)',
    boxShadow: `0 0 5px var(--accent-color)`,
  }
}

// 🔥 显示详情
const showDayDetail = (day: number) => {
  const dateStr = getDateKey(day)

  // 筛选当天的任务
  const dayTodos = todoHistory.value.filter((t) => t.completedDate === dateStr)

  selectedDayInfo.value = {
    dateStr,
    minutes: getFocusMinutes(day),
    todos: dayTodos, // 传递给模板
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.calendar-container {
  padding: 10px;
  color: var(--text-color);
  font-family: inherit;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: bold;
}
.nav-btn {
  cursor: pointer;
  padding: 5px 15px;
  opacity: 0.7;
  transition: 0.2s;
}
.nav-btn:hover {
  color: var(--accent-color);
  transform: scale(1.2);
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 10px;
  opacity: 0.6;
  font-size: 14px;
}
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.05);
}
.day-cell:hover {
  border-color: var(--text-color);
  transform: translateY(-2px);
}
.day-cell.is-today {
  border: 1px dashed var(--text-color);
}
.day-cell.has-data {
  font-weight: bold;
}
.focus-dot {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--accent-color);
  box-shadow: 0 0 4px var(--accent-color);
}

/* 详情面板样式优化 */
.day-detail {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  min-height: 120px;
}
.empty-tip {
  text-align: center;
  opacity: 0.5;
  font-style: italic;
  line-height: 120px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.detail-date {
  font-size: 18px;
  font-weight: bold;
}
.detail-coins {
  color: #ffd04b;
  font-weight: bold;
}

.detail-section {
  margin-bottom: 15px;
}
.section-label {
  font-size: 12px;
  opacity: 0.6;
  margin-bottom: 5px;
}
.detail-time {
  font-size: 24px;
  font-weight: bold;
  color: var(--accent-color);
}
.unit {
  font-size: 14px;
  color: var(--text-color);
  font-weight: normal;
}

/* 历史任务列表 */
.history-todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 100px;
  overflow-y: auto;
}
.history-todo-item {
  font-size: 14px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.history-todo-item .check {
  color: var(--accent-color);
}
.empty-text {
  font-size: 12px;
  opacity: 0.4;
}
</style>

<style>
.calendar-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
}
</style>
