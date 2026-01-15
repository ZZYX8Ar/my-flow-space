<template>
  <el-dialog :model-value="visible" title="我的桌宠" width="400px" center :before-close="handleClose" class="pet-dialog">
    <div class="pet-status">
      <div class="avatar">
        <!-- 🔥 修复：动态显示当前宠物图片 -->
        <img :src="currentPetImg" />
      </div>
      <div class="info">
        <div class="name">当前伙伴</div>
        <div class="affinity-bar-wrapper">
          <span>好感度: {{ settings.affection }}%</span>
          <el-progress :percentage="settings.affection" :color="customColor" :format="format" />
        </div>
        <div v-if="settings.affection >= 100" class="reward-text">
          🎉 已解锁专属套装！
        </div>
        <div v-else class="reward-text">🔒 100% 解锁专属主题套装</div>
      </div>
    </div>

    <!-- ... 中间设置代码保持不变 ... -->
    <div class="settings-group">
      <div class="setting-item">
        <span>大小</span>
        <el-slider v-model="settings.scale" :min="1" :max="10" :step="0.1" @input="emitChange" />
      </div>
      <div class="setting-item">
        <span>透明度</span>
        <el-slider v-model="settings.opacity" :min="0.1" :max="1" :step="0.1" @input="emitChange" />
      </div>
      <div class="setting-item">
        <span>活跃度</span>
        <el-slider v-model="settings.walkSpeed" :min="0.1" :max="1" :step="0.1" @input="emitChange" />
      </div>
    </div>

    <div class="feed-section">
      <div class="section-title">喂食 (消耗金币)</div>
      <div class="snack-list">
        <div v-for="snack in snacks" :key="snack.id" class="snack-item" @click="handleFeed(snack)">
          <div class="icon">{{ snack.src }}</div>
          <div class="name">{{ snack.name }}</div>
          <div class="price">💰{{ snack.price }}</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElMessage } from "element-plus";
import type { GameItem, PetSettings } from "../types";

const props = defineProps<{
  visible: boolean;
  settings: PetSettings;
  snacks: GameItem[];
  userCoins: number;
  currentPetId: string; // 🔥 新增接收属性
}>();

const emit = defineEmits(["update:visible", "change", "feed"]);

// 🔥 计算当前宠物的图片路径 (显示 idle 状态)
const currentPetImg = computed(() => `pet/${props.currentPetId}_idle.gif`);

const customColor = (percentage: number) => {
  if (percentage < 30) return "#909399";
  if (percentage < 70) return "#e6a23c";
  return "#67c23a";
};
const format = (percentage: number) =>
  percentage === 100 ? "满" : `${percentage}%`;

const handleClose = () => emit("update:visible", false);
const emitChange = () => emit("change", props.settings);

const handleFeed = (snack: GameItem) => {
  if (props.userCoins < snack.price) {
    ElMessage.error("金币不足！快去专注赚钱吧。");
    return;
  }
  if (props.settings.affection >= 100) {
    ElMessage.success("它已经很满足了，不用再喂啦！");
    return;
  }
  emit("feed", snack);
};
</script>

<style scoped>
/* 样式保持不变 */
.pet-status {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.avatar img {
  width: 80px;
  height: 80px;
  image-rendering: pixelated;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  object-fit: contain;
}

.info {
  flex: 1;
}

.name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--accent-color);
}

.reward-text {
  font-size: 12px;
  margin-top: 5px;
  color: var(--text-color);
  opacity: 0.8;
}

.settings-group {
  margin-bottom: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
  color: var(--text-color);
}

.setting-item .el-slider {
  flex: 1;
}

.feed-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--text-color);
}

/* 1. 修改列表容器：改用 Grid 布局 */
.snack-list {
  display: grid;
  /* 变成网格 */
  grid-template-columns: repeat(3, 1fr);
  /* 一行 3 列，自动平分 */
  gap: 10px;
  /* 间距 */

  /* 如果零食特别多，限制高度并允许滚动 */
  max-height: 220px;
  overflow-y: auto;
  padding-right: 5px;
  /* 防止滚动条挡住内容 */
}

/* 2. 修改单个物品：去掉固定宽度 */
.snack-item {
  width: auto;
  /* 🔥 删除原来的 width: 30% */

  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: 0.2s;
  border: 1px solid transparent;
}

.snack-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.snack-item .icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.snack-item .name {
  font-size: 12px;
  color: var(--text-color);
}

.snack-item .price {
  font-size: 12px;
  color: #ffd04b;
  font-weight: bold;
}
</style>
<style>
.el-dialog.pet-dialog {
  background: var(--panel-bg) !important;
  border: var(--ui-panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
}

.pet-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
}

.pet-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--text-color) !important;
}
</style>
