const {app, BrowserWindow, ipcMain, Tray, dialog, Menu, globalShortcut, clipboard, Notification} = require('electron')
const path = require('path')
const db = require('./src/datastore')
const { getPicBeds } = require('./src/mainUtils/getPicBeds')
const url = require('url')
const pkg = require('./package.json')
const Uploader = require('./src/mainUtils/upload');
const pasteTemplate = require('./src/mainUtils/pasteTemplate')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
if (process.env.DEBUG_ENV === 'debug') {
  global.__static = require('path').join(__dirname, '../../static').replace(/\\/g, '\\\\')
}
if (process.env.NODE_ENV === 'development') {
  global.__static = path.join(__dirname, '/public')
}

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:3000/#/tray-page` : ''

const settingWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:3000/#setting/upload` : ''

const miniWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:3000/#mini-page` : ''
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let miniWindow
let settingWindow
let window
let tray
let contextMenu

// function createWindow () {
//   // 创建浏览器窗口。
//   window = new BrowserWindow({
//     width: 800, 
//     height: 600,
//     autoHideMenuBar: true,
//     fullscreenable: false,
//     webPreferences: {
//       javascript: true,
//       plugins: true,
//       nodeIntegration: false, // 不集成 Nodejs
//       webSecurity: false,
//       preload: path.join(__dirname, './public/renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
//     }
//   })

//   // 然后加载应用的 index.html。
//   // package中的DEV为true时，开启调试窗口。为false时使用编译发布版本
//   if(process.env.NODE_ENV === 'development'){
//     window.loadURL('http://localhost:3000/')
//   }else{
//     window.loadURL(url.format({
//       pathname: path.join(__dirname, './build/index.html'),
//       protocol: 'file:',
//       slashes: true
//     }))
  
//   }

  /**
   * 创建初始窗口
   */
  const createWindow = () => {
    if (process.platform !== 'darwin' && process.platform !== 'win32') {
      return
    }
    window = new BrowserWindow({
      height: 350,
      width: 196, // 196
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: true,
      transparent: true,
      vibrancy: 'ultra-dark',
      webPreferences: {
        backgroundThrottling: false,
        preload: path.join(__dirname, './public/renderer.js')
      }
    })
  
    window.loadURL(winURL)
  
    window.on('closed', () => {
      window = null
    })
  
    window.on('blur', () => {
      window.hide()
    })
  }

  /**
   * 创建小窗口
   */
  const createMiniWidow = () => {
    if (miniWindow) {
      return false
    }
    let obj = {
      height: 64,
      width: 64,
      show: true,
      frame: false,
      fullscreenable: false,
      skipTaskbar: true,
      resizable: false,
      transparent: true,
      icon: `/publ/logo.png`,
      webPreferences: {
        backgroundThrottling: false,
        preload: path.join(__dirname, './public/renderer.js')
      }
    }
  
    if (process.platform === 'linux') {
      obj.transparent = false
    }
  
    if (process.platform === 'darwin') {
      obj.show = false
    }
  
    if (db.read().get('settings.miniWindowOntop').value()) {
      obj.alwaysOnTop = true
    }
  
    miniWindow = new BrowserWindow(obj)
  
    miniWindow.loadURL(miniWinURL)
  
    miniWindow.on('closed', () => {
      miniWindow = null
    })
  }

  /**
   * 创建详细窗口
   */
  const createSettingWindow = () => {
    const options = {
      height: 450,
      width: 800,
      show: false,
      frame: true,
      center: true,
      fullscreenable: true,
      resizable: false,
      title: 'pomelo-upload',
      vibrancy: 'ultra-dark',
      transparent: true,
      titleBarStyle: 'hidden',
      webPreferences: {
        backgroundThrottling: false,
        javascript: true,
        nodeIntegration: false, // 不集成 Nodejs
        webSecurity: false,
        preload: path.join(__dirname, './public/renderer.js')
      }
    }
    settingWindow = new BrowserWindow(options)
  
    settingWindow.loadURL(settingWinURL)
  
    settingWindow.on('closed', () => {
      settingWindow = null
      if (process.platform === 'linux') {
        app.quit()
      }
    })
    createMenu()
    createMiniWidow()
  }

  /**
   * 创建菜单
   */
  const createMenu = () => {
    if (process.env.NODE_ENV !== 'development') {
      const template = [{
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
          {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click () {
              app.quit()
            }
          }
        ]
      }]
      menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
    }
  }


