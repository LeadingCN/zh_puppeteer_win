import { ipcMain, dialog, BrowserWindow, app } from 'electron'
export default {//export default
  ipcMainTestHandler(arg) {
    console.log("处理", arg);
    return 'ok'
  }
}