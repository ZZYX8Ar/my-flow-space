// electron/main.js
const { app, BrowserWindow } = require('electron')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // 🔥 无边框 (去掉Windows自带的标题栏)
    transparent: true, // 🔥 允许透明 (配合你的圆角设计)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // 允许加载本地资源
    }
  })

  // 开发环境加载 localhost，生产环境加载打包后的 html
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173') // 你的 Vite 端口
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})