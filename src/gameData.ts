// src/gameData.ts
import type { GameItem } from './types'

export const defaultItems: GameItem[] = [
  // 🔥 新增：神秘盲盒 (放在最前面，显眼)
  {
    id: 'mystery_box',
    type: 'decor', // 暂时归类为摆件，或者你可以新增一种 'consumable' 类型
    name: '神秘盲盒',
    // 这里找一张好看的宝箱图片，如果没有，可以用 emoji 📦 代替
    src: '📦',
    price: 50, // 便宜，诱导消费
    unlocked: false, // 盲盒永远是“未解锁”状态，因为可以无限买
  },

  // --- 背景 ---
  {
    id: 'bg1',
    type: 'background',
    name: '默认背景',
    src: '/wallpapers/bg.gif',
    price: 0,
    unlocked: true,
  },
  {
    id: 'bg2',
    type: 'background',
    name: '落日',
    src: '/wallpapers/rain.gif',
    price: 0,
    unlocked: true,
  },
  {
    id: 'bg3',
    type: 'background',
    name: '爱恋',
    src: '/wallpapers/day.gif',
    price: 10,
    unlocked: false,
  },
  {
    id: 'bg4',
    type: 'background',
    name: '放学后',
    src: '/wallpapers/night.gif',
    price: 20,
    unlocked: false,
  },
  // {
  //   id: 'bg5',
  //   type: 'background',
  //   name: '雨夜书房',
  //   src: '/wallpapers/1.gif',
  //   price: 20,
  //   unlocked: false,
  // },
  {
    id: 'bg6',
    type: 'background',
    name: '纯白之梦',
    src: '/wallpapers/2.gif',
    price: 20,
    unlocked: false,
  },
  {
    id: 'bg7',
    type: 'background',
    name: '蔚蓝仙境',
    src: '/wallpapers/3.gif',
    price: 20,
    unlocked: false,
  },
  {
    id: 'bg8',
    type: 'background',
    name: '柠檬午后',
    src: '/wallpapers/柠檬_1.mp4',
    cover: '/wallpapers/柠檬_1.jpg', // 🔥 这里填你的截图路径
    price: 0,
    unlocked: true,
  },
  {
    id: 'bg9',
    type: 'background',
    name: 'go fishing',
    src: '/wallpapers/go fishing.mp4',
    cover: '/wallpapers/go fishing.jpg', // 🔥 这里填你的截图路径
    price: 50,
    unlocked: false,
  },
  {
    id: 'bg10',
    type: 'background',
    name: 'Ma',
    src: '/wallpapers/Ma.mp4',
    cover: '/wallpapers/Ma.jpg', // 🔥 这里填你的截图路径
    price: 100,
    unlocked: false,
  },
  {
    id: 'bg11',
    type: 'background',
    name: '绯红',
    src: '/wallpapers/绯红.mp4',
    cover: '/wallpapers/绯红.jpg', // 🔥 这里填你的截图路径
    price: 150,
    unlocked: false,
  },
  {
    id: 'bg12',
    type: 'background',
    name: '静谧午后',
    src: '/wallpapers/静谧下午.mp4',
    cover: '/wallpapers/静谧下午.jpg', // 🔥 这里填你的截图路径
    price: 100,
    unlocked: false,
  },
  {
    id: 'bg13',
    type: 'background',
    name: '仰望星空',
    src: '/wallpapers/仰望星空.mp4',
    cover: '/wallpapers/仰望星空.jpg', // 🔥 这里填你的截图路径
    price: 200,
    unlocked: false,
  },
  {
    id: 'bg14',
    type: 'background',
    name: '动漫美女',
    src: '/wallpapers/动漫美女.mp4',
    cover: '/wallpapers/动漫美女.jpg', // 🔥 这里填你的截图路径
    price: 200,
    unlocked: false,
  },
  {
    id: 'bg15',
    type: 'background',
    name: 'AMY',
    src: '/wallpapers/AMY.mp4',
    cover: '/wallpapers/AMY.jpg', // 🔥 这里填你的截图路径
    price: 200,
    unlocked: false,
  },
  {
    id: 'bg16',
    type: 'background',
    name: '夏日飞鱼',
    src: '/wallpapers/夏日飞鱼.mp4',
    cover: '/wallpapers/夏日飞鱼.jpg', // 🔥 这里填你的截图路径
    price: 200,
    unlocked: false,
  },

  // --- 音乐 ---
  {
    id: 'm1',
    type: 'music',
    name: '直到清晨黄昏',
    artist: '2025 Mix',
    src: '/music/1.mp3',
    price: 0,
    unlocked: true,
  },
  {
    id: 'm2',
    type: 'music',
    name: '晚风',
    artist: 'Relaxing',
    src: '/music/2.mp3',
    price: 0,
    unlocked: true,
  },
  {
    id: 'm3',
    type: 'music',
    name: 'Echo',
    artist: 'Study Time',
    src: '/music/3.mp3',
    price: 0,
    unlocked: true,
  },
  {
    id: 'm4',
    type: 'music',
    name: 'Rainy Vibe',
    artist: 'Relaxing',
    src: '/music/4.mp3',
    price: 10,
    unlocked: false,
  },
  {
    id: 'm5',
    type: 'music',
    name: 'Deep Focus',
    artist: 'Study Time',
    src: '/music/5.mp3',
    price: 10,
    unlocked: false,
  },
  {
    id: 'm6',
    type: 'music',
    name: 'Rainy Vibe',
    artist: 'Relaxing',
    src: '/music/6.mp3',
    price: 10,
    unlocked: false,
  },
  {
    id: 'm7',
    type: 'music',
    name: 'The thoughts of the night',
    artist: 'Study Time',
    src: '/music/7.mp3',
    price: 10,
    unlocked: false,
  },
  {
    id: 'm8',
    type: 'music',
    name: 'Hometown and miss',
    artist: 'Relaxing',
    src: '/music/8.mp3',
    price: 10,
    unlocked: false,
  },
  {
    id: 'm9',
    type: 'music',
    name: 'Aquila - Midday',
    artist: 'Study Time',
    src: '/music/9.mp3',
    price: 10,
    unlocked: false,
  },
  {
    id: 'm10',
    type: 'music',
    name: 'Sky',
    artist: 'Relaxing',
    src: '/music/10.mp3',
    price: 10,
    unlocked: false,
  },
  {
    id: 'm11',
    type: 'music',
    name: 'Sea',
    artist: 'Study Time',
    src: '/music/11.mp3',
    price: 10,
    unlocked: false,
  },

  // --- 主题 (Theme) ---
  {
    id: 't1',
    type: 'theme',
    name: '经典暗黑',
    src: '#2b2b2b',
    price: 0,
    unlocked: true,
  },
  {
    id: 't2',
    type: 'theme',
    name: '黑客终端',
    src: '#00ff00',
    price: 0,
    unlocked: true,
  },
  {
    id: 't3',
    type: 'theme',
    name: '极简白纸',
    src: '#f0f0f0',
    price: 0,
    unlocked: true,
  },
  {
    id: 't4',
    type: 'theme',
    name: '赛博霓虹',
    src: '#ff00ff',
    price: 50,
    unlocked: false,
  },
  {
    id: 't5',
    type: 'theme',
    name: '深海幽蓝',
    src: '#00bcd4',
    price: 50,
    unlocked: false,
  },
  // {
  //   id: 't6',
  //   type: 'theme',
  //   name: '温暖日落',
  //   src: '#ff9800',
  //   price: 200,
  //   unlocked: false,
  // },
  {
    id: 't7',
    type: 'theme',
    name: '魔法森林',
    src: '#8bc34a',
    price: 50,
    unlocked: false,
  },
  // 新增主题：吸血鬼红
  {
    id: 't8',
    type: 'theme',
    name: '猩红之夜',
    src: '#ff4444',
    price: 50,
    unlocked: false,
  },
  // 新增主题：皇家紫
  {
    id: 't9',
    type: 'theme',
    name: '皇家紫罗兰',
    src: '#9c27b0',
    price: 50,
    unlocked: false,
  },
  // 🔥🔥🔥 新增：治愈系主题 (t10 - t15) 🔥🔥🔥

  // // 1. 醇香拿铁: 温暖的棕色系，像一杯热咖啡
  // {
  //   id: 't10',
  //   type: 'theme',
  //   name: '醇香拿铁',
  //   src: '#8d6e63',
  //   price: 150,
  //   unlocked: false,
  // },

  // // 2. 抹茶布丁: 护眼清新的绿色，非常适合长时间专注
  // {
  //   id: 't11',
  //   type: 'theme',
  //   name: '抹茶布丁',
  //   src: '#a5d6a7',
  //   price: 150,
  //   unlocked: false,
  // },

  // 3. 海盐薄荷: 清凉的蓝绿色，透气、清爽
  {
    id: 't12',
    type: 'theme',
    name: '海盐薄荷',
    src: '#80deea',
    price: 100,
    unlocked: false,
  },

  // // 4. 薰衣草雾: 梦幻的淡紫色，助眠、安神
  // {
  //   id: 't13',
  //   type: 'theme',
  //   name: '薰衣草雾',
  //   src: '#ce93d8',
  //   price: 150,
  //   unlocked: false,
  // },

  // // 5. 羊皮卷: 类似纸张的质感，适合阅读和写作
  // {
  //   id: 't14',
  //   type: 'theme',
  //   name: '羊皮卷',
  //   src: '#fff59d',
  //   price: 150,
  //   unlocked: false,
  // },

  // 6. 静谧午夜: 深蓝配色，适合深夜使用，不刺眼
  {
    id: 't15',
    type: 'theme',
    name: '静谧午夜',
    src: '#1a237e',
    price: 100,
    unlocked: false,
  },
  // 🔥🔥🔥 新增：10个新主题商品 🔥🔥🔥
  {
    id: 't16',
    type: 'theme',
    name: '香草奶油',
    src: '#fdfbf7',
    price: 100,
    unlocked: false,
  },
  {
    id: 't17',
    type: 'theme',
    name: '迷雾森林',
    src: '#8ca6a0',
    price: 100,
    unlocked: false,
  },
  {
    id: 't18',
    type: 'theme',
    name: '海盐苏打',
    src: '#bce6eb',
    price: 150,
    unlocked: false,
  },
  {
    id: 't19',
    type: 'theme',
    name: '白桃乌龙',
    src: '#f8d7da',
    price: 150,
    unlocked: false,
  },
  {
    id: 't20',
    type: 'theme',
    name: '香芋牛奶',
    src: '#e6e6fa',
    price: 150,
    unlocked: false,
  },
  {
    id: 't21',
    type: 'theme',
    name: '柠檬戚风',
    src: '#fffacd',
    price: 200,
    unlocked: false,
  },
  // {
  //   id: 't22',
  //   type: 'theme',
  //   name: '云端漫步',
  //   src: '#cfd8dc',
  //   price: 150,
  //   unlocked: false,
  // },
  {
    id: 't23',
    type: 'theme',
    name: '焦糖布丁',
    src: '#d7ccc8',
    price: 200,
    unlocked: false,
  },
  {
    id: 't24',
    type: 'theme',
    name: '抹茶拿铁',
    src: '#c8e6c9',
    price: 200,
    unlocked: false,
  },
  {
    id: 't25',
    type: 'theme',
    name: '午夜飞行',
    src: '#455a64',
    price: 200,
    unlocked: false,
  },

  // --- 🔥 新增：字体 (Font) ---
  // src 这里存的是 font-family 的值
  {
    id: 'f1',
    type: 'font',
    name: '像素字体 (默认)',
    src: "'VT323', monospace",
    price: 0,
    unlocked: true,
  },
  {
    id: 'f2',
    type: 'font',
    name: '黑客代码',
    src: "'Courier New', monospace",
    price: 0,
    unlocked: true,
  },
  {
    id: 'f3',
    type: 'font',
    name: '现代无衬线',
    src: 'Arial, sans-serif',
    price: 0,
    unlocked: true,
  },
  // {
  //   id: 'f4',
  //   type: 'font',
  //   name: '优雅衬线',
  //   src: "'Georgia', serif",
  //   price: 80,
  //   unlocked: false,
  // },
  // {
  //   id: 'f5',
  //   type: 'font',
  //   name: '手写风格',
  //   src: "'Comic Sans MS', cursive",
  //   price: 100,
  //   unlocked: false,
  // },
  // 🔥 新增：温馨治愈系字体
  {
    id: 'f6',
    type: 'font',
    name: '棉花糖 (Comfortaa)',
    src: "'Comfortaa', cursive",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f7',
    type: 'font',
    name: '手写日记 (Indie)',
    src: "'Indie Flower', cursive",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f8',
    type: 'font',
    name: '快乐体 (Zcool)',
    src: "'Zcool KuaiLe', sans-serif",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f9',
    type: 'font',
    name: '优雅脚本 (Dancing)',
    src: "'Dancing Script', cursive",
    price: 25,
    unlocked: false,
  },

  // f2: 快乐体 (圆润可爱)
  {
    id: 'f10',
    type: 'font',
    name: '快乐体',
    src: "'Zcool KuaiLe', cursive",
    price: 25,
    unlocked: false,
  },

  // f3: 书法风
  {
    id: 'f11',
    type: 'font',
    name: '古风书法',
    src: "'Ma Shan Zheng', cursive",
    price: 25,
    unlocked: false,
  },

  // f4: 优雅宋体
  {
    id: 'f12',
    type: 'font',
    name: '优雅宋体',
    src: "'Noto Serif SC', serif",
    price: 25,
    unlocked: false,
  },

  // ==========================================
  // 🔥🔥🔥 新增：10款 个性化字体 🔥🔥🔥
  // ==========================================

  // 圆润可爱类
  {
    id: 'f13',
    type: 'font',
    name: '可乐圆体 (Quicksand)',
    src: "'Quicksand', sans-serif",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f14',
    type: 'font',
    name: '泡泡体 (Fredoka)',
    src: "'Fredoka', sans-serif",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f15',
    type: 'font',
    name: '幼圆 (Varela)',
    src: "'Varela Round', sans-serif",
    price: 25,
    unlocked: false,
  },

  // 手写风格类
  {
    id: 'f16',
    type: 'font',
    name: '对白 (Caveat)',
    src: "'Caveat', cursive",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f17',
    type: 'font',
    name: '便利贴 (Shadows)',
    src: "'Shadows Into Light', cursive",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f18',
    type: 'font',
    name: '马克笔 (Permanent)',
    src: "'Permanent Marker', cursive",
    price: 25,
    unlocked: false,
  },

  // 清新衬线类
  {
    id: 'f19',
    type: 'font',
    name: '文学杂志 (Lora)',
    src: "'Lora', serif",
    price: 25,
    unlocked: false,
  },
  {
    id: 'f20',
    type: 'font',
    name: '打字机 (Slab)',
    src: "'Josefin Slab', serif",
    price: 25,
    unlocked: false,
  },

  // // 艺术/游戏类
  // {
  //   id: 'f18',
  //   type: 'font',
  //   name: '未来科技 (Orbitron)',
  //   src: "'Orbitron', sans-serif",
  //   price: 150,
  //   unlocked: false,
  // },
  {
    id: 'f21',
    type: 'font',
    name: '复古游戏 (Press Start)',
    src: "'Press Start 2P', cursive",
    price: 25,
    unlocked: false,
  },

  // --- 摆件 ---
  {
    id: 'd1',
    type: 'decor',
    name: '橘猫',
    src: '/decors/cat.gif',
    price: 25,
    unlocked: false,
    isActive: false,
    x: '60%',
    y: '15%',
    width: '100px',
  },
  {
    id: 'd2',
    type: 'decor',
    name: '热咖啡',
    src: '/decors/coffee.gif',
    price: 50,
    unlocked: false,
    isActive: false,
    x: '25%',
    y: '10%',
    width: '60px',
  },
  {
    id: 'd3',
    type: 'decor',
    name: '多肉植物',
    src: '/decors/plant.png',
    price: 80,
    unlocked: false,
    isActive: false,
    x: '85%',
    y: '20%',
    width: '70px',
  },

  // --- 🔥🔥🔥 6个桌宠 (Pets) 🔥🔥🔥 ---
  {
    id: 'pet_cat',
    type: 'pet',
    name: '像素猫猫',
    src: 'cat',
    price: 0,
    unlocked: true,
  },
  {
    id: 'pet_dog',
    type: 'pet',
    name: '忠诚柴犬',
    src: 'dog',
    price: 100,
    unlocked: false,
  },
  {
    id: 'pet_slime',
    type: 'pet',
    name: '呆萌史莱姆',
    src: 'slime',
    price: 200,
    unlocked: false,
  },
  // 新增 3 个
  {
    id: 'pet_chicken',
    type: 'pet',
    name: '月亮鸡',
    src: 'chicken',
    price: 300,
    unlocked: false,
  },
  {
    id: 'pet_gray',
    type: 'pet',
    name: '帕丁灰',
    src: 'gray',
    price: 500,
    unlocked: false,
  },
  {
    id: 'pet_purple',
    type: 'pet',
    name: '灵紫',
    src: 'purple',
    price: 800,
    unlocked: false,
  },

  // 🔥🔥🔥 2. 更新：6套 限定套装定义 🔥🔥🔥
  // 价格 99999 = 商店显示 "好感度限定"
  {
    id: 'set_limit_cat',
    type: 'set',
    name: '猫咪物语 (猫限定)',
    src: '/decors/cat.gif',
    price: 99999,
    unlocked: false,
    contentIds: ['bg_cat_ex', 't_cat_ex', 'm_cat_ex', 'f_cat_ex'],
  },
  {
    id: 'set_limit_dog',
    type: 'set',
    name: '忠犬八公 (犬限定)',
    src: '/decors/dog.gif',
    price: 99999,
    unlocked: false,
    contentIds: ['bg_dog_ex', 't_dog_ex', 'm_dog_ex', 'f_dog_ex'],
  },
  {
    id: 'set_limit_slime',
    type: 'set',
    name: '勇者斗恶龙 (史莱姆限定)',
    src: '/decors/slime.gif',
    price: 99999,
    unlocked: false,
    contentIds: ['bg_slime_ex', 't_slime_ex', 'm_slime_ex', 'f_slime_ex'],
  },
  {
    id: 'set_limit_chicken',
    type: 'set',
    name: '月宫奇遇 (月亮鸡限定)',
    src: '/decors/chicken.gif',
    price: 99999,
    unlocked: false,
    contentIds: [
      'bg_chicken_ex',
      't_chicken_ex',
      'm_chicken_ex',
      'f_chicken_ex',
    ],
  },
  {
    id: 'set_limit_gray',
    type: 'set',
    name: '灰色轨迹 (帕丁灰限定)',
    src: '/decors/gray.gif',
    price: 99999,
    unlocked: false,
    contentIds: ['bg_gray_ex', 't_gray_ex', 'm_gray_ex', 'f_gray_ex'],
  },
  {
    id: 'set_limit_purple',
    type: 'set',
    name: '紫罗兰永恒 (灵紫限定)',
    src: '/decors/purple.gif',
    price: 99999,
    unlocked: false,
    contentIds: ['bg_purple_ex', 't_purple_ex', 'm_purple_ex', 'f_purple_ex'],
  },

  // 🔥🔥🔥 3. 新增：套装内的专属物品 (价格全部设为 99999) 🔥🔥🔥
  // 这样它们在商店的各自分类里也会显示，但无法购买，提示需要解锁套装

  // --- 猫猫专属 ---
  {
    id: 'bg_cat_ex',
    type: 'background',
    name: '猫爬架乐园',
    src: '/wallpapers/cat_world.mp4',
    cover: '/wallpapers/cat_world.jpg', // 🔥 这里填你的截图路径
    price: 99999,
    unlocked: false,
  },
  {
    id: 't_cat_ex',
    type: 'theme',
    name: '猫咪灰',
    src: '#766e71ff',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'm_cat_ex',
    type: 'music',
    name: 'Meow Song',
    artist: 'Cat Band',
    src: '/music/cat.mp3',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'f_cat_ex',
    type: 'font',
    name: '猫咪手写体',
    src: "'Comic Sans MS', cursive",
    price: 99999,
    unlocked: false,
  },

  // --- 柴犬专属 ---
  {
    id: 'bg_dog_ex',
    type: 'background',
    name: '秋日庭院',
    src: '/wallpapers/autumn.mp4',
    cover: '/wallpapers/autumn.jpg', // 🔥 这里填你的截图路径
    price: 99999,
    unlocked: false,
  },
  {
    id: 't_dog_ex',
    type: 'theme',
    name: '柴犬黄',
    src: '#f7db94ff',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'm_dog_ex',
    type: 'music',
    name: 'Happy Walk',
    artist: 'Doggy',
    src: '/music/dog.mp3',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'f_dog_ex',
    type: 'font',
    name: '汪汪体',
    src: "'Zcool KuaiLe', cursive",
    price: 99999,
    unlocked: false,
  },

  // --- 史莱姆专属 ---
  {
    id: 'bg_slime_ex',
    type: 'background',
    name: '勇者村庄',
    src: '/wallpapers/rpg.mp4',
    cover: '/wallpapers/rpg.jpg', // 🔥 这里填你的截图路径
    price: 99999,
    unlocked: false,
  },
  {
    id: 't_slime_ex',
    type: 'theme',
    name: '史莱姆绿',
    src: '#b7f7c0ff',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'm_slime_ex',
    type: 'music',
    name: '8-Bit Adventure',
    artist: 'Hero',
    src: '/music/8bit.mp3',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'f_slime_ex',
    type: 'font',
    name: '像素冒险',
    src: "'DotGothic16', monospace",
    price: 99999,
    unlocked: false,
  }, // 复用像素体也可以，或者换个颜色

  // --- 月亮鸡专属 ---
  {
    id: 'bg_chicken_ex',
    type: 'background',
    name: '广寒宫',
    src: '/wallpapers/moon.mp4',
    cover: '/wallpapers/moon.jpg', // 🔥 这里填你的截图路径
    price: 99999,
    unlocked: false,
  },
  {
    id: 't_chicken_ex',
    type: 'theme',
    name: '月光银',
    src: '#e0e0e0',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'm_chicken_ex',
    type: 'music',
    name: 'Moonlight',
    artist: 'Chicken',
    src: '/music/moon.mp3',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'f_chicken_ex',
    type: 'font',
    name: '古风鸡法',
    src: "'Caveat', cursive",
    price: 99999,
    unlocked: false,
  },

  // --- 帕丁灰专属 ---
  {
    id: 'bg_gray_ex',
    type: 'background',
    name: '迷雾伦敦',
    src: '/wallpapers/london.mp4',
    cover: '/wallpapers/london.jpg', // 🔥 这里填你的截图路径
    price: 99999,
    unlocked: false,
  },
  {
    id: 't_gray_ex',
    type: 'theme',
    name: '优雅灰',
    src: '#9e9e9e',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'm_gray_ex',
    type: 'music',
    name: 'Rainy London',
    artist: 'Bear',
    src: '/music/rain.mp3',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'f_gray_ex',
    type: 'font',
    name: '优雅衬灰',
    src: "'Noto Serif SC', serif",
    price: 99999,
    unlocked: false,
  },

  // --- 灵紫专属 ---
  {
    id: 'bg_purple_ex',
    type: 'background',
    name: '魔法虚空',
    src: '/wallpapers/magic.mp4',
    cover: '/wallpapers/magic.jpg', // 🔥 这里填你的截图路径
    price: 99999,
    unlocked: false,
  },
  {
    id: 't_purple_ex',
    type: 'theme',
    name: '神秘紫',
    src: '#9c27b0',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'm_purple_ex',
    type: 'music',
    name: 'Mystery',
    artist: 'Fox',
    src: '/music/magic.mp3',
    price: 99999,
    unlocked: false,
  },
  {
    id: 'f_purple_ex',
    type: 'font',
    name: '紫法符文',
    src: "'Orbitron', sans-serif",
    cover: '/wallpapers/magic.jpg', // 🔥 这里填你的截图路径
    price: 99999,
    unlocked: false,
  },

  // // --- 🔥🔥🔥 3套 新普通套装 (可购买) 🔥🔥🔥 ---
  // {
  //   id: 'set_deepsea',
  //   type: 'set',
  //   name: '深海探险套装',
  //   src: '/wallpapers/ocean.gif',
  //   cover: '/wallpapers/ocean.jpg', // 🔥 这里填你的截图路径
  //   price: 300,
  //   unlocked: false,
  //   contentIds: ['t5', 'bg6', 'f3'],
  // },
  // {
  //   id: 'set_retro',
  //   type: 'set',
  //   name: '复古报纸套装',
  //   src: '/wallpapers/paper.gif',
  //   cover: '/wallpapers/paper.jpg', // 🔥 这里填你的截图路径
  //   price: 600,
  //   unlocked: false,
  //   contentIds: ['t14', 'bg3', 'f4'],
  // },
  // {
  //   id: 'set_sunset',
  //   type: 'set',
  //   name: '落日飞车套装',
  //   src: '/wallpapers/sunset.gif',
  //   cover: '/wallpapers/sunset.jpg', // 🔥 这里填你的截图路径
  //   price: 900,
  //   unlocked: false,
  //   contentIds: ['t6', 'bg2', 'f5'],
  // },

  // //  套装 (Sets) 🔥 ---
  // // 普通购买套装
  // {
  //   id: 'set_cyber',
  //   type: 'set',
  //   name: '赛博朋克套装',
  //   src: '/wallpapers/night.gif',
  //   price: 500,
  //   unlocked: false,
  //   contentIds: ['bg4', 't4', 'f2'],
  // },
  // {
  //   id: 'set_forest',
  //   type: 'set',
  //   name: '魔法森林套装',
  //   src: '/wallpapers/day.gif',
  //   price: 600,
  //   unlocked: false,
  //   contentIds: ['bg3', 't7', 'f3'],
  // },

  // 🔥🔥🔥 新增：零食 (Snacks) 🔥🔥🔥
  {
    id: 'snack_fish',
    type: 'snack',
    name: '小鱼干',
    src: '🐟',
    price: 20,
    unlocked: true,
    affinity: 2,
  },
  {
    id: 'snack_can',
    type: 'snack',
    name: '猫罐头',
    src: '🥫',
    price: 50,
    unlocked: true,
    affinity: 5,
  },
  {
    id: 'snack_catnip',
    type: 'snack',
    name: '猫薄荷',
    src: '🌿',
    price: 100,
    unlocked: true,
    affinity: 10,
  },
  {
    id: 'snack_donut',
    type: 'snack',
    name: '甜甜圈',
    src: '🍩',
    price: 150,
    unlocked: true,
    affinity: 15,
  }, // 新增
  {
    id: 'snack_sushi',
    type: 'snack',
    name: '豪华寿司',
    src: '🍣',
    price: 200,
    unlocked: true,
    affinity: 20,
  }, // 新增
  {
    id: 'snack_pizza',
    type: 'snack',
    name: '至尊披萨',
    src: '🍕',
    price: 300,
    unlocked: true,
    affinity: 30,
  }, // 新增
]
