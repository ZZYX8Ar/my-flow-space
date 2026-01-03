<template>
  <div class="music-bar-container">
    <audio
      ref="audioRef"
      :src="currentSong?.src || ''"
      preload="auto"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="onDurationChange"
      @ended="nextSong"
      @error="onAudioError"
    ></audio>

    <div class="bar-content">
      <!-- 左侧 -->
      <div class="section-left">
        <div class="cover-block">
          <el-icon class="cover-icon"><Headset /></el-icon>
        </div>
        <div class="song-text">
          <div class="title">{{ currentSong?.name || 'No Song' }}</div>
          <div class="artist">{{ currentSong?.artist || 'Unknown' }}</div>
        </div>
      </div>

      <!-- 中间 -->
      <div class="section-center">
        <div class="controls">
          <el-icon class="ctrl-btn" @click="prevSong"
            ><ArrowLeftBold
          /></el-icon>
          <div class="play-btn-circle" @click="togglePlay">
            <!-- 显式设置图标颜色，防止继承透明度 -->
            <el-icon class="play-icon" v-if="isPlaying"><VideoPause /></el-icon>
            <el-icon class="play-icon" v-else><CaretRight /></el-icon>
          </div>
          <el-icon class="ctrl-btn" @click="nextSong"
            ><ArrowRightBold
          /></el-icon>
        </div>

        <div class="progress-wrapper">
          <span class="time-text">{{ formatTime(sliderValue) }}</span>
          <div class="slider-box">
            <el-slider
              v-model="sliderValue"
              :max="safeDuration"
              :show-tooltip="false"
              @input="handleSliderInput"
              @change="handleSliderChange"
              size="small"
            />
          </div>
          <span class="time-text">{{ formatTime(safeDuration) }}</span>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="section-right">
        <div class="volume-control">
          <el-icon @click="toggleMute" class="mute-btn">
            <Microphone v-if="volume > 0" />
            <Mute v-else />
          </el-icon>
          <div class="vol-slider-box">
            <el-slider v-model="volume" @input="setVolume" size="small" />
          </div>
        </div>

        <el-popover
          placement="top-end"
          title="音乐磁带"
          :width="280"
          trigger="click"
          popper-class="playlist-popover"
        >
          <template #reference>
            <div class="icon-btn list-btn">
              <el-icon><Tickets /></el-icon>
            </div>
          </template>
          <ul class="playlist-ul">
            <li
              v-for="(song, index) in playlist"
              :key="song.id"
              class="playlist-item"
              :class="{
                active: index === currentIndex,
                locked: !song.unlocked,
              }"
              @click="playIndex(index)"
            >
              <span class="song-index">
                <el-icon v-if="!song.unlocked"><Lock /></el-icon>
                <span v-else>{{ index + 1 }}</span>
              </span>
              <div class="song-info-mini">
                <div class="name">{{ song.name }}</div>
                <div class="author">{{ song.artist }}</div>
              </div>
              <el-icon v-if="index === currentIndex" class="playing-icon"
                ><VideoPlay
              /></el-icon>
            </li>
          </ul>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Headset,
  ArrowLeftBold,
  ArrowRightBold,
  VideoPause,
  CaretRight,
  Microphone,
  Tickets,
  VideoPlay,
  Mute,
  Lock,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { GameItem } from '../types'

const props = defineProps<{ playlist: GameItem[] }>()
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const duration = ref(0)
const volume = ref(50)
const lastVolume = ref(50)
const sliderValue = ref(0)
const isDragging = ref(false)
const currentIndex = ref(0)

const currentSong = computed(() => props.playlist[currentIndex.value])
const safeDuration = computed(() =>
  duration.value && !isNaN(duration.value) && duration.value !== Infinity
    ? duration.value
    : 0
)

onMounted(() => {
  const saved = localStorage.getItem('flow-music-settings')
  if (saved) {
    try {
      const { index, vol } = JSON.parse(saved)
      if (
        typeof index === 'number' &&
        index >= 0 &&
        index < props.playlist.length
      )
        currentIndex.value = index
      if (typeof vol === 'number') volume.value = vol
    } catch (e) {}
  }
})
watch([currentIndex, volume], ([newIndex, newVol]) => {
  localStorage.setItem(
    'flow-music-settings',
    JSON.stringify({ index: newIndex, vol: newVol })
  )
})

