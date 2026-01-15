<template>
  <el-dialog :model-value="visible" title="心流百货商店" width="750px" center :before-close="handleClose" class="shop-dialog">
    <div class="shop-header">
      <div class="tabs">
        <span v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: currentTab === tab.key }"
          @click="currentTab = tab.key">
          {{ tab.label }}
        </span>
      </div>

      <!-- 🔥🔥🔥 新增：上传按钮 (仅在 场景/磁带 Tab 显示) 🔥🔥🔥 -->
      <div v-if="['background', 'music', 'font', 'decor'].includes(currentTab)" class="upload-zone">
        <button class="upload-btn" @click="triggerUpload">
          ➕ 上传{{ getUploadLabel(currentTab) }}
        </button>
        <input type="file" ref="fileInput" style="display: none" :accept="getAcceptType(currentTab)"
          @change="handleFileChange" />
      </div>

      <span class="my-coins">余额: 💰 {{ userCoins }}</span>
    </div>

    <div class="items-grid">
      <div v-for="item in filteredItems" :key="item.id" class="shop-item" :class="{
        'is-active': isEquipped(item),
        'is-locked': !item.unlocked && item.id !== 'mystery_box',
        'is-box': item.id === 'mystery_box',
      }" @click="handleItemClick(item)">
        <div class="item-preview" :style="getItemStyle(item)">
          <div v-if="item.id === 'mystery_box'" class="box-icon" :class="{ 'shake-anim': isOpening }">
            🎁
          </div>
          <img v-else-if="
            ['background', 'decor', 'pet', 'set'].includes(item.type)
          " :src="getPreviewSrc(item)" class="item-img" />
          <div v-else-if="item.type === 'music'" class="music-icon">🎵</div>
          <div v-else-if="item.type === 'theme'" class="theme-block" :style="{ background: item.src }">
            Aa
          </div>
          <div v-else-if="item.type === 'font'" class="font-block" :style="{ fontFamily: item.src }">
            Aa
          </div>
        </div>

        <div class="item-overlay">
          <div v-if="item.id === 'mystery_box'" class="price-tag box-btn">
            抽奖 ({{ item.price }})
          </div>
          <div v-else-if="item.price > 10000" class="price-tag limit-tag">
            好感度限定
          </div>
          <template v-else>
            <div v-if="item.unlocked" class="status-badge">
              {{ isEquipped(item) ? '使用中' : '点击使用' }}
            </div>
            <div v-else class="price-tag">💰 {{ item.price }}</div>
          </template>
        </div>

        <div class="item-name">{{ item.name }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { GameItem, ItemType } from '../types'
import { saveAsset } from '../utils/db' // 🔥 引入保存方法

const props = defineProps<{
  visible: boolean
  userCoins: number
  items: GameItem[]
  currentBg: string
  currentTheme: string
  currentFont: string
  currentPetId?: string
}>()

const emit = defineEmits([
  'update:visible',
  'buy',
  'equip',
  'toggle-decor',
  'equip-pet',
])

const fileInput = ref<HTMLInputElement | null>(null)
const currentTab = ref<ItemType | 'all'>('all')
const isOpening = ref(false)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'background', label: '场景' },
  { key: 'theme', label: '主题' },
  { key: 'font', label: '字体' },
  { key: 'music', label: '磁带' },
  { key: 'decor', label: '摆件' },
  { key: 'pet', label: '桌宠' },
  { key: 'set', label: '套装' },
] as const

const getPreviewSrc = (item: GameItem) => {
  // 1. 如果有专门的封面配置，优先用封面
  if (item.cover) return item.cover

  // 2. 如果是桌宠，用 idle 动图
  if (item.type === 'pet') return `pet/${item.src}_idle.gif`

  // 3. 默认情况
  return item.src
}

// 🔥🔥🔥 修复：严格过滤盲盒 🔥🔥🔥
const filteredItems = computed(() => {
  let list = props.items

  if (currentTab.value !== 'all') {
    // 1. 先按类型筛选
    list = list.filter((i) => i.type === currentTab.value)
    // 2. 强制移除盲盒 (即使它的类型是 decor，也不要在 decor 栏显示)
    list = list.filter((i) => i.id !== 'mystery_box')
    return list
  } else {
    // 全部标签页：隐藏零食，显示盲盒
    list = list.filter((i) => i.type !== 'snack')
    const box = props.items.find((i) => i.id === 'mystery_box')
    const others = list.filter((i) => i.id !== 'mystery_box')
    return box ? [box, ...others] : others
  }
})

const isEquipped = (item: GameItem) => {
  if (item.type === 'background') return item.src === props.currentBg
  if (item.type === 'theme') return item.id === props.currentTheme
  if (item.type === 'font') return item.id === props.currentFont
  if (item.type === 'decor') return item.isActive
  if (item.type === 'pet') return item.src === props.currentPetId
  return false
}

