const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getProducts: () => ipcRenderer.invoke('products:list'),
  addProduct: (product) => ipcRenderer.invoke('products:add', product),
  updateProduct: (product) => ipcRenderer.invoke('products:update', product),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),
  getAppInfo: () => ipcRenderer.invoke('app:info'),
});
