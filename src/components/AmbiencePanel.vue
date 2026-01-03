<template>
  <div class="ambience-panel">
    <div class="panel-title">环境音效</div>
    <div class="sound-list">
      <div v-for="sound in sounds" :key="sound.id" class="sound-item">
        <div class="sound-info" @click="toggleMute(sound)">
          <el-icon :class="{ active: sound.volume > 0 }" size="20">
            <component :is="sound.icon" />
          </el-icon>
          <span class="sound-name">{{ sound.name }}</span>
        </div>
        <el-slider
          v-model="sound.volume"
          :max="100"
          :format-tooltip="(val: number) => `${val}%`"
          size="small"
          @input="(val: number) => updateVolume(sound, val)"
          @change="saveSettings"
        />
        <audio
          :ref="(el) => setAudioRef(el, sound)"
          :src="sound.src"
          loop
          preload="auto"
        ></audio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, markRaw } from 'vue'
import { Pouring, Sunny, Monitor, Cloudy } from '@element-plus/icons-vue'

interface SoundItem {
  id: string
  name: string
  src: string
  volume: number
  icon: any
  audioEl?: HTMLAudioElement
}
const STORAGE_KEY = 'flow-ambience-settings'
const sounds = ref<SoundItem[]>([
  {
    id: 'rain',
    name: '雨声',
    src: '/sounds/rain.mp3',
    volume: 0,
    icon: markRaw(Pouring),
  },
  {
    id: 'fire',
    name: '篝火',
    src: '/sounds/fire.mp3',
    volume: 0,
    icon: markRaw(Sunny),
  },
  {
    id: 'keyboard',
    name: '打字',
    src: '/sounds/keyboard.mp3',
    volume: 0,
    icon: markRaw(Monitor),
  },
  {
    id: 'bird',
    name: '鸟鸣',
    src: '/sounds/bird.mp3',
    volume: 0,
    icon: markRaw(Cloudy),
  },
])

const setAudioRef = (el: any, sound: SoundItem) => {
  if (el) sound.audioEl = el as HTMLAudioElement
}
const updateVolume = (sound: SoundItem, val: number) => {
  if (!sound.audioEl) return
  sound.audioEl.volume = val / 100
  if (val > 0 && sound.audioEl.paused) {
    sound.audioEl.play().catch(() => {})
  } else if (val === 0 && !sound.audioEl.paused) {
    sound.audioEl.pause()
  }
}
const toggleMute = (sound: SoundItem) => {
  if (sound.volume > 0) {
    sound.volume = 0
    updateVolume(sound, 0)
  } else {
    sound.volume = 50
    updateVolume(sound, 50)
  }
  saveSettings()
}
const saveSettings = () => {
  const settings: Record<string, number> = {}
  sounds.value.forEach((s) => (settings[s.id] = s.volume))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
const loadSettings = async () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const settings = JSON.parse(saved)
      await nextTick()
      sounds.value.forEach((sound) => {
        const savedVol = settings[sound.id]
        if (typeof savedVol === 'number') {
          sound.volume = savedVol
          updateVolume(sound, savedVol)
        }
      })
    } catch (e) {}
  }
}
watch(
  sounds,
  () => {
    saveSettings()
  },
  { deep: true }
)
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.ambience-panel {
  width: 200px;
  background: var(--panel-bg);
  backdrop-filter: blur(4px);
  padding: 15px;
  border-radius: var(--border-radius);
  color: var(--text-color);
  border: var(--panel-border);
  /* 🔥 强制指定字体变量 */
  font-family: var(--font-family) !important;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  border-bottom: 1px solid var(--text-color);
  opacity: 0.8;
  padding-bottom: 5px;
  /* 🔥 强制继承 */
  font-family: inherit !important;
}

.sound-item {
  margin-bottom: 15px;
}

.sound-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  cursor: pointer;
  user-select: none;
}
:deep(.el-slider__bar) {
  background-color: var(--accent-color) !important;
}
:deep(.el-slider__button) {
  border-color: var(--accent-color) !important;
}
.sound-info:hover {
  color: var(--accent-color);
}
.active {
  color: var(--accent-color);
}

.sound-name {
  font-size: 14px;
  /* 🔥 强制继承 */
  font-family: inherit;
}
</style>
