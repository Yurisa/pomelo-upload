const {
  app,
  Notification
} = require('electron')
const path = require('path')

// eslint-disable-next-line
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
const PicGo = requireFunc('picgo')
const STORE_PATH = app.getPath('userData')
const CONFIG_PATH = path.join(STORE_PATH, '/data.json')

class Uploader {
  constructor (img, webContents, picgo = undefined) {
    this.img = img
    this.webContents = webContents
    this.picgo = picgo
  }

  upload () {
    const picgo = this.picgo || new PicGo(CONFIG_PATH)
    picgo.config.debug = true
    // for picgo-core
    picgo.config.PICGO_ENV = 'GUI'
    let input = this.img

    picgo.on('beforeTransform', ctx => {
      if (ctx.getConfig('settings.uploadNotification')) {
        const notification = new Notification({
          title: '上传进度',
          body: '正在上传'
        })
        notification.show()
      }
    })

    picgo.upload(input)

    picgo.on('notification', message => {
      const notification = new Notification(message)
      notification.show()
    })

    picgo.on('uploadProgress', progress => {
      this.webContents.send('uploadProgress', progress)
    })

    return new Promise((resolve) => {
      picgo.on('finished', ctx => {
        if (ctx.output.every(item => item.imgUrl)) {
          resolve(ctx.output)
        } else {
          resolve(false)
        }
      })
      picgo.on('failed', ctx => {
        const notification = new Notification({
          title: '上传失败',
          body: '请检查配置和上传的文件是否符合要求'
        })
        notification.show()
        resolve(false)
      })
    })
  }
}

module.exports = Uploader
