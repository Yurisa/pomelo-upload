import React, { Component } from 'react';
import hoc from '../../utils/hoc';
// import pasteTemplate from '../../mainUtils/pasteTemplate';
import './index.less';

const electron = window.electron;
// const db = window.db;

class TrayPage extends Component {
  
  state = {
    clipboardFiles: [],
    files: [],
    uploadFlag: false,
    notification: {
      title: '复制链接成功',
      body: '',
      icon: ''
    }
  }

  componentDidMount() {
    this.disableDragFile();
    this.getData();
    electron.ipcRenderer.on('dragFiles', (event, files) => {
      files.forEach(item => {
        // db.read().get('uploaded').insert(item).write();
      });
      this.setState({
        // files: db.read().get('uploaded').slice().reverse().slice(0, 5).value()
      });
    })
    electron.ipcRenderer.on('clipboardFiles', (event, files) => {
      this.setState({
        clipboardFiles: files
      })
    })
    electron.ipcRenderer.on('uploadFiles', (event) => {
      this.setState({
        // files: db.read().get('uploaded').slice().reverse().slice(0, 5).value(),
        uploadFlag: false
      });
    })
    electron.ipcRenderer.on('updateFiles', (event) => {
      this.getData();
    });
  }

  componentWillUnmount() {
    electron.ipcRenderer.removeAllListeners('dragFiles')
    electron.ipcRenderer.removeAllListeners('clipboardFiles')
    electron.ipcRenderer.removeAllListeners('uploadClipboardFiles')
    electron.ipcRenderer.removeAllListeners('updateFiles')
  }

  getData () {
    // this.setState({
    //   files: db.read().get('uploaded').slice().reverse().slice(0, 5).value()
    // })
  }

  copyTheLink (item) {
    this.setState({
      notification: {body: item.imgUrl, icon: item.imgUrl}
    }, () => {
      const { notification } = this.state
      const myNotification = new electron.Notification(notification.title, notification)
      myNotification.onclick = () => {
        return true
      }
    })
    // const pasteStyle = db.read().get('settings.pasteStyle').value() || 'markdown'
    // electron.clipboard.writeText(pasteTemplate(pasteStyle, item.imgUrl))
  }

  calcHeight (width, height) {
    return height * 160 / width
  }

  disableDragFile () {
    window.addEventListener('dragover', (e) => {
      e.preventDefault()
    }, false)
    window.addEventListener('drop', (e) => {
      e.preventDefault()
    }, false)
  }

  uploadClipboardFiles () {
    const { uploadFlag } = this.state;
    if (uploadFlag) {
      return
    }
    this.setState({
      uploadFlag: true
    })
    electron.ipcRenderer.send('uploadClipboardFiles')
  }

  render() {
    const { clipboardFiles, uploadFlag, files } = this.state;
    return (
      <div id="tray-page">
        <div className="content">
        {
          clipboardFiles.length > 0 ? 
            <div className="wait-upload-img">
              <div className="list-title">等待上传</div>
              {
                clipboardFiles.map((item, index) => (
                  <div key={index} style={{height: this.calcHeight(item.width, item.height)}}>
                    <div className={`upload-img__container ${uploadFlag ? 'upload' : ''}`} onClick={this.uploadClipboardFiles}>
                      <img src={item.imgUrl} className="upload-img" alt=""/>
                    </div>
                  </div>
                ))
              }
            </div>
          : null
        }
          <div className="uploaded-img">
            <div className="list-title">已上传</div>
              {
                files.length > 0 && files.map((item, index) => (
                  <div key={index} class="img-list" style={{height: this.calcHeight(item.width, item.height)}}>
                    <div className="upload-img__container" onClick={this.copyTheLink(item)}>
                      <img src={item.imgUrl} className="upload-img" alt=""/>
                    </div>
                  </div>
                ))
              }
          </div>
        </div>
      </div>
    )
  }
}

export default hoc(TrayPage);