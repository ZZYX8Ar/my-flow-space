const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')

// 🔥🔥🔥 1. 命令行开关：忽略证书错误 🔥🔥🔥
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('allow-insecure-localhost', 'true')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,        // 无边框 (配合你的自定义标题栏)
    transparent: false,  // 关闭透明 (Windows下建议关闭以提升兼容性)
    backgroundColor: '#1a1a1a', 
    resizable: true,
    autoHideMenuBar: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      // 🔥🔥🔥 2. 禁用同源策略和Web安全 (解决部分跨域图片问题) 🔥🔥🔥
      webSecurity: false 
    }
  })

  // 🔥🔥🔥 3. 核心修复：拦截请求，欺骗 Gitee 防盗链 🔥🔥🔥
  // 这一步至关重要，没有它，Gitee 的图片和视频会加载失败或报错
  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      // 把 Referer 设为空，伪装成直接在浏览器地址栏输入的请求
      details.requestHeaders['Referer'] = '';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
    // 生产环境关闭 F12，或者你可以保留下面这行来调试
    // globalShortcut.register('F12', () => { win.webContents.toggleDevTools() }) 
  }

  // 窗口控制逻辑
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('window-close', () => win.close())
  
  win.on('maximize', () => win.webContents.send('window-state-change', 'maximized'))
  win.on('unmaximize', () => win.webContents.send('window-state-change', 'normal'))
}

// 🔥🔥🔥 4. 强制处理证书错误事件 🔥🔥🔥
// 即使命令行开关失效，这个事件回调也能确保继续加载
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // 允许所有证书错误
  event.preventDefault();
  callback(true);
});

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})