function createContextMenu () {
  const picBeds = getPicBeds(app)
  const submenu = picBeds.map(item => {
    return {
      label: item.name,
      type: 'radio',
      checked: db.read().get('picBed.current').value() === item.type,
      click () {
        db.read().set('picBed.current', item.type).write()
        if (settingWindow) {
          settingWindow.webContents.send('syncPicBed')
        }
      }
    }
  })
  contextMenu = Menu.buildFromTemplate([
    {
      label: '关于',
      click () {
        dialog.showMessageBox({
          title: 'PicGo',
          message: 'PicGo',
          detail: `Version: ${pkg.version}\nAuthor: Molunerfinn\nGithub: https://github.com/Molunerfinn/PicGo`
        })
      }
    },
    {
      label: '打开详细窗口',
      click () {
        if (settingWindow === null) {
          createSettingWindow()
          settingWindow.show()
        } else {
          settingWindow.show()
          settingWindow.focus()
        }
        if (miniWindow) {
          miniWindow.hide()
        }
      }
    },
    {
      label: '选择默认图床',
      type: 'submenu',
      submenu
    },
    {
      label: '打开更新助手',
      type: 'checkbox',
      checked: db.get('settings.showUpdateTip').value(),
      click () {
        const value = db.read().get('settings.showUpdateTip').value()
        db.read().set('settings.showUpdateTip', !value).write()
      }
    },
    {
      label: '重启应用',
      click () {
        app.relaunch()
        app.exit(0)
      }
    },
    {
      role: 'quit',
      label: '退出'
    }
  ])
}

function createTray () {
  const menubarPic = process.platform === 'darwin' ? `${__static}/asset/logo.png` : ''
  tray = new Tray(menubarPic)
  tray.on('right-click', () => {
    if (window) {
      window.hide()
    }
    createContextMenu()
    tray.popUpContextMenu(contextMenu)
  })

  // 打开tray时进行剪切板的图片预览
  tray.on('click', (event, bounds) => {
    if (process.platform === 'darwin') {
      let img = clipboard.readImage()
      let obj = []
      if (!img.isEmpty()) {
        // 从剪贴板来的图片默认转为png
        const imgUrl = 'data:image/png;base64,' + Buffer.from(img.toPNG(), 'binary').toString('base64')
        obj.push({
          width: img.getSize().width,
          height: img.getSize().height,
          imgUrl
        })
      }
      toggleWindow(bounds)
      setTimeout(() => {
        window.webContents.send('clipboardFiles', obj)
      }, 0)
    } else {
      if (window) {
        window.hide()
      }
      if (settingWindow === null) {
        createSettingWindow()
        settingWindow.show()
      } else {
        settingWindow.show()
        settingWindow.focus()
      }
      if (miniWindow) {
        miniWindow.hide()
      }
    }
  })

  tray.on('drag-enter', () => {
    tray.setImage(`${__static}/asset/upload.png`)
  })

  tray.on('drag-end', () => {
    tray.setImage(`${__static}/asset/logo.png`)
  })

  /**
   * 小图标拖拽上传
   */
  tray.on('drop-files', async (event, files) => {
    const pasteStyle = db.read().get('settings.pasteStyle').value() || 'markdown'
    const imgs = await new Uploader(files, window.webContents).upload()
    if (imgs !== false) {
      for (let i in imgs) {
        const url = imgs[i].url || imgs[i].imgUrl
        clipboard.writeText(pasteTemplate(db, pasteStyle, url))
        const notification = new Notification({
          title: '上传成功',
          body: imgs[i].imgUrl,
          icon: files[i]
        })
        setTimeout(() => {
          notification.show()
        }, i * 100)
        db.read().get('uploaded').insert(imgs[i]).write()
      }
      window.webContents.send('dragFiles', imgs)
    }
  })
  // toggleWindow()
}

