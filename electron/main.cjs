const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    // 🔥🔥🔥 核心修改：开启系统边框，关闭透明 🔥🔥🔥
    frame: false,        // 开启系统标题栏和边框 (解决缩放和拖动问题)
    transparent: false, // 关闭透明 (提高性能，解决点击穿透bug)
    backgroundColor: '#1a1a1a', // 设置背景色，防止白屏闪烁
    resizable: true,
    autoHideMenuBar: true, // 🔥 隐藏左上角的 File/Edit 菜单栏
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true
    }
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    // win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
   /*  globalShortcut.register('F12', () => {
      win.webContents.toggleDevTools()
    }) */
  }

  // ... (下面的 ipcMain 代码保持不变，可以保留，虽然系统接管了窗口控制，但保留逻辑无害) ...
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('window-close', () => win.close())
  win.on('maximize', () => win.webContents.send('window-state-change', 'maximized'))
  win.on('unmaximize', () => win.webContents.send('window-state-change', 'normal'))
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})