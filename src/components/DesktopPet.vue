<template>
  <div class="pet-wrapper" :style="{
    left: x + 'px',
    top: y + 'px',
    width: size + 'px',
    height: size + 'px',
    transform: `scaleX(${direction})`,
    opacity: opacity,
    transition: isDragging ? 'none' : 'top 0.1s, left 0.1s',
  }" @mousedown.prevent="startDrag" @mouseenter="handleMouseEnter" @click="handleClick">
    <img :src="currentGifSrc" class="pet-gif" draggable="false" />

    <!-- 
       🔥 修复 1：调整气泡样式，确保可见 
       增加 z-index，并确保它不会被 scaleX 翻转文字方向
    -->
    <div v-if="bubbleText" class="bubble" :style="{ transform: `scaleX(${direction})` }">
      {{ bubbleText }}
    </div>

    <div class="mode-indicator" :style="{ transform: `scaleX(${direction})` }">
      <span v-if="mode === 'angry'">💢</span>
      <span v-if="mode === 'gentle' && currentState === 'pet'">❤️</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  petId: string
  scale: number
  opacity: number
  walkSpeed: number
  affection: number
  // 🔥 新增接收初始坐标
  initialX?: number
  initialY?: number
}>()

// 🔥 修改事件名为 add-affection，避免 v-model 歧义
const emit = defineEmits(['add-affection', 'save-pos'])

type PetState = 'idle' | 'walk' | 'run' | 'pet' | 'drag' | 'fall'
type PetMode = 'gentle' | 'angry'

const size = computed(() => 32 * props.scale)
const x = ref(window.innerWidth - 200)
const y = ref(150)
const direction = ref(1)
const currentState = ref<PetState>('idle')
const mode = ref<PetMode>('gentle')
const bubbleText = ref('')
const isDragging = ref(false)

// 🔥🔥🔥 去掉开头的 / 🔥🔥🔥
const currentGifSrc = computed(() => `pet/${props.petId}_${currentState.value}.gif`);

let aiTimer: any = null
let angerTimer: any = null
let runTarget = { x: 0, y: 0 }
const sootheCount = ref(0)
const MAX_SOOTHE_REQUIRED = 4

// 🔥 新增：抚摸冷却锁
let isSoothing = false

const think = () => {
  if (isDragging.value || ['run', 'pet'].includes(currentState.value)) return
  const rand = Math.random()
  if (mode.value === 'gentle') {
    if (rand < 0.6) currentState.value = 'idle'
    else {
      currentState.value = 'walk'
      direction.value = Math.random() > 0.5 ? 1 : -1
    }
  } else {
    if (rand < 0.3) currentState.value = 'idle'
    else {
      currentState.value = 'walk'
      direction.value = Math.random() > 0.5 ? 1 : -1
    }
  }
}

const changeState = (newState: PetState, duration: number = 0) => {
  if (currentState.value === newState) return
  currentState.value = newState
  if (duration > 0) {
    setTimeout(() => {
      if (!isDragging.value && currentState.value === newState) {
        changeState('idle')
      }
    }, duration)
  }
}

const gameLoop = () => {
  if (isDragging.value) {
    requestAnimationFrame(gameLoop)
    return
  }

  const screenW = window.innerWidth
  const screenH = window.innerHeight
  const petSize = size.value

  // 边界限制
  if (x.value < 0) x.value = 0
  if (x.value > screenW - petSize) x.value = screenW - petSize
  if (y.value < 0) y.value = 0
  if (y.value > screenH - petSize) y.value = screenH - petSize

  if (currentState.value === 'walk') {
    let speed = (mode.value === 'angry' ? 3 : 1) * props.walkSpeed
    let newX = x.value + speed * direction.value
    if (newX < 0 || newX > screenW - size.value) {
      direction.value *= -1
      newX = x.value
    }
    x.value = newX
  }

  if (currentState.value === 'run') {
    const dx = runTarget.x - x.value
    const dy = runTarget.y - y.value
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (
      dist < 10 ||
      x.value <= 0 ||
      x.value >= screenW - size.value ||
      y.value <= 0 ||
      y.value >= screenH - size.value
    ) {
      currentState.value = 'idle'
    } else {
      const speed = 6 * props.walkSpeed
      x.value += (dx / dist) * speed
      y.value += (dy / dist) * speed
    }
  }

  requestAnimationFrame(gameLoop)
}

const resetAngerTimer = () => {
  if (angerTimer) clearTimeout(angerTimer)
  if (mode.value === 'gentle') {
    angerTimer = setTimeout(() => {
      mode.value = 'angry'
      showBubbleText('哼...', 2000)
    }, 60000)
  }
}

