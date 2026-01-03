// src/utils/db.ts
const DB_NAME = 'FlowSpaceDB'
const STORE_NAME = 'custom_assets'
const DB_VERSION = 1

export interface CustomAsset {
  id: string
  type: 'background' | 'music' | 'font' | 'decor'
  name: string
  blob: Blob // 存储文件二进制数据
  mimeType: string
}

// 打开数据库
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 保存文件
export const saveAsset = async (asset: CustomAsset) => {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(asset)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 获取所有文件
export const getAllAssets = async (): Promise<CustomAsset[]> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 删除文件
export const deleteAsset = async (id: string) => {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