const getItemStyle = (item: GameItem) => {
  if (item.type === 'decor' || item.type === 'pet') return { padding: '10px' }
  return {}
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleItemClick = async (item: GameItem) => {
  if (item.id === 'mystery_box') {
    handleMysteryBox(item)
    return
  }
  if (item.price > 10000 && !item.unlocked) {
    ElMessage.warning('该套装需要对应桌宠好感度达到 100% 才能解锁哦！')
    return
  }
  if (item.unlocked) {
    if (item.type === 'decor') emit('toggle-decor', item)
    else if (item.type === 'pet') emit('equip-pet', item)
    else if (item.type === 'set') emit('equip', item)
    else if (item.type === 'music') ElMessage.info('请在播放器选择')
    else emit('equip', item)
    return
  }
  if (props.userCoins >= item.price) {
    ElMessageBox.confirm(`花费 ${item.price} 解锁？`, '购买', {
      type: 'warning',
    })
      .then(() => emit('buy', item))
      .catch(() => { })
  } else {
    ElMessage.error('金币不足')
  }
}

const handleMysteryBox = (boxItem: GameItem) => {
  if (props.userCoins < boxItem.price) {
    ElMessage.error('金币不足')
    return
  }
  if (isOpening.value) return
  ElMessageBox.confirm(`花费 ${boxItem.price} 金币开启神秘盲盒！`, '盲盒抽奖', {
    confirmButtonText: '开启！',
    cancelButtonText: '算了',
    type: 'info',
  })
    .then(() => startGacha(boxItem))
    .catch(() => { })
}

const startGacha = (boxItem: GameItem) => {
  isOpening.value = true

  // 🔥🔥🔥 核心修复：增加价格过滤 (i.price < 10000) 🔥🔥🔥
  // 这样就排除了 限定套装(99999) 和 专属物品(99999)
  // 但保留了 普通桌宠(500-2000)、普通背景、普通主题等

  const lockedItems = props.items.filter(
    (i) => !i.unlocked && i.id !== 'mystery_box' && i.price < 10000 // <--- 关键修改
  )

  const allValidItems = props.items.filter(
    (i) => i.id !== 'mystery_box' && i.price < 10000 // <--- 关键修改 (兜底池也排除限定品)
  )

  setTimeout(() => {
    isOpening.value = false
    let prize: GameItem
    let isNew = false

    if (lockedItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * lockedItems.length)
      prize = lockedItems[randomIndex]!
      isNew = true
    } else {
      // 如果普通物品全解锁了，就从所有普通物品里随一个（返金币）
      if (allValidItems.length === 0) return
      const randomIndex = Math.floor(Math.random() * allValidItems.length)
      prize = allValidItems[randomIndex]!
      isNew = false
    }

    // 触发购买
    emit('buy', { ...boxItem, _prize: prize, _isNew: isNew })
  }, 1500)
}

// 🔥🔥🔥 新增：上传逻辑 🔥🔥🔥
const triggerUpload = () => {
  fileInput.value?.click()
}

// 🔥 辅助函数：显示按钮文字
const getUploadLabel = (tab: string) => {
  const map: Record<string, string> = {
    background: '壁纸',
    music: '音乐',
    font: '字体',
    decor: '摆件',
  }
  return map[tab] || '文件'
}

// 🔥 辅助函数：限制文件类型
const getAcceptType = (tab: string) => {
  if (tab === 'music') return 'audio/*'
  if (tab === 'font') return '.ttf,.otf,.woff,.woff2' // 字体格式
  return 'image/*,video/mp4' // 背景和摆件都是图片(摆件一般是gif/png)
}

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('文件太大啦！请上传 50MB 以内的文件')
    return
  }

  // 🔥 类型断言更新
  const type = currentTab.value as 'background' | 'music' | 'font' | 'decor'
  const id = `custom_${Date.now()}`

  try {
    await saveAsset({
      id,
      type,
      name: file.name,
      blob: file,
      mimeType: file.type,
    })

    ElMessage.success('上传成功！正在刷新应用...')
    setTimeout(() => location.reload(), 1000)
  } catch (err) {
    console.error(err)
    ElMessage.error('上传失败，请重试')
  }
}
</script>

<style scoped>
/* 保持原有样式 */
.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--text-color);
  padding-bottom: 10px;
}

.tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.tab-item {
  cursor: pointer;
  color: var(--text-color);
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
  transition: 0.2s;
  opacity: 0.7;
  white-space: nowrap;
}

.tab-item:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
  color: #000;
  background: var(--accent-color);
  opacity: 1;
}

.my-coins {
  font-size: 18px;
  font-weight: bold;
  color: var(--accent-color);
  white-space: nowrap;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.shop-item {
  position: relative;
  background: #2b2b2b;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;
}

.shop-item:hover {
  transform: translateY(-3px);
  border-color: #666;
}

.shop-item.is-active {
  border-color: var(--accent-color);
}

.shop-item.is-box {
  border-color: #f56c6c;
  background: #4a2b2b;
}

.shop-item.is-box:hover {
  border-color: #ff4444;
}

.box-icon {
  font-size: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.box-btn {
  background: #f56c6c !important;
  color: #fff !important;
}

.shake-anim {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.item-preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  overflow: hidden;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-icon {
  font-size: 40px;
  color: var(--accent-color);
}

.theme-block {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #000;
  border: 2px solid #fff;
}

.font-block {
  font-size: 24px;
  color: #fff;
  text-align: center;
  line-height: 1.2;
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.shop-item.is-locked .item-overlay,
.shop-item.is-box .item-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.7);
}

.shop-item:hover .item-overlay {
  opacity: 1;
}

.price-tag {
  background: var(--accent-color);
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: bold;
}

.limit-tag {
  background: #f56c6c;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge {
  background: #67c23a;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.item-name {
  padding: 8px;
  text-align: center;
  color: #ddd;
  font-size: 14px;
  background: #222;
}

/* 🔥 上传按钮样式 */
.upload-zone {
  margin-right: auto;
  margin-left: 20px;
}

.upload-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed var(--text-color);
  color: var(--text-color);
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s;
}

.upload-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--accent-color);
  color: var(--accent-color);
}
</style>

<style>
.shop-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
}
</style>
