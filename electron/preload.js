const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  
  // 🔥 注意这里：close 后面必须有一个逗号 ,
  close: () => ipcRenderer.send('window-close'), 

  // 监听窗口状态变化
  onWindowState: (callback) => ipcRenderer.on('window-state-change', (_event, value) => callback(value))
})