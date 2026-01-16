<template>
  <div class="game-container" :style="themeStyles" @mousemove="handleGlobalMouseMove" @click="resetIdleTimer"
    @mouseup="stopAction" @mouseleave="stopAction">

    <TitleBar />

    <transition-group name="fade" tag="div" class="background-wrapper">
      <video v-if="isVideo(currentBg)" :key="'video-' + currentBg" :src="currentBg" class="bg-media" autoplay loop muted
        playsinline></video>
      <img v-else :key="'img-' + currentBg" :src="currentBg" alt="background" class="bg-media" />
    </transition-group>

    <DesktopPet ref="petRef" :pet-id="petSettings.currentPetId" :scale="petSettings.scale"
      :opacity="petSettings.opacity" :walk-speed="petSettings.walkSpeed" :affection="petSettings.affection"
      :initial-x="petSettings.x" :initial-y="petSettings.y" @add-affection="handleAffectionUpdate"
      @save-pos="handlePetPositionSave" />

    <div class="ui-layer">
      <div class="decor-layer">
        <div v-for="decor in activeDecors" :key="decor.id" class="decor-wrapper" :class="{
          'is-interacting':
            draggingItem?.id === decor.id || resizingItem?.id === decor.id,
        }" :style="{ left: decor.x, top: decor.y, width: decor.width }" @mousedown.stop="(e) => startDrag(e, decor)">
          <div class="decor-box">
            <div class="close-btn" @mousedown.stop="removeDecor(decor)">
              <el-icon>
                <CircleCloseFilled />
              </el-icon>
            </div>
            <img :src="decor.src" alt="decor" class="decor-img" />
            <div class="resize-handle" @mousedown.stop="(e) => startResize(e, decor)"></div>
          </div>
        </div>
      </div>

      <div class="hud-item top-left ui-fade" :class="{ 'ui-hidden': isIdle }">
        <TodoList />
      </div>

      <!-- 右上角区域 -->
      <div class="top-right-zone">
        <div class="hud-item toolbar ui-fade" :class="{ 'ui-hidden': isIdle }">
          <div class="coin-display">
            <el-icon class="coin-icon" size="20">
              <Coin />
            </el-icon>
            <span class="coin-text">{{ coins }}</span>
          </div>

          <el-tooltip content="我的桌宠(P)" placement="bottom">
            <div class="tool-btn" @click="petModalVisible = true">
              <el-icon>
                <Orange />
              </el-icon>
            </div>
          </el-tooltip>
          <el-tooltip content="界面设置 (H)" placement="bottom">
            <div class="tool-btn" @click="uiSettingsVisible = true">
              <el-icon>
                <Operation />
              </el-icon>
            </div>
          </el-tooltip>
          <el-tooltip :content="autoBgEnabled ? '自动切换已开启 (A)' : '自动切换已关闭 (A)'
            " placement="bottom">
            <div class="tool-btn" :class="{ 'is-active': autoBgEnabled }" @click="toggleAutoBackground">
              <el-icon>
                <Refresh />
              </el-icon>
            </div>
          </el-tooltip>

          <!-- 🔥🔥🔥 4. 在这里插入日历按钮 🔥🔥🔥 -->
          <el-tooltip content="专注日历 (D)" placement="bottom">
            <div class="tool-btn" @click="calendarVisible = true">
              <el-icon>
                <Calendar />
              </el-icon>
            </div>
          </el-tooltip>

          <el-tooltip content="数据统计 (L)" placement="bottom">
            <div class="tool-btn" @click="statsVisible = true">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
          </el-tooltip>
          <el-tooltip content="切换全屏 (F)" placement="bottom">
            <div class="tool-btn" @click="toggleFullscreen">
              <el-icon>
                <FullScreen />
              </el-icon>
            </div>
          </el-tooltip>

          <!-- 🔥 新增：自动隐藏开关按钮 -->
          <el-tooltip :content="autoHideEnabled ? '自动隐藏已开启 (J)' : '自动隐藏已关闭 (J)'" placement="bottom">
            <div class="tool-btn" :class="{ 'is-active': autoHideEnabled }" @click="toggleAutoHide">
              <el-icon v-if="autoHideEnabled">
                <View />
              </el-icon>
              <el-icon v-else>
                <Hide />
              </el-icon>
            </div>
          </el-tooltip>

          <el-tooltip content="空间商店 (S)" placement="bottom">
            <div class="tool-btn" @click="shopVisible = true">
              <el-icon>
                <Shop />
              </el-icon>
            </div>
          </el-tooltip>


          <el-tooltip content="排行榜(R)" placement="bottom">
            <div class="tool-btn" @click="rankingVisible = true">
              <el-icon>
                <Trophy />
              </el-icon>
            </div>
          </el-tooltip>
        </div>

        <!-- 专注计时器 -->
        <div class="hud-item timer-container">
          <FocusTimer ref="focusTimerRef" @finish="handleFocusFinish" />
        </div>
      </div>

      <div class="hud-item desk-clock-pos custom-clock-scale">
        <DeskClock />
      </div>
      <div class="hud-item bottom-right ui-fade" :class="{ 'ui-hidden': isIdle }">
        <AmbiencePanel />
      </div>
    </div>

    <div class="bottom-dock ui-fade" :class="{ 'ui-hidden': isIdle }">
      <MusicBar ref="musicBarRef" :playlist="musicList" />
    </div>

    <ShopModal v-model:visible="shopVisible" :user-coins="coins" :items="allItems" :current-bg="currentBg"
      :current-theme="currentThemeId" :current-font="currentFontId" :current-pet-id="petSettings.currentPetId"
      @buy="handleBuy" @equip="handleEquip" @equip-pet="handleEquipPet" @toggle-decor="handleToggleDecor" />
    <StatsModal v-model:visible="statsVisible" />
    <UISettingsModal v-model:visible="uiSettingsVisible" :initial-settings="uiSettings" @change="updateUISettings"
      @save="saveUISettings" />
    <PetControlModal v-model:visible="petModalVisible" :settings="petSettings" :snacks="snackList" :user-coins="coins"
      :current-pet-id="petSettings.currentPetId" @change="savePetSettings" @feed="handleFeedPet" />
  </div>

  <!-- 底部 -->
  <RankingModal v-model:visible="rankingVisible" :current-stats="currentStats" />

  <CalendarModal v-model:visible="calendarVisible" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import {
  FullScreen,
  Shop,
  Coin,
  TrendCharts,
  Refresh,
  CircleCloseFilled,
  Operation,
  Orange,
  Calendar,
  View,
  Hide
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import TodoList from './components/TodoList.vue'
import FocusTimer from './components/FocusTimer.vue'
import DeskClock from './components/DeskClock.vue'
import MusicBar from './components/MusicBar.vue'
import AmbiencePanel from './components/AmbiencePanel.vue'
import ShopModal from './components/ShopModal.vue'
import StatsModal from './components/StatsModal.vue'
import UISettingsModal, {
  type UISettings,
} from './components/UISettingsModal.vue'
import DesktopPet from './components/DesktopPet.vue'
import PetControlModal from './components/PetControlModal.vue'
import type { GameItem, PetSettings } from './types'
import { defaultItems } from './gameData'
import CalendarModal from './components/CalendarModal.vue'
import { getAllAssets } from './utils/db' // 🔥 引入 DB 工具
import { Trophy } from '@element-plus/icons-vue' // 引入奖杯图标
import RankingModal from './components/RankingModal.vue'
import { uploadScore } from './utils/supabase'
import TitleBar from './components/TitleBar.vue'

const coins = ref(0)
const allItems = ref<GameItem[]>(JSON.parse(JSON.stringify(defaultItems)))
const musicList = computed(() =>
  allItems.value.filter((i) => i.type === 'music')
)
const activeDecors = computed(() =>
  allItems.value.filter((i) => i.type === 'decor' && i.isActive)
)
const snackList = computed(() =>
  allItems.value.filter((i) => i.type === 'snack')
)

const shopVisible = ref(false)
const statsVisible = ref(false)
const uiSettingsVisible = ref(false)
const petModalVisible = ref(false)
const calendarVisible = ref(false)

const savedBg = localStorage.getItem('flow-current-bg')
const savedTheme = localStorage.getItem('flow-current-theme-id')
const savedFont = localStorage.getItem('flow-current-font-id')
const defaultBgImg = defaultItems.find((i) => i.id === 'bg1')?.src || 'bg.gif'
const currentBg = ref(savedBg || defaultBgImg)
const currentThemeId = ref(savedTheme || 't1')
const currentFontId = ref(savedFont || 'f1')

const focusTimerRef = ref<any>(null)
const musicBarRef = ref<any>(null)
const petRef = ref<any>(null)

const rankingVisible = ref(false)

// 计算总数据传给排行榜
const currentStats = computed(() => {
  // 计算总天数 (去重)
  const historyStr = localStorage.getItem('flow-focus-history')
  const history = historyStr ? JSON.parse(historyStr) : []
  const uniqueDays = new Set(history.map((h: any) => h.date)).size

  // 计算总时长 (直接用 coins 近似，或者重新遍历 history)
  const totalMins = history.reduce(
    (acc: number, cur: any) => acc + cur.minutes,
    0
  )

  return {
    minutes: totalMins,
    days: uniqueDays,
    petId: petSettings.currentPetId,
  }
})

// 🔥🔥🔥 新增：加载自定义资源 (包含字体注册逻辑) 🔥🔥🔥

const loadCustomAssets = async () => {
  try {
    const assets = await getAllAssets();

    const newItems = await Promise.all(
      assets.map(async (asset) => {
        let url = URL.createObjectURL(asset.blob);

        // A. 处理字体
        if (asset.type === 'font') {
          const fontName = asset.name.replace(/\.[^/.]+$/, '');
          try {
            const fontFace = new FontFace(fontName, `url(${url})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            console.log(`字体 ${fontName} 加载成功`);
            return {
              id: asset.id,
              type: 'font',
              name: fontName,
              src: `'${fontName}', sans-serif`,
              price: 0,
              unlocked: true,
            } as GameItem;
          } catch (err) {
            console.error(`字体 ${asset.name} 加载失败`, err);
            return null;
          }
        }

        // B. 处理摆件
        if (asset.type === 'decor') {
          return {
            id: asset.id,
            type: 'decor',
            name: asset.name,
            src: url,
            price: 0,
            unlocked: true,
            isActive: false,
            x: '50%',
            y: '50%',
            width: '100px',
          } as GameItem;
        }

        // C. 处理背景 (🔥 核心修复点 🔥)
        if (asset.type === 'background') {
          // 如果是视频文件 (MIME类型以 video/ 开头)
          // 强行在 URL 后面拼一个 '#.mp4'，骗过 isVideo 函数
          if (asset.mimeType && asset.mimeType.startsWith('video/')) {
            url = url + '#.mp4';
          }
        }

        // D. 其他 (音乐/普通图片背景)
        return {
          id: asset.id,
          type: asset.type,
          name: asset.name,
          src: url,
          price: 0,
          unlocked: true,
        } as GameItem;
      })
    );

    // 合并到 allItems
    newItems.forEach((newItem) => {
      if (newItem && !allItems.value.find((i) => i.id === newItem.id)) {
        allItems.value.push(newItem);
      }
    });
  } catch (e) {
    console.error('加载自定义资源失败', e);
  }
};

const uiSettings = reactive<UISettings>({
  scale: 0.85,
  opacity: 0.9,
  textGlow: 7,
  clockScale: 1.05,
  showPanel: true,
  panelBgOpacity: 0.3,
  panelBorderGlow: 8,
})
const petSettings = reactive<PetSettings>({
  currentPetId: 'cat',
  scale: 3,
  opacity: 0.5,
  walkSpeed: 0.5,
  affection: 0,
  unlockedSets: [],
  petAffections: {}, // 🔥 初始化为空对象
  x: undefined, // 🔥 初始化位置
  y: undefined,
})

const updateUISettings = (newSettings: UISettings) => {
  Object.assign(uiSettings, newSettings)
}
const saveUISettings = (newSettings: UISettings) => {
  Object.assign(uiSettings, newSettings)
  localStorage.setItem('flow-ui-settings', JSON.stringify(uiSettings))
}
const savePetSettings = () => {
  localStorage.setItem('flow-pet-settings', JSON.stringify(petSettings))
}

const isIdle = ref(false)
let idleTimer: any = null
// 🔥 新增：自动隐藏开关状态
const autoHideEnabled = ref(true); // 默认开启
// 🔥 修改：resetIdleTimer 增加开关判断
const resetIdleTimer = () => {
  isIdle.value = false;
  if (idleTimer) clearTimeout(idleTimer);

  // 只有开启了自动隐藏，才启动计时器
  if (autoHideEnabled.value) {
    idleTimer = setTimeout(() => { isIdle.value = true; }, 5000); // 改为 5秒
  }
};

// 🔥 新增：切换自动隐藏函数
const toggleAutoHide = () => {
  autoHideEnabled.value = !autoHideEnabled.value;
  localStorage.setItem('flow-auto-hide', autoHideEnabled.value.toString());

  if (autoHideEnabled.value) {
    ElMessage.success('自动隐藏已开启 (5秒无操作)');
    resetIdleTimer(); // 立即启动计时
  } else {
    ElMessage.info('自动隐藏已关闭 (常亮模式)');
    if (idleTimer) clearTimeout(idleTimer);
    isIdle.value = false; // 立即显示 UI
  }
};

const draggingItem = ref<GameItem | null>(null)
const resizingItem = ref<GameItem | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const resizeStart = ref({ x: 0, width: 0 })
const startDrag = (e: MouseEvent, item: GameItem) => {
  if (resizingItem.value) return
  draggingItem.value = item
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  dragOffset.value.x = e.clientX - rect.left
  dragOffset.value.y = e.clientY - rect.top
}
const startResize = (e: MouseEvent, item: GameItem) => {
  resizingItem.value = item
  const el = (e.target as HTMLElement).closest('.decor-wrapper') as HTMLElement
  resizeStart.value.x = e.clientX
  resizeStart.value.width = el.offsetWidth
}
const removeDecor = (item: GameItem) => {
  item.isActive = false
  saveData()
  ElMessage.success(`已收起 ${item.name}`)
}
const handleGlobalMouseMove = (e: MouseEvent) => {
  resetIdleTimer()
  if (draggingItem.value) {
    e.preventDefault()
    const pxLeft = e.clientX - dragOffset.value.x
    const pxTop = e.clientY - dragOffset.value.y
    const pctLeft = (pxLeft / window.innerWidth) * 100
    const pctTop = (pxTop / window.innerHeight) * 100
    draggingItem.value.x = `${Math.min(Math.max(pctLeft, 0), 95)}%`
    draggingItem.value.y = `${Math.min(Math.max(pctTop, 0), 95)}%`
  }
  if (resizingItem.value) {
    e.preventDefault()
    const dx = e.clientX - resizeStart.value.x
    const newWidthPx = resizeStart.value.width + dx
    if (newWidthPx > 30) resizingItem.value.width = `${newWidthPx}px`
  }
}
const stopAction = () => {
  if (draggingItem.value || resizingItem.value) {
    saveData()
    draggingItem.value = null
    resizingItem.value = null
  }
}
const isVideo = (url: string) => {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  return (
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.webm') ||
    lowerUrl.endsWith('.mov')
  )
}

const loadData = () => {
  const defaultBgImg =
    defaultItems.find((i) => i.id === 'bg1')?.src || '/bg.gif'
  currentBg.value = localStorage.getItem('flow-current-bg') || defaultBgImg
  const savedCoins = localStorage.getItem('flow-coins')
  if (savedCoins) coins.value = parseInt(savedCoins) || 0
  const savedItemsStr = localStorage.getItem('flow-items-state')
  if (savedItemsStr) {
    const savedItems = JSON.parse(savedItemsStr) as GameItem[]
    savedItems.forEach((savedItem) => {
      const target = allItems.value.find((i) => i.id === savedItem.id)
      if (target) {
        target.unlocked = savedItem.unlocked
        if (target.type === 'decor') {
          target.isActive = savedItem.isActive
          if (savedItem.x) target.x = savedItem.x
          if (savedItem.y) target.y = savedItem.y
          if (savedItem.width) target.width = savedItem.width
        }
      }
    })
  }
  const savedAutoBg = localStorage.getItem(AUTO_BG_KEY)
  autoBgEnabled.value = savedAutoBg === 'true'
  const savedUI = localStorage.getItem('flow-ui-settings')
  if (savedUI) {
    try {
      Object.assign(uiSettings, JSON.parse(savedUI))
    } catch (e) { }
  }
  const savedPet = localStorage.getItem('flow-pet-settings')
  if (savedPet) {
    try {
      const parsed = JSON.parse(savedPet)
      Object.assign(petSettings, parsed)

      // 🔥 补全逻辑：如果旧存档没有 petAffections，初始化它
      if (!petSettings.petAffections) {
        petSettings.petAffections = {}
        // 把当前的 affection 赋给当前宠物
        petSettings.petAffections[petSettings.currentPetId] =
          petSettings.affection
      }
    } catch (e) { }
  }

  // 🔥 新增：加载自动隐藏设置
  const savedAutoHide = localStorage.getItem('flow-auto-hide');
  if (savedAutoHide !== null) {
    autoHideEnabled.value = savedAutoHide === 'true';
  }

  applyGlobalStyles()
}

const saveData = () => {
  const stateToSave = allItems.value.map((i) => ({
    id: i.id,
    unlocked: i.unlocked,
    isActive: i.isActive,
    x: i.x,
    y: i.y,
    width: i.width,
  }))
  localStorage.setItem('flow-items-state', JSON.stringify(stateToSave))
  localStorage.setItem('flow-coins', coins.value.toString())
  localStorage.setItem(AUTO_BG_KEY, autoBgEnabled.value.toString())
  // 🔥 新增：保存自动隐藏设置
  localStorage.setItem('flow-auto-hide', autoHideEnabled.value.toString());
}

const AUTO_BG_KEY = 'flow-auto-bg'
const AUTO_BG_INTERVAL_MS = 3 * 60 * 1000 // 3 minutes
const autoBgEnabled = ref(false)
let autoBgTimer: any = null
const startAutoBackgroundCycle = () => {
  if (autoBgTimer) clearInterval(autoBgTimer)
  if (!autoBgEnabled.value) return
  autoBgTimer = setInterval(() => {
    const unlockedBackgrounds = allItems.value.filter(
      (i) => i.type === 'background' && i.unlocked
    )
    if (unlockedBackgrounds.length <= 1) return
    let currentIdx = unlockedBackgrounds.findIndex(
      (bg) => bg.src === currentBg.value
    )
    let nextIdx = (currentIdx + 1) % unlockedBackgrounds.length
    handleEquip(unlockedBackgrounds[nextIdx]!, true)
  }, AUTO_BG_INTERVAL_MS)
}
const stopAutoBackgroundCycle = () => {
  if (autoBgTimer) {
    clearInterval(autoBgTimer)
    autoBgTimer = null
  }
}
const toggleAutoBackground = () => {
  autoBgEnabled.value = !autoBgEnabled.value
  localStorage.setItem(AUTO_BG_KEY, autoBgEnabled.value.toString())
  if (autoBgEnabled.value) {
    startAutoBackgroundCycle()
    ElMessage.success('自动背景切换已开启')
  } else {
    stopAutoBackgroundCycle()
    ElMessage.info('自动背景切换已关闭')
  }
}

const themeConfigs: Record<string, any> = {
  t1: {
    '--text-color': '#ffffff',
    '--accent-color': '#ffffff',
    '--panel-rgb': '0, 0, 0',
    '--panel-border': '1px solid rgba(255, 255, 255, 0.2)',
    '--border-radius': '24px',
  },
  t2: {
    '--text-color': '#00ff00',
    '--accent-color': '#00ff00',
    '--panel-rgb': '0, 20, 0',
    '--panel-border': '1px solid #00ff00',
    '--border-radius': '0px',
  },
  t3: {
    '--text-color': '#333333',
    '--accent-color': '#ff6b6b',
    '--panel-rgb': '255, 255, 255',
    '--panel-border': '1px solid #ccc',
    '--border-radius': '24px',
  },
  t4: {
    '--text-color': '#00ffff',
    '--accent-color': '#ff00ff',
    '--panel-rgb': '20, 0, 40',
    '--panel-border': '2px solid #ff00ff',
    '--border-radius': '16px',
  },
  t5: {
    '--text-color': '#e0f7fa',
    '--accent-color': '#00bcd4',
    '--panel-rgb': '0, 30, 60',
    '--panel-border': '1px solid #00bcd4',
    '--border-radius': '8px',
  },
  t6: {
    '--text-color': '#fff3e0',
    '--accent-color': '#ff9800',
    '--panel-rgb': '60, 30, 0',
    '--panel-border': '1px solid #ff9800',
    '--border-radius': '20px',
  },
  t7: {
    '--text-color': '#dcedc8',
    '--accent-color': '#8bc34a',
    '--panel-rgb': '20, 40, 20',
    '--panel-border': '1px solid #8bc34a',
    '--border-radius': '4px',
  },
  t8: {
    '--text-color': '#ffebee',
    '--accent-color': '#ff4444',
    '--panel-rgb': '40, 0, 0',
    '--panel-border': '1px solid #ff4444',
    '--border-radius': '12px',
  },
  t9: {
    '--text-color': '#f3e5f5',
    '--accent-color': '#e040fb',
    '--panel-rgb': '30, 0, 40',
    '--panel-border': '1px solid #e040fb',
    '--border-radius': '20px',
  },
  t10: {
    '--text-color': '#efebe9',
    '--accent-color': '#d7ccc8',
    '--panel-rgb': '62, 39, 35',
    '--panel-border': '1px solid #8d6e63',
    '--border-radius': '16px',
  },
  t11: {
    '--text-color': '#f1f8e9',
    '--accent-color': '#c5e1a5',
    '--panel-rgb': '51, 105, 30',
    '--panel-border': '1px solid #a5d6a7',
    '--border-radius': '20px',
  },
  t12: {
    '--text-color': '#e0f7fa',
    '--accent-color': '#80deea',
    '--panel-rgb': '0, 96, 100',
    '--panel-border': '1px solid #4dd0e1',
    '--border-radius': '12px',
  },
  t13: {
    '--text-color': '#f3e5f5',
    '--accent-color': '#e1bee7',
    '--panel-rgb': '74, 20, 140',
    '--panel-border': '1px solid #ce93d8',
    '--border-radius': '16px',
  },
  t14: {
    '--text-color': '#3e2723',
    '--accent-color': '#8d6e63',
    '--panel-rgb': '255, 248, 225',
    '--panel-border': '1px solid #d7ccc8',
    '--border-radius': '4px',
  },
  t15: {
    '--text-color': '#c5cae9',
    '--accent-color': '#7986cb',
    '--panel-rgb': '26, 35, 126',
    '--panel-border': '1px solid #3949ab',
    '--border-radius': '12px',
  },
  // t16: 香草奶油 (暖白背景，搭配焦糖色文字，像下午茶)
  t16: {
    '--text-color': '#5d4037', // 深焦糖色
    '--accent-color': '#ffb74d', // 杏黄色高亮
    '--panel-rgb': '255, 253, 231', // 奶油白底色
    '--panel-border': '1px solid #ffcc80', // 浅橙边框
    '--border-radius': '24px',
  },

  // t17: 迷雾森林 (灰绿色系，护眼，像清晨的森林)
  t17: {
    '--text-color': '#e0f2f1', // 极淡绿白
    '--accent-color': '#80cbc4', // 湖水绿
    '--panel-rgb': '38, 50, 56', // 深蓝灰底色 (低对比度)
    '--panel-border': '1px solid #4db6ac', // 青绿边框
    '--border-radius': '16px',
  },

  // t18: 海盐苏打 (清透蓝，像夏天的汽水)
  t18: {
    '--text-color': '#01579b', // 深海蓝
    '--accent-color': '#4fc3f7', // 亮天蓝
    '--panel-rgb': '225, 245, 254', // 极浅蓝底色
    '--panel-border': '1px solid #81d4fa', // 浅蓝边框
    '--border-radius': '24px',
  },

  // t19: 白桃乌龙 (柔和粉，甜美但不腻)
  t19: {
    '--text-color': '#880e4f', // 玫瑰红深色
    '--accent-color': '#f48fb1', // 樱花粉
    '--panel-rgb': '252, 228, 236', // 浅粉底色
    '--panel-border': '1px solid #f06292', // 粉红边框
    '--border-radius': '30px', // 超大圆角
  },

  // t20: 香芋牛奶 (梦幻紫，很轻盈)
  t20: {
    '--text-color': '#4a148c', // 深紫
    '--accent-color': '#ce93d8', // 浅紫
    '--panel-rgb': '243, 229, 245', // 淡紫底色
    '--panel-border': '1px solid #ba68c8', // 紫色边框
    '--border-radius': '20px',
  },

  // t21: 柠檬戚风 (淡黄，充满活力又温和)
  t21: {
    '--text-color': '#e65100', // 橘红深色
    '--accent-color': '#ffcc80', // 浅橘
    '--panel-rgb': '255, 249, 196', // 淡黄底色
    '--panel-border': '1px solid #ffe082', // 黄色边框
    '--border-radius': '12px',
  },

  // t22: 云端漫步 (高级灰，极简主义)
  t22: {
    '--text-color': '#37474f', // 深灰
    '--accent-color': '#90a4ae', // 蓝灰
    '--panel-rgb': '236, 239, 241', // 亮灰底色
    '--panel-border': '1px solid #b0bec5', // 灰色边框
    '--border-radius': '4px', // 微圆角
  },

  // t23: 焦糖布丁 (复古棕，像旧书店)
  t23: {
    '--text-color': '#3e2723', // 咖啡深色
    '--accent-color': '#a1887f', // 浅褐
    '--panel-rgb': '215, 204, 200', // 浅棕底色
    '--panel-border': '1px solid #bcaaa4', // 棕色边框
    '--border-radius': '16px',
  },

  // t24: 抹茶拿铁 (清新绿，像植物一样)
  t24: {
    '--text-color': '#1b5e20', // 森林绿
    '--accent-color': '#a5d6a7', // 嫩绿
    '--panel-rgb': '232, 245, 233', // 浅绿底色
    '--panel-border': '1px solid #81c784', // 绿色边框
    '--border-radius': '24px',
  },

  // t25: 午夜飞行 (深蓝灰，适合深夜独处)
  t25: {
    '--text-color': '#cfd8dc', // 银灰
    '--accent-color': '#78909c', // 蓝灰高亮
    '--panel-rgb': '38, 50, 56', // 深色底色
    '--panel-border': '1px solid #546e7a', // 深蓝边框
    '--border-radius': '8px',
  },

  // 1. 猫咪专属 (肉球粉)
  t_cat_ex: {
    '--text-color': '#3e2723',
    '--accent-color': '#8d6e63',
    '--panel-rgb': '255, 248, 225',
    '--panel-border': '1px solid #d7ccc8',
    '--border-radius': '4px',
  },

  // 2. 柴犬专属 (活力黄)
  t_dog_ex: {
    '--text-color': '#fff3e0',
    '--accent-color': '#ff9800',
    '--panel-rgb': '60, 30, 0',
    '--panel-border': '1px solid #ff9800',
    '--border-radius': '20px',
  },

  // 3. 史莱姆专属 (果冻蓝)
  t_slime_ex: {
    '--text-color': '#f1f8e9',
    '--accent-color': '#c5e1a5',
    '--panel-rgb': '51, 105, 30',
    '--panel-border': '1px solid #a5d6a7',
    '--border-radius': '20px',
  },

  // 4. 月亮鸡专属 (月光银)
  t_chicken_ex: {
    '--text-color': '#37474f', // 深灰
    '--accent-color': '#90a4ae', // 蓝灰
    '--panel-rgb': '236, 239, 241', // 亮灰底色
    '--panel-border': '1px solid #b0bec5', // 灰色边框
    '--border-radius': '4px', // 微圆角
  },

  // 5. 帕丁灰专属 (绅士灰)
  t_gray_ex: {
    '--text-color': '#efebe9',
    '--accent-color': '#d7ccc8',
    '--panel-rgb': '62, 39, 35',
    '--panel-border': '1px solid #8d6e63',
    '--border-radius': '16px',
  },

  // 6. 灵紫专属 (魔法紫)
  t_purple_ex: {
    '--text-color': '#f3e5f5',
    '--accent-color': '#e1bee7',
    '--panel-rgb': '74, 20, 140',
    '--panel-border': '1px solid #ce93d8',
    '--border-radius': '16px',
  },
}

const themeStyles = computed(() => {
  const base = themeConfigs[currentThemeId.value] || themeConfigs['t1']
  const textGlowVal = uiSettings.textGlow
  const textShadow =
    textGlowVal > 0
      ? `0 0 ${textGlowVal}px var(--accent-color), 0 0 ${textGlowVal * 2
      }px var(--accent-color)`
      : 'none'
  const btnDropShadow =
    textGlowVal > 0
      ? `drop-shadow(0 0 ${textGlowVal * 0.8}px var(--accent-color))`
      : 'none'

  const showPanel = uiSettings.showPanel !== false
  const panelBg = showPanel
    ? `rgba(${base['--panel-rgb']}, ${uiSettings.panelBgOpacity})`
    : 'transparent'
  const panelBorder = showPanel ? base['--panel-border'] : 'none'
  const borderGlow =
    showPanel && uiSettings.panelBorderGlow > 0
      ? `0 0 ${uiSettings.panelBorderGlow}px var(--accent-color)`
      : 'none'

  // 🔥🔥🔥 核心修复 3：新增按钮样式变量 🔥🔥🔥
  // 如果面板隐藏，按钮也就去掉背景和边框，只留文字/图标
  /*   const btnBg = showPanel ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
  const btnBorder = showPanel ? '1px solid var(--text-color)' : 'none' */

  return {
    ...base,
    '--ui-panel-bg': panelBg,
    '--ui-panel-border': panelBorder,
    '--ui-panel-box-shadow': borderGlow,
    '--ui-scale': uiSettings.scale,
    '--ui-opacity': uiSettings.opacity,
    '--ui-text-shadow': textShadow,
    '--ui-btn-filter': btnDropShadow,
    '--ui-clock-scale': uiSettings.clockScale || 1.25,
  }
})

const applyGlobalStyles = () => {
  const root = document.documentElement
  const theme = themeConfigs[currentThemeId.value] || themeConfigs['t1']
  Object.keys(theme).forEach((key) => {
    root.style.setProperty(key, theme[key])
  })
  const fontItem = allItems.value.find((i) => i.id === currentFontId.value)
  const fontValue = fontItem ? fontItem.src : "'DotGothic16', monospace"
  root.style.setProperty('--font-family', fontValue)
  const currentStyles = themeStyles.value
  Object.keys(currentStyles).forEach((key) => {
    if (
      typeof currentStyles[key] === 'string' ||
      typeof currentStyles[key] === 'number'
    ) {
      root.style.setProperty(key, String(currentStyles[key]))
    }
  })
}

function debounce(fn: Function, delay: number) {
  let timeoutId: any
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
const debouncedApplyStyles = debounce(applyGlobalStyles, 100)
watch([currentThemeId, currentFontId], () => {
  applyGlobalStyles()
})
watch(uiSettings, () => {
  debouncedApplyStyles()
})

const handleBuy = (item: GameItem) => {
  if (item.id === 'mystery_box') {
    const boxPrice = item.price
    const prize = (item as any)._prize as GameItem
    const isNew = (item as any)._isNew
    coins.value -= boxPrice
    if (isNew) {
      const realItem = allItems.value.find((i) => i.id === prize.id)
      if (realItem) {
        realItem.unlocked = true
        ElNotification({
          title: '欧皇时刻！✨',
          message: `恭喜！你抽中了：${prize.name}`,
          type: 'success',
          duration: 5000,
        })
      }
    } else {
      const refund = Math.floor(boxPrice / 2)
      coins.value += refund
      ElNotification({
        title: '哎呀，重复了',
        message: `分解获得 ${refund} 金币补偿。`,
        type: 'info',
        duration: 3000,
      })
    }
  } else {
    coins.value -= item.price
    item.unlocked = true
    ElMessage.success(`成功解锁: ${item.name}`)
  }
  saveData()
}
const handleEquip = (item: GameItem, silent = false) => {
  if (item.type === 'background') {
    currentBg.value = item.src
    localStorage.setItem('flow-current-bg', item.src)
    if (autoBgEnabled.value && !silent) {
      stopAutoBackgroundCycle()
      startAutoBackgroundCycle()
    }
  } else if (item.type === 'theme') {
    currentThemeId.value = item.id
    localStorage.setItem('flow-current-theme-id', item.id)
  } else if (item.type === 'font') {
    currentFontId.value = item.id
    localStorage.setItem('flow-current-font-id', item.id)
  } else if (item.type === 'set' && item.contentIds) {
    item.contentIds.forEach((id) => {
      const subItem = allItems.value.find((i) => i.id === id)
      if (subItem) handleEquip(subItem, true)
    })
    if (!silent) ElMessage.success(`套装 ${item.name} 已配置！`)
    return
  }
  if (!silent) ElMessage.success(`已应用: ${item.name}`)
}
const handleEquipPet = (item: GameItem) => {
  // 1. 保存当前宠物的好感度
  petSettings.petAffections[petSettings.currentPetId] = petSettings.affection

  // 2. 切换 ID
  petSettings.currentPetId = item.src

  // 3. 读取新宠物的好感度 (如果没有记录，默认为 0)
  petSettings.affection = petSettings.petAffections[item.src] || 0

  savePetSettings()
  ElMessage.success(`桌宠已切换为: ${item.name}`)
}
const handleToggleDecor = (item: GameItem) => {
  item.isActive = !item.isActive
  if (item.isActive && !item.x) {
    item.x = '50%'
    item.y = '50%'
    item.width = '100px'
  }
  saveData()
  ElMessage.success(
    item.isActive ? `摆放了: ${item.name}` : `收起了: ${item.name}`
  )
}
const handleAffectionUpdate = (val: number) => {
  // 累加好感度，上限 100
  petSettings.affection = Math.min(100, petSettings.affection + val)

  checkSetUnlock()
  savePetSettings()

  // (可选) 增加一点金币作为奖励
  coins.value += val
  localStorage.setItem('flow-coins', coins.value.toString())
}

// 🔥🔥🔥 2. 新增：保存桌宠位置 🔥🔥🔥
const handlePetPositionSave = (pos: { x: number; y: number }) => {
  petSettings.x = pos.x
  petSettings.y = pos.y
  savePetSettings()
}
const handleFeedPet = (snack: GameItem) => {
  coins.value -= snack.price
  localStorage.setItem('flow-coins', coins.value.toString())
  handleAffectionUpdate(snack.affinity || 5)
  petRef.value?.feed()
}
const checkSetUnlock = () => {
  const map: Record<string, string> = {
    cat: 'set_limit_cat',
    dog: 'set_limit_dog',
    slime: 'set_limit_slime',
    chicken: 'set_limit_chicken',
    gray: 'set_limit_gray',
    purple: 'set_limit_purple',
  }
  const targetSetId = map[petSettings.currentPetId]
  if (
    petSettings.affection >= 100 &&
    targetSetId &&
    !petSettings.unlockedSets.includes(targetSetId)
  ) {
    petSettings.unlockedSets.push(targetSetId)
    const setItem = allItems.value.find((i) => i.id === targetSetId)
    if (setItem) {
      setItem.unlocked = true
      setItem.contentIds?.forEach((id) => {
        const sub = allItems.value.find((i) => i.id === id)
        if (sub) sub.unlocked = true
      })
      saveData()
      savePetSettings()
      ElNotification({
        title: '❤️ 羁绊达成！',
        message: `与 ${setItem.name} 的好感度已满，专属套装已解锁！`,
        type: 'success',
        duration: 8000,
      })
    }
  }
}
const handleFocusFinish = (minutes: number) => {
  if (minutes > 0) {
    coins.value += minutes
    saveData()
    ElNotification({
      title: '专注完成！',
      message: `获得 ${minutes} 金币奖励 💰`,
      type: 'success',
    })

    // 🔥🔥🔥 新增：自动上传成绩 🔥🔥🔥
    const username = localStorage.getItem('flow-username') || '无名专注者'
    uploadScore(
      username,
      currentStats.value.minutes,
      currentStats.value.days,
      petSettings.currentPetId
    )
  }
}
const toggleFullscreen = () => {
  if (!document.fullscreenElement)
    document.documentElement.requestFullscreen().catch(() => { })
  else if (document.exitFullscreen) document.exitFullscreen()
}
const handleKeydown = (e: KeyboardEvent) => {
  resetIdleTimer()
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
  if (!musicBarRef.value) return
  switch (e.code) {
    case 'Space':
      e.preventDefault()
      musicBarRef.value.togglePlay()
      break
    case 'KeyM':
      musicBarRef.value.toggleMute()
      break
    case 'ArrowRight':
      musicBarRef.value.nextSong()
      break
    case 'ArrowLeft':
      musicBarRef.value.prevSong()
      break
    case 'KeyF':
      toggleFullscreen()
      break
    case 'KeyT':
      e.preventDefault()
      focusTimerRef.value?.openSetting()
      break
    case 'KeyS':
      e.preventDefault()
      shopVisible.value = !shopVisible.value
      break
    case 'KeyL':
      e.preventDefault()
      statsVisible.value = !statsVisible.value
      break
    case 'KeyA':
      e.preventDefault()
      toggleAutoBackground()
      break
    case 'KeyH':
      e.preventDefault()
      uiSettingsVisible.value = !uiSettingsVisible.value
      break
    case 'KeyP':
      e.preventDefault()
      petModalVisible.value = !petModalVisible.value
      break
    case 'KeyD':
      e.preventDefault()
      calendarVisible.value = !calendarVisible.value
      break
    // 🔥 新增快捷键
    case 'KeyJ': // J: 切换自动隐藏
      e.preventDefault();
      toggleAutoHide();
      break;
    case 'KeyR': // R: 打开排行榜
      e.preventDefault();
      rankingVisible.value = !rankingVisible.value; // 注意：你需要确保有 rankingVisible 变量
      break;
  }
}
// 修改 onMounted
onMounted(async () => {
  // 🔥 加上 async
  await loadCustomAssets() // 🔥 先加载自定义资源
  loadData() // 再加载存档状态

  if (autoBgEnabled.value) startAutoBackgroundCycle()
  window.addEventListener('keydown', handleKeydown)
  resetIdleTimer()
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (idleTimer) clearTimeout(idleTimer)
  if (autoBgTimer) clearInterval(autoBgTimer)
})
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1a1a1a;
}

#app {
  height: 100%;
}

html {
  font-family: var(--font-family, 'DotGothic16', monospace);
}

/* 🔥🔥🔥 核心修复 4：滚动条样式美化 🔥🔥🔥 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--accent-color);
  border-radius: 4px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
}

.el-dialog,
.el-popover {
  background: var(--ui-panel-bg) !important;
  border: var(--ui-panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
  box-shadow: var(--ui-panel-box-shadow) !important;
}
</style>

<style scoped>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  color: var(--text-color);
  font-family: var(--font-family);

}

.background-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background-color: #000;
}

.bg-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
  transform: translateZ(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 80px);
  z-index: 10;
  pointer-events: none;
}

.hud-item {
  pointer-events: auto;
  position: absolute;
  transform: scale(var(--ui-scale));
  opacity: var(--ui-opacity);

  /* 🔥 修复：应用发光变量 🔥 */
  box-shadow: var(--ui-panel-box-shadow);

  background-clip: padding-box;
  transform-origin: center center;
  transition: opacity 0.5s ease-in-out, transform 0.2s ease-out;
  will-change: opacity, transform;
  border: none !important;
  background: var(--ui-panel-bg);
  backdrop-filter: none;
  border-radius: var(--border-radius);
}

.hud-item.custom-clock-scale {
  transform: rotate(-2deg) scale(calc(var(--ui-scale) * var(--ui-clock-scale))) translateZ(0) !important;
}

:deep(.todo-card),
:deep(.timer-card),
:deep(.ambience-panel) {
  background: transparent !important;
  backdrop-filter: none !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.desk-clock-pos .digit),
:deep(.desk-clock-pos .colon),
:deep(.timer-card .time-display) {
  text-shadow: var(--ui-text-shadow) !important;
}

/* :deep(.timer-card .main-btn) {
  box-shadow: none !important;
  border: 1px solid var(--text-color);
} */

:deep(.timer-card .main-btn) {
  box-shadow: none !important;
  /* 改用变量 */
  border: var(--ui-btn-border) !important;
  background: var(--ui-btn-bg) !important;
  transition: all 0.3s ease;
  /* 加个过渡更好看 */
}

/* 悬停时稍微加深一点背景，或者保持原样 */
:deep(.timer-card .main-btn:hover) {
  background: rgba(255, 255, 255, 0.2) !important;
  /* 悬停时给一点反馈 */
  border-color: var(--accent-color) !important;
}

:deep(.timer-card .main-btn .el-icon),
:deep(.timer-card .main-btn .btn-text) {
  filter: var(--ui-btn-filter) !important;
  color: #fff;
}

.coin-display {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--ui-panel-bg);
  backdrop-filter: none;
  padding: 0 12px;
  height: 40px;
  border-radius: var(--border-radius);
  margin-right: 10px;
  border: var(--ui-panel-border);
  box-shadow: var(--ui-panel-box-shadow);
}

.coin-text {
  font-family: inherit;
  font-size: 24px;
  line-height: 1;
  color: var(--accent-color);
}

.coin-icon {
  color: var(--accent-color);
}

.ui-fade {
  transition: opacity 0.5s ease-in-out, transform 0.5s ease;
}

.ui-hidden {
  opacity: 0 !important;
  pointer-events: none;
}

.decor-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.decor-wrapper {
  position: absolute;
  pointer-events: auto;
  user-select: none;
}

.decor-box {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  cursor: grab;
}

.decor-box:active {
  cursor: grabbing;
}

.decor-img {
  width: 100%;
  display: block;
  image-rendering: pixelated;
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.5));
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background-color: var(--accent-color);
  border: 1px solid #fff;
  border-radius: 50%;
  cursor: nwse-resize;
  display: none;
  z-index: 10;
}

.close-btn {
  position: absolute;
  top: -10px;
  left: -10px;
  color: #f56c6c;
  font-size: 20px;
  cursor: pointer;
  display: none;
  z-index: 11;
  background: white;
  border-radius: 50%;
}

.decor-wrapper:hover .decor-box,
.decor-wrapper.is-interacting .decor-box {
  border-color: var(--accent-color);
  background: rgba(255, 255, 255, 0.1);
}

.decor-wrapper:hover .resize-handle,
.decor-wrapper.is-interacting .resize-handle {
  display: block;
}

.decor-wrapper:hover .close-btn,
.decor-wrapper.is-interacting .close-btn {
  display: block;
}

.top-left {
  top: 40px;
  left: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transform-origin: top left;
}

/* 🔥🔥🔥 修复 1：缩放原点修正 🔥🔥🔥 */
.top-right-zone {
  position: absolute;
  top: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 25px;
  pointer-events: none;
}

.top-right-zone>.hud-item {
  pointer-events: auto;
  position: relative;
  top: auto;
  right: auto;
  /* 强制子元素也以右上角为缩放基准 */
  transform-origin: top right !important;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tool-btn {
  width: 40px;
  height: 40px;
  background: var(--ui-panel-bg);
  backdrop-filter: none;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: var(--accent-color);
  border: var(--ui-panel-border);
  transition: all 0.2s;
  box-shadow: var(--ui-panel-box-shadow);
}

.tool-btn:hover {
  background: var(--text-color);
  color: #000;
  transform: scale(1.1);
}

/* 🔥🔥🔥 修复：激活状态样式 (不再变实心块，改为发光风格) 🔥🔥🔥 */
.tool-btn.is-active {
  /* 背景保持面板的半透明色，不变成实心 */
  background: var(--ui-panel-bg);

  /* 图标颜色变成主题强调色 */
  color: var(--accent-color);

  /* 边框变成强调色 */
  border: 1px solid var(--accent-color) !important;

  /* 添加外发光 + 内发光，营造“点亮”的效果 */
  box-shadow: 0 0 8px var(--accent-color), inset 0 0 5px var(--accent-color);
}

.desk-clock-pos {
  bottom: 120px;
  left: 20%;
  transform: rotate(-2deg);
  transform-origin: bottom center;
}

.bottom-right {
  bottom: 20px;
  right: 40px;
  transform-origin: bottom right;
}

.bottom-dock {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  z-index: 20;
  opacity: var(--ui-opacity);
  transition: opacity 0.5s;
  background: var(--ui-panel-bg) !important;
  backdrop-filter: blur(10px);
  border-top: var(--ui-panel-border) !important;
  box-shadow: var(--ui-panel-box-shadow);
}

.bottom-dock:hover {
  opacity: 1 !important;
}
</style>

<style>
/* 🔥🔥🔥 新增：覆盖 ElMessageBox 样式，让确认弹窗也跟随主题 🔥🔥🔥 */
.el-message-box {
  background: var(--ui-panel-bg) !important;
  /* 跟随面板背景 */
  border: var(--ui-panel-border) !important;
  /* 跟随面板边框 */
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
  box-shadow: var(--ui-panel-box-shadow) !important;
  --el-message-box-title-color: var(--text-color);
  --el-message-box-content-color: var(--text-color);
}

/* 标题 */
.el-message-box__title {
  color: var(--text-color) !important;
  font-family: inherit !important;
  font-weight: bold;
}

/* 内容文字 */
.el-message-box__message,
.el-message-box__content {
  color: var(--text-color) !important;
  font-family: inherit !important;
}

/* 关闭按钮 (右上角X) */
.el-message-box__headerbtn .el-message-box__close {
  color: var(--text-color) !important;
}

.el-message-box__headerbtn .el-message-box__close:hover {
  color: var(--accent-color) !important;
}

/* 底部按钮区域 */
.el-message-box__btns button {
  font-family: inherit !important;
}

/* 取消按钮 */
.el-message-box__btns .el-button:not(.el-button--primary) {
  background: transparent !important;
  border: 1px solid var(--text-color) !important;
  color: var(--text-color) !important;
}

.el-message-box__btns .el-button:not(.el-button--primary):hover {
  opacity: 0.8;
}

/* 确认按钮 (primary) */
.el-message-box__btns .el-button--primary {
  background: var(--accent-color) !important;
  border-color: var(--accent-color) !important;
  color: #000 !important;
  /* 确认按钮文字黑色 */
  font-weight: bold;
}

.el-message-box__btns .el-button--primary:hover {
  opacity: 0.9;
  transform: scale(1.05);
}
</style>