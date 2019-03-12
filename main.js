const {app, Browserwindowdow, ipcMain, menubar, Tray, dialog} = require('electron')
const path = require('path')
const url = require('url')
const pkg = require('./package.json')

// 监听render进程消息
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})


ipcMain.on('uploadChoosedFiles', async (evt, files) => {
  const input = files.map(item => item.path)
  console.log('input', input);
  // const imgs = await new Uploader(input, evt.sender).upload()
  // if (imgs !== false) {
  //   const pasteStyle = db.read().get('settings.pasteStyle').value() || 'markdown'
  //   let pasteText = ''
  //   for (let i in imgs) {
  //     const url = imgs[i].url || imgs[i].imgUrl
  //     pasteText += pasteTemplate(pasteStyle, url) + '\r\n'
  //     const notification = new Notification({
  //       title: '上传成功',
  //       body: imgs[i].imgUrl,
  //       icon: files[i].path
  //     })
  //     setTimeout(() => {
  //       notification.show()
  //     }, i * 100)
  //     db.read().get('uploaded').insert(imgs[i]).write()
  //   }
  //   clipboard.writeText(pasteText)
  //   windowdow.webContents.send('uploadFiles', imgs)
  //   if (settingwindowdow) {
  //     settingwindowdow.webContents.send('updateGallery')
  //   }
  // }
})

// 保持一个对于 windowdow 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， windowdow 会被自动地关闭
let miniwindowdow
let settingwindowdow
let window
let tray

function createwindowdow () {
  // 创建浏览器窗口。
  window = new Browserwindowdow({
    width: 800, 
    height: 600,
    autoHideMenuBar: true,
    fullscreenable: false,
    webPreferences: {
        javascript: true,
        plugins: true,
        nodeIntegration: false, // 不集成 Nodejs
        webSecurity: false,
        preload: path.join(__dirname, './public/renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    }
  })

  // 然后加载应用的 index.html。
  // package中的DEV为true时，开启调试窗口。为false时使用编译发布版本
  if(pkg.DEV){
    window.loadURL('http://localhost:3000/')
  }else{
    window.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  function createContextMenu() {
    contextMenu = Menu.buildTemplate([
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
          if (settingwindowdow === null) {
            createSettingwindowdow()
            settingwindowdow.show()
          } else {
            settingwindowdow.show()
            settingwindowdow.focus()
          }
          if (miniwindowdow) {
            miniwindowdow.hide()
          }
        }
      },
      {
        label: '选择默认图床',
        type: 'submenu',
        // submenu
      },
      {
        label: '打开更新助手',
        type: 'checkbox',
        // checked: db.get('settings.showUpdateTip').value(),
        // click () {
        //   const value = db.read().get('settings.showUpdateTip').value()
        //   db.read().set('settings.showUpdateTip', !value).write()
        // }
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

  // 打开开发者工具。
  // window.webContents.openDevTools()

  // 当 windowdow 被关闭，这个事件会被触发。
  window.on('closed', () => {
    // 取消引用 windowdow 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 windowdow 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    window = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createwindowdow)

// 当全部窗口关闭时退出。
app.on('windowdow-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwindow') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (window === null) {
    createwindowdow()
  }
})

// 在这文件，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
// 在这里可以添加一些electron相关的其他模块，比如nodejs的一些原生模块
// 文件模块
// const BTFile = require('./sys_modules/BTFile')
// BTFile.getAppPath()