/**
 * 主界面上传处理函数
 */
ipcMain.on('uploadChoosedFiles', async (evt, files) => {
  const input = files.map(item => item.path)
  const imgs = await new Uploader(input, evt.sender).upload()
  if (imgs !== false) {
    const pasteStyle = db.read().get('settings.pasteStyle').value() || 'markdown'
    let pasteText = ''
    for (let i in imgs) {
      const url = imgs[i].url || imgs[i].imgUrl
      pasteText += pasteTemplate(db, pasteStyle, url) + '\r\n'
      const notification = new Notification({
        title: '上传成功',
        body: imgs[i].imgUrl,
        icon: files[i].path
      })
      setTimeout(() => {
        notification.show()
      }, i * 100)
      db.read().get('uploaded').insert(imgs[i]).write()
    }
    clipboard.writeText(pasteText)
    window.webContents.send('uploadFiles', imgs) // 向托盘上传发送一个图片
    if (settingWindow) {
      settingWindow.webContents.send('updateGallery')
    }
  }
})

ipcMain.on('uploadClipboardFiles', () => {
  uploadClipboardFiles()
})

/**
 * 上传剪切板文件
 */
const uploadClipboardFiles = async () => {
  let win
  if (miniWindow.isVisible()) {
    win = miniWindow
  } else {
    win = settingWindow || window
  }
  let img = await new Uploader(undefined, win.webContents).upload()
  if (img !== false) {
    if (img.length > 0) {
      const pasteStyle = db.read().get('settings.pasteStyle').value() || 'markdown'
      const url = img[0].url || img[0].imgUrl
      clipboard.writeText(pasteTemplate(db, pasteStyle, url))
      const notification = new Notification({
        title: '上传成功',
        body: img[0].imgUrl,
        icon: img[0].imgUrl // 此处有区别
      })
      notification.show()
      db.read().get('uploaded').insert(img[0]).write()
      window.webContents.send('clipboardFiles', []) // 将traypage等待上传的文件数组清空
      window.webContents.send('uploadFiles', img)
      if (settingWindow) {
        settingWindow.webContents.send('updateGallery')
      }
    } else {
      const notification = new Notification({
        title: '上传不成功',
        body: '你剪贴板最新的一条记录不是图片哦'
      })
      notification.show()
    }
  }
}

const toggleWindow = (bounds) => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow(bounds)
  }
}


const showWindow = (bounds) => {
  window.setPosition(bounds.x - 98 + 11, bounds.y, false)
  window.webContents.send('updateFiles')
  window.show()
  window.focus()
}


  // 打开开发者工具。
  // window.webContents.openDevTools()

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', () => {
  createWindow()
  createSettingWindow()
  if (process.platform === 'darwin' || process.platform === 'win32') {
    createTray()
  }
  db.read().set('needReload', false).write()

  globalShortcut.register(db.read().get('settings.shortKey.upload').value(), () => {
    uploadClipboardFiles()
  })
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (window === null) {
    createWindow()
  }
  if (settingWindow === null) {
    createSettingWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.setLoginItemSettings({
  openAtLogin: db.read().get('settings.autoStart').value() || false
})
// 在这文件，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
// 在这里可以添加一些electron相关的其他模块，比如nodejs的一些原生模块
// 文件模块
// const BTFile = require('./sys_modules/BTFile')
// BTFile.getAppPath()