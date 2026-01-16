<template>
  <el-dialog :model-value="visible" title="心流百货商店" width="750px" center :before-close="handleClose" class="shop-dialog">
    <div class="shop-header">
      <div class="tabs">
        <span v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: currentTab === tab.key }"
          @click="currentTab = tab.key">
          {{ tab.label }}
        </span>
      </div>

      <div v-if="['background', 'music', 'font', 'decor'].includes(currentTab)" class="upload-zone">
        <button class="upload-btn" @click="triggerUpload">
          ➕ 批量上传{{ getUploadLabel(currentTab) }}
        </button>
        <input type="file" ref="fileInput" multiple style="display: none" :accept="getAcceptType(currentTab)"
          @change="handleFileChange" />
      </div>

      <span class="my-coins">余额: 💰 {{ userCoins }}</span>
    </div>

    <div class="items-grid">
      <div v-for="item in filteredItems" :key="item.id" class="shop-item" :class="{
        'is-active': isEquipped(item),
        'is-locked': !item.unlocked && item.id !== 'mystery_box',
        'is-box': item.id === 'mystery_box'
      }" @click="handleItemClick(item)">
        <div class="item-preview" :style="getItemStyle(item)">
          <!-- 1. 盲盒 -->
          <div v-if="item.id === 'mystery_box'" class="box-icon" :class="{ 'shake-anim': isOpening }">🎁</div>

          <!-- 🔥🔥🔥 2. 视频预览 (新增) 🔥🔥🔥 -->
          <video v-else-if="isVideo(getPreviewSrc(item))" :src="getPreviewSrc(item)" class="item-img" autoplay loop
            muted playsinline></video>

          <!-- 3. 图片预览 (背景/摆件/桌宠) -->
          <img v-else-if="['background', 'decor', 'pet', 'set'].includes(item.type)" :src="getPreviewSrc(item)"
            class="item-img" />

          <!-- 4. 音乐 -->
          <div v-else-if="item.type === 'music'" class="music-icon">🎵</div>
          <!-- 5. 主题 -->
          <div v-else-if="item.type === 'theme'" class="theme-block" :style="{ background: item.src }">Aa</div>
          <!-- 6. 字体 -->
          <div v-else-if="item.type === 'font'" class="font-block" :style="{ fontFamily: item.src }">Aa</div>
        </div>

        <div class="item-overlay">
          <div v-if="item.id === 'mystery_box'" class="price-tag box-btn">抽奖 ({{ item.price }})</div>
          <div v-else-if="item.price > 10000" class="price-tag limit-tag">好感度限定</div>
          <template v-else>
            <div v-if="item.unlocked" class="status-badge">{{ isEquipped(item) ? '使用中' : '点击使用' }}</div>
            <div v-else class="price-tag">💰 {{ item.price }}</div>
          </template>
        </div>

        <div class="item-name">{{ item.name }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { GameItem, ItemType } from '../types';
import { saveAsset } from '../utils/db';

const props = defineProps<{
  visible: boolean;
  userCoins: number;
  items: GameItem[];
  currentBg: string;
  currentTheme: string;
  currentFont: string;
  currentPetId?: string;
}>();

const emit = defineEmits(['update:visible', 'buy', 'equip', 'toggle-decor', 'equip-pet']);

const currentTab = ref<ItemType | 'all'>('all');
const isOpening = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'background', label: '场景' },
  { key: 'music', label: '磁带' },
  { key: 'theme', label: '主题' },
  { key: 'font', label: '字体' },
  { key: 'decor', label: '摆件' },
  { key: 'pet', label: '桌宠' },
  { key: 'set', label: '套装' },
] as const;

// 🔥 辅助函数：判断是否为视频
const isVideo = (url: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.mov');
};

const getPreviewSrc = (item: GameItem) => {
  if (item.cover) return item.cover;
  if (item.type === 'pet') return `/pet/${item.src}_idle.gif`;
  return item.src;
};

const filteredItems = computed(() => {
  let list = props.items;
  if (currentTab.value !== 'all') {
    list = list.filter(i => i.type === currentTab.value);
    list = list.filter(i => i.id !== 'mystery_box');
    return list;
  }
  list = list.filter(i => i.type !== 'snack');
  const box = props.items.find(i => i.id === 'mystery_box');
  const others = list.filter(i => i.id !== 'mystery_box');
  return box ? [box, ...others] : others;
});

