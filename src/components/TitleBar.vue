<template>
  <div class="title-bar-container">
    <!-- 
      🔥 1. 拖动层 (隐形) 
      - :class="{ 'locked': isMaximized }" -> 全屏时禁止拖动
      - 注意 CSS 里的 top/left/right 设置，留出了缩放边缘
    -->
    <div class="drag-region" :class="{ 'locked': isMaximized }" @dblclick="toggleMaximize"></div>

    <!-- 🔥 2. 内容层 (显示) -->
    <div class="content-layer">
      <div class="app-title">
        <span>🌊 心流小筑</span>
      </div>

      <!-- 按钮区域 -->
      <div class="window-controls">
        <div class="control-btn min-btn" @click="minimize">
          <svg viewBox="0 0 10 1">
            <path d="M0 0h10v1H0z" />
          </svg>
        </div>

        <div class="control-btn max-btn" @click="toggleMaximize">
          <svg v-if="!isMaximized" viewBox="0 0 10 10">
            <path d="M0 0h10v10H0V0zm1 1v8h8V1H1z" />
          </svg>
          <svg v-else viewBox="0 0 10 10">
            <path d="M2.2,2.2v-2.2h8v8h-2.2v2.2h-8v-8h2.2z M1.2,9.2h6v-6h-6v6z M9.2,7.2v-6.2h-6v1.2h4.8v5z" />
          </svg>
        </div>

        <div class="control-btn close-btn" @click="close">
          <svg viewBox="0 0 10 10">
            <path d="M0 0l10 10m0-10L0 10" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isMaximized = ref(false);

const minimize = () => (window as any).electronAPI?.minimize();
const close = () => (window as any).electronAPI?.close();
const toggleMaximize = () => (window as any).electronAPI?.maximize();

onMounted(() => {
  if ((window as any).electronAPI) {
    // 监听主进程发来的状态
    (window as any).electronAPI.onWindowState((state: string) => {
      console.log('窗口状态改变:', state); // 调试日志
      isMaximized.value = state === 'maximized';
    });
  }
});
</script>

<style scoped>
.title-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 32px;
  z-index: 99999;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  /* 让鼠标穿透容器，去点击下面的 drag-region 或按钮 */
}

/* 🔥🔥🔥 核心修复：拖动层 🔥🔥🔥 */
.drag-region {
  position: absolute;
  /* 关键：留出 4px 的边缘给系统捕捉缩放操作 */
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 0;

  -webkit-app-region: drag;
  /* 允许拖动 */
  pointer-events: auto;
  /* 允许接收鼠标事件(双击) */
  z-index: 1;
}

/* 🔥🔥🔥 核心修复：全屏锁定 🔥🔥🔥 */
.drag-region.locked {
  /* -webkit-app-region: no-drag !important; */
  /* 全屏时禁止拖动 */
  top: 0;
  left: 0;
  right: 0;
  /* 全屏时不需要留边 */
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 0 0 10px;
}

.app-title {
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  /* 标题本身不响应鼠标，穿透给底下的 drag-region */
  pointer-events: none;
}

.window-controls {
  display: flex;
  height: 100%;
  pointer-events: auto;
  /* 按钮必须能点 */
  -webkit-app-region: no-drag;
  /* 按钮区域禁止拖动 */
}

.control-btn {
  width: 46px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.control-btn svg {
  width: 10px;
  height: 10px;
  fill: currentColor;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn:hover {
  background: #e81123;
  color: white;
}
</style>