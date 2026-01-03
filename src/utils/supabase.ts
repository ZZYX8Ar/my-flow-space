import { createClient } from '@supabase/supabase-js'

// 🔥🔥🔥 请替换为你自己的 Supabase URL 和 Key 🔥🔥🔥
// 在 Supabase 后台 -> Project Settings -> API 中找
const SUPABASE_URL = 'https://rrqewodpymcpczkayjao.supabase.co'
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycWV3b2RweW1jcGN6a2F5amFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDE0NjcsImV4cCI6MjA4MzAxNzQ2N30.ghUnNBiiRl1UvBXf6Gn4Wnb4XpM0HbUo7GqvytduV6Q'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 获取本地唯一用户ID (如果没有就生成一个)
export const getUserId = () => {
  let uid = localStorage.getItem('flow-user-id')
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('flow-user-id', uid)
  }
  return uid
}

// 上传分数
export const uploadScore = async (
  username: string,
  minutes: number,
  days: number,
  petId: string
) => {
  const userId = getUserId()

  // upsert: 如果存在就更新，不存在就插入
  const { error } = await supabase.from('rankings').upsert(
    {
      user_id: userId,
      username: username || '无名专注者',
      total_minutes: minutes,
      total_days: days,
      avatar: petId,
    },
    { onConflict: 'user_id' }
  )

  if (error) console.error('上传分数失败:', error)
}

// 获取排行榜
export const getRankings = async (orderBy: 'total_minutes' | 'total_days') => {
  const { data, error } = await supabase
    .from('rankings')
    .select('*')
    .order(orderBy, { ascending: false }) // 降序
    .limit(50) // 只取前50名

  if (error) {
    console.error('获取排名失败:', error)
    return []
  }
  return data
}