const isEquipped = (item: GameItem) => {
  if (item.type === 'background') return item.src === props.currentBg;
  if (item.type === 'theme') return item.id === props.currentTheme;
  if (item.type === 'font') return item.id === props.currentFont;
  if (item.type === 'decor') return item.isActive;
  if (item.type === 'pet') return item.src === props.currentPetId;
  return false;
};

const getItemStyle = (item: GameItem) => {
  if (item.type === 'decor' || item.type === 'pet') return { padding: '10px' };
  return {};
};

const handleClose = () => { emit('update:visible', false); };

const handleItemClick = async (item: GameItem) => {
  if (item.id === 'mystery_box') { handleMysteryBox(item); return; }
  if (item.price > 10000 && !item.unlocked) { ElMessage.warning('该套装需要对应桌宠好感度达到 100% 才能解锁哦！'); return; }
  if (item.unlocked) {
    if (item.type === 'decor') emit('toggle-decor', item);
    else if (item.type === 'pet') emit('equip-pet', item);
    else if (item.type === 'set') emit('equip', item);
    else if (item.type === 'music') ElMessage.info('请在播放器选择');
    else emit('equip', item);
    return;
  }
  if (props.userCoins >= item.price) {
    ElMessageBox.confirm(`花费 ${item.price} 解锁？`, '购买', { type: 'warning' }).then(() => emit('buy', item)).catch(() => { });
  } else { ElMessage.error('金币不足'); }
};

const handleMysteryBox = (boxItem: GameItem) => {
  if (props.userCoins < boxItem.price) { ElMessage.error('金币不足'); return; }
  if (isOpening.value) return;
  ElMessageBox.confirm(`花费 ${boxItem.price} 金币开启神秘盲盒！`, '盲盒抽奖', { confirmButtonText: '开启！', cancelButtonText: '算了', type: 'info' })
    .then(() => startGacha(boxItem)).catch(() => { });
};

const startGacha = (boxItem: GameItem) => {
  isOpening.value = true;
  const lockedItems = props.items.filter(i => !i.unlocked && i.id !== 'mystery_box' && i.price < 10000);
  const allValidItems = props.items.filter(i => i.id !== 'mystery_box' && i.price < 10000);
  setTimeout(() => {
    isOpening.value = false;
    let prize: GameItem;
    let isNew = false;
    if (lockedItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * lockedItems.length);
      prize = lockedItems[randomIndex]!;
      isNew = true;
    } else {
      if (allValidItems.length === 0) return;
      const randomIndex = Math.floor(Math.random() * allValidItems.length);
      prize = allValidItems[randomIndex]!;
      isNew = false;
    }
    emit('buy', { ...boxItem, _prize: prize, _isNew: isNew });
  }, 1500);
};

const getUploadLabel = (tab: string) => {
  const map: Record<string, string> = { background: '壁纸', music: '音乐', font: '字体', decor: '摆件' };
  return map[tab] || '文件';
};

const getAcceptType = (tab: string) => {
  if (tab === 'music') return 'audio/*';
  if (tab === 'font') return '.ttf,.otf,.woff,.woff2';
  return 'image/*,video/mp4';
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  const type = currentTab.value as 'background' | 'music' | 'font' | 'decor';
  let successCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    if (file.size > 50 * 1024 * 1024) {
      errors.push(`${file.name} 太大(>50MB)`);
      continue;
    }
    const id = `custom_${Date.now()}_${i}`;
    try {
      await saveAsset({ id, type, name: file.name, blob: file, mimeType: file.type });
      successCount++;
    } catch (err) {
      console.error(err);
      errors.push(`${file.name} 保存失败`);
    }
  }

  if (successCount > 0) {
    ElMessage.success(`成功上传 ${successCount} 个文件！正在刷新...`);
    setTimeout(() => location.reload(), 1000);
  }
  if (errors.length > 0) {
    ElMessage.warning(`部分失败: ${errors.join(', ')}`);
  }
  input.value = '';
};
</script>

<style scoped>
/* ... (样式保持不变，直接复用之前的) ... */
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
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both infinite;
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