const handleMouseEnter = (e: MouseEvent) => {
  if (isDragging.value) return
  resetAngerTimer()

  if (mode.value === 'angry') {
    // 🔥 修复 2：增加冷却时间，防止瞬间多次触发
    if (isSoothing) return
    isSoothing = true
    setTimeout(() => {
      isSoothing = false
    }, 3000) // 3秒内只能抚摸一次

    sootheCount.value++

    if (sootheCount.value >= MAX_SOOTHE_REQUIRED) {
      mode.value = 'gentle'
      sootheCount.value = 0
      showBubbleText('原谅你了~', 2000)
      currentState.value = 'pet'
      setTimeout(() => {
        currentState.value = 'idle'
      }, 2000)
    } else {
      showBubbleText(
        `别碰我! (${sootheCount.value}/${MAX_SOOTHE_REQUIRED})`,
        1000
      )
      triggerRunAway(e.clientX, e.clientY)
    }
  }
}

const triggerRunAway = (mouseX: number, mouseY: number) => {
  currentState.value = 'run'
  const angle = Math.atan2(y.value - mouseY, x.value - mouseX)
  runTarget = {
    x: x.value + Math.cos(angle) * 300,
    y: y.value + Math.sin(angle) * 300,
  }
  direction.value = runTarget.x > x.value ? 1 : -1
}

const handleClick = () => {
  if (isDragging.value) return
  resetAngerTimer()
  if (mode.value === 'gentle') {
    showBubbleText('❤️', 1500)
    currentState.value = 'pet'
    setTimeout(() => {
      currentState.value = 'idle'
    }, 2500)
    // 🔥 修复：发送增加好感度事件 (加2点)
    emit('add-affection', 0)
  } else {
    showBubbleText('走开！', 1000)
  }
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  currentState.value = 'drag'
  resetAngerTimer()
  const startX = e.clientX - x.value
  const startY = e.clientY - y.value
  const move = (ev: MouseEvent) => {
    let newX = ev.clientX - startX
    let newY = ev.clientY - startY
    const screenW = window.innerWidth
    const screenH = window.innerHeight
    const petSize = size.value
    newX = Math.max(0, Math.min(screenW - petSize, newX))
    newY = Math.max(0, Math.min(screenH - petSize, newY))
    x.value = newX
    y.value = newY
  }
  const up = () => {
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', up)
    isDragging.value = false
    changeState('fall', 600)
    // 🔥 拖拽结束，保存位置
    emit('save-pos', { x: x.value, y: y.value })
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
}

// 🔥 修复：确保气泡显示时间足够长，且在 DOM 更新后显示
const showBubbleText = (text: string, time: number) => {
  bubbleText.value = text
  // 清除之前的计时器（如果有的话，防止闪烁）
  // 简单实现：依靠 setTimeout 闭包覆盖
  setTimeout(() => {
    // 只有当文本没变的时候才清除，防止把新消息清掉了
    if (bubbleText.value === text) {
      bubbleText.value = ''
    }
  }, time)
}

const feed = () => {
  showBubbleText('好吃！✨', 2000)
  currentState.value = 'pet'
  mode.value = 'gentle'
  setTimeout(() => {
    currentState.value = 'idle'
  }, 3000)
  resetAngerTimer()
}

defineExpose({ feed })

onMounted(() => {
  // 🔥 修复：初始化时应用保存的坐标
  if (props.initialX !== undefined && props.initialY !== undefined) {
    x.value = props.initialX
    y.value = props.initialY
  }

  aiTimer = setInterval(think, 3000)
  gameLoop()
  resetAngerTimer()
})
onUnmounted(() => {
  clearInterval(aiTimer)
  if (angerTimer) clearTimeout(angerTimer)
})
</script>

<style scoped>
.pet-wrapper {
  position: fixed;
  z-index: 9999;
  cursor: grab;
  user-select: none;
  image-rendering: pixelated;
}

.pet-wrapper:active {
  cursor: grabbing;
}

.pet-gif {
  width: 100%;
  height: 100%;
  display: block;
}

/* 🔥 修复气泡样式 */
.bubble {
  position: absolute;
  /* 往上提一点，防止遮挡宠物 */
  top: 0px;
  left: 30%;
  transform: translateX(-50%);
  /* 注意：这个 transform 会被行内样式覆盖，所以我们在 template 里处理了 */

  background: white;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 4px 8px;

  /* 字体大小：因为父容器可能被 scale 放大了，所以这里字号要小一点，或者设为固定像素 */
  font-size: 12px;
  font-family: 'Microsoft YaHei', sans-serif;
  /* 用通用字体确保显示中文 */
  font-weight: bold;
  color: #000;

  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
  /* 确保在最上层 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 小三角 */
.bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: #000 transparent transparent transparent;
}

.mode-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 12px;
  pointer-events: none;
}
</style>
