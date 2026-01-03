<template>
  <el-dialog
    :model-value="visible"
    title="专注排行榜"
    width="500px"
    center
    :before-close="handleClose"
    class="ranking-dialog"
    @opened="fetchData"
  >
    <div class="ranking-container">
      <!-- 顶部切换 -->
      <div class="rank-tabs">
        <div
          class="rank-tab"
          :class="{ active: currentTab === 'total_minutes' }"
          @click="switchTab('total_minutes')"
        >
          ⏱️ 时长榜
        </div>
        <div
          class="rank-tab"
          :class="{ active: currentTab === 'total_days' }"
          @click="switchTab('total_days')"
        >
          📅 毅力榜
        </div>
      </div>

      <!-- 列表 -->
      <div class="rank-list" v-loading="loading">
        <div class="rank-header-row">
          <span class="col-rank">排名</span>
          <span class="col-user">玩家</span>
          <span class="col-score">{{
            currentTab === 'total_minutes' ? '时长 (分)' : '天数 (天)'
          }}</span>
        </div>

        <div
          v-for="(item, index) in list"
          :key="item.user_id"
          class="rank-item"
          :class="{ 'is-me': item.user_id === myUserId }"
        >
          <div class="col-rank">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="col-user">
            <!-- 显示桌宠头像 -->
            <img
              :src="`/pet/${item.avatar}_idle.gif`"
              class="rank-avatar"
              onerror="this.style.display='none'"
            />
            {{ item.username }}
          </div>
          <div class="col-score highlight">
            {{
              currentTab === 'total_minutes'
                ? item.total_minutes
                : item.total_days
            }}
          </div>
        </div>

        <div v-if="list.length === 0 && !loading" class="empty-tip">
          暂无数据，快去专注吧！
        </div>
      </div>

      <!-- 底部：修改名字 -->
      <div class="my-info">
        <el-input
          v-model="myNewName"
          placeholder="输入你的昵称"
          size="small"
          style="width: 150px; margin-right: 10px"
        />
        <button class="action-btn" @click="updateMyName">更新昵称并上传</button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getRankings, uploadScore, getUserId } from '../utils/supabase'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  currentStats: { minutes: number; days: number; petId: string } // 从 App 传入当前数据
}>()

const emit = defineEmits(['update:visible'])

const currentTab = ref<'total_minutes' | 'total_days'>('total_minutes')
const list = ref<any[]>([])
const loading = ref(false)
const myUserId = getUserId()
const myNewName = ref(localStorage.getItem('flow-username') || '')

const handleClose = () => emit('update:visible', false)

const switchTab = (tab: 'total_minutes' | 'total_days') => {
  currentTab.value = tab
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  list.value = await getRankings(currentTab.value)
  loading.value = false
}

const updateMyName = async () => {
  if (!myNewName.value.trim()) return ElMessage.warning('昵称不能为空')

  localStorage.setItem('flow-username', myNewName.value)

  // 手动触发一次上传
  await uploadScore(
    myNewName.value,
    props.currentStats.minutes,
    props.currentStats.days,
    props.currentStats.petId
  )

  ElMessage.success('更新成功！')
  fetchData() // 刷新列表
}
</script>

<style scoped>
.ranking-container {
  color: var(--text-color);
  font-family: inherit;
}
.rank-tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}
.rank-tab {
  cursor: pointer;
  padding: 5px 15px;
  border-bottom: 2px solid transparent;
  opacity: 0.6;
  font-weight: bold;
  transition: 0.2s;
}
.rank-tab.active {
  opacity: 1;
  border-bottom-color: var(--accent-color);
  color: var(--accent-color);
}

.rank-list {
  max-height: 300px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 10px;
}
.rank-header-row {
  display: flex;
  padding: 5px 10px;
  opacity: 0.7;
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 5px;
}
.rank-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 2px;
}
.rank-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
.rank-item.is-me {
  background: rgba(var(--accent-color), 0.2);
  border: 1px solid var(--accent-color);
}

.col-rank {
  width: 40px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}
.col-user {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-score {
  width: 80px;
  text-align: right;
  font-family: monospace;
  font-size: 16px;
}
.highlight {
  color: var(--accent-color);
}

.rank-avatar {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
}

.my-info {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}
.action-btn {
  background: var(--accent-color);
  color: #000;
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.empty-tip {
  text-align: center;
  padding: 20px;
  opacity: 0.5;
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: var(--accent-color);
  border-radius: 2px;
}
</style>

<style>
.el-dialog.ranking-dialog {
  background: var(--panel-bg) !important;
  border: var(--ui-panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
  box-shadow: var(--ui-panel-box-shadow) !important;
}
.ranking-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
}
.ranking-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--text-color) !important;
}
</style>