const togglePlay = () => {
  if (!currentSong.value) return
  if (!currentSong.value.unlocked) {
    ElMessage.warning('未解锁')
    return
  }
  if (!audioRef.value) return
  if (isPlaying.value) audioRef.value.pause()
  else audioRef.value.play().catch(() => {})
  isPlaying.value = !isPlaying.value
}
const playIndex = (index: number) => {
  const targetSong = props.playlist[index]
  if (!targetSong || !targetSong.unlocked) return
  if (index === currentIndex.value) {
    togglePlay()
    return
  }
  currentIndex.value = index
  isPlaying.value = true
  sliderValue.value = 0
  setTimeout(() => {
    audioRef.value?.play()
  }, 100)
}
const findNextUnlockedIndex = (direction: 1 | -1) => {
  let tempIndex = currentIndex.value
  let loopCount = 0
  if (props.playlist.length === 0) return 0
  do {
    tempIndex += direction
    if (tempIndex >= props.playlist.length) tempIndex = 0
    if (tempIndex < 0) tempIndex = props.playlist.length - 1
    loopCount++
    const song = props.playlist[tempIndex]
    if (song && !song.unlocked && loopCount < props.playlist.length) {
      /* continue */
    } else {
      break
    }
  } while (true)
  return tempIndex
}
const nextSong = () => playIndex(findNextUnlockedIndex(1))
const prevSong = () => playIndex(findNextUnlockedIndex(-1))
const handleSliderInput = (val: number) => {
  isDragging.value = true
  sliderValue.value = val
}
const handleSliderChange = (val: number) => {
  if (audioRef.value) {
    audioRef.value.currentTime = val
    if (!isPlaying.value) togglePlay()
  }
  setTimeout(() => {
    isDragging.value = false
  }, 200)
}
const onTimeUpdate = () => {
  if (!audioRef.value) return
  if (!isDragging.value) sliderValue.value = audioRef.value.currentTime
}
const updateDuration = () => {
  if (audioRef.value && !isNaN(audioRef.value.duration))
    duration.value = audioRef.value.duration
}
const onLoadedMetadata = () => {
  updateDuration()
  if (audioRef.value) audioRef.value.volume = volume.value / 100
}
const onDurationChange = updateDuration
const onAudioError = () => {
  if (currentSong.value?.unlocked && isPlaying.value)
    ElMessage.error('无法播放')
}
const toggleMute = () => {
  if (volume.value > 0) {
    lastVolume.value = volume.value
    volume.value = 0
  } else {
    volume.value = lastVolume.value || 50
  }
}
const setVolume = () => {
  if (audioRef.value) audioRef.value.volume = volume.value / 100
}
const formatTime = (s: number) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
watch(currentSong, () => {
  duration.value = 0
})
defineExpose({ togglePlay, nextSong, prevSong, toggleMute })
</script>

<style scoped>
.music-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  color: var(--text-color);
  z-index: 999;
  user-select: none;
  font-family: inherit;
}
.bar-content {
  width: 98%;
  max-width: 1920px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-left {
  width: 25%;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 15px;
}
.cover-block {
  width: 48px;
  height: 48px;
  background: var(--text-color);
  color: rgb(var(--panel-rgb));
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.song-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.song-text .title {
  font-size: 15px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
}
.song-text .artist {
  font-size: 12px;
  opacity: 0.7;
  color: var(--text-color);
}
.section-center {
  width: 50%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.controls {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 5px;
}

/* 🔥 图标颜色强制设置为文字色 */
.ctrl-btn {
  cursor: pointer;
  font-size: 22px;
  opacity: 0.8;
  transition: 0.2s;
  color: var(--text-color);
}
.ctrl-btn:hover {
  opacity: 1;
  color: var(--accent-color);
  transform: scale(1.1);
}

/* 🔥 播放按钮修复：背景是文字色，图标是面板背景色(不透明) */
.play-btn-circle {
  width: 36px;
  height: 36px;
  background: var(--text-color);
  color: rgb(var(--panel-rgb)); /* 确保图标颜色是不透明的深色/浅色 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: 0.2s;
}
.play-btn-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px var(--accent-color);
}

.progress-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}
.slider-box {
  flex: 1;
  display: flex;
  align-items: center;
}
.time-text {
  font-size: 12px;
  min-width: 35px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  opacity: 0.8;
}
.section-right {
  width: 25%;
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}
.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100px;
}
.vol-slider-box {
  flex: 1;
  display: flex;
  align-items: center;
}
.mute-btn {
  font-size: 20px;
  color: var(--text-color);
  cursor: pointer;
}
.list-btn {
  font-size: 22px;
  cursor: pointer;
  color: var(--text-color);
  transition: 0.2s;
}
.list-btn:hover {
  color: var(--accent-color);
}

:deep(.el-slider__bar) {
  background-color: var(--accent-color) !important;
}
:deep(.el-slider__button) {
  border-color: var(--accent-color) !important;
  background-color: var(--accent-color) !important;
  width: 12px;
  height: 12px;
}
:deep(.el-slider__runway) {
  background-color: rgba(128, 128, 128, 0.3) !important;
  margin: 0 !important;
}

/* 弹窗样式 */
.playlist-ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}
.playlist-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}
.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
.playlist-item.active {
  color: var(--accent-color);
}
.playlist-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}
.song-index {
  width: 30px;
  text-align: center;
  font-size: 12px;
  opacity: 0.6;
}
.song-info-mini {
  flex: 1;
}
.song-info-mini .name {
  font-size: 14px;
  font-weight: bold;
}
.song-info-mini .author {
  font-size: 12px;
  opacity: 0.7;
}
.playing-icon {
  font-size: 16px;
}
</style>

<!-- 全局覆盖 -->
<style>
.el-popover.playlist-popover {
  /* 🔥 修复 2：增加背景色，防止全透明看不清 */
  background: var(--ui-panel-bg) !important;
  border: var(--ui-panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px) !important; /* 弹窗保留模糊，提升可读性 */
  box-shadow: var(--ui-panel-box-shadow) !important;
  color: var(--text-color) !important;
  font-family: var(--font-family) !important;
}

.el-popover.playlist-popover .el-popover__title {
  color: var(--text-color) !important;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
  margin-bottom: 5px;
  font-family: inherit !important;
  /* 🔥 修复 3：标题居中 */
  text-align: center;
}
</style>
