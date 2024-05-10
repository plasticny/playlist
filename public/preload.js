const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'ipc', {
    send: (channel, ...args) => {
      ipcRenderer.send(channel, ...args)
    },
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    },
    once: (channel, func) => {
      ipcRenderer.once(channel, (event, ...args) => func(...args))
    }
  }
)
