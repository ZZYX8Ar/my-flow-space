// src/types.ts
export type ItemType =
  | 'background'
  | 'music'
  | 'theme'
  | 'decor'
  | 'font'
  | 'set'
  | 'snack'
  | 'pet'

export interface GameItem {
  id: string
  type: ItemType
  name: string
  price: number
  src: string // 对于桌宠，这里存它是哪种动物的前缀，例如 'cat'
  cover?: string // 🔥 新增：用于商店预览的静态图
  unlocked: boolean

  // 音乐特有
  artist?: string

  // 摆件特有
  isActive?: boolean
  x?: string
  y?: string
  width?: string

  // 套装特有：包含的物品ID列表
  contentIds?: string[]

  // 零食特有
  affinity?: number
}

export interface PetSettings {
  currentPetId: string // 当前是谁
  scale: number
  opacity: number
  walkSpeed: number
  affection: number
  unlockedSets: string[] // 已解锁的套装ID列表

  // 🔥🔥🔥 新增字段 🔥🔥🔥
  // 记录所有宠物的好感度: { 'cat': 100, 'dog': 20 }
  petAffections: Record<string, number>
  // 记录桌宠位置
  x?: number
  y?: number
}
