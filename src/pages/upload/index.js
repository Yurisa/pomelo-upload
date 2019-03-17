import React, { Component } from 'react';
import { Row, Col, Icon } from 'antd';
import './index.less';

const electron = window.electron;
const {ipcRenderer} = electron;


class Upload extends Component {

  state = {
    dragover: false
  }

  componentDidMount() {
    console.log('挂载完毕');
    ipcRenderer.on('uploadProgress', (event, progress) => {
      console.log(progress);
    });
  }

  onDrop = (e) => {
    e.preventDefault();
    this.setState({
      dragover: false
    });
    console.log('file1', e.dataTransfer.files);
    this.ipcSendFiles(e.dataTransfer.files)
  }

  onDragOver = (e) => {
    e.preventDefault();
    this.setState({
      dragover: true
    });
  }

  onDragLeave = (e) => {
    e.preventDefault();
    this.setState({
      dragover: false
    })
  }

  onPaste = (e) => {
    e.preventDefault();
    const items = e.clipboardData && e.clipboardData.items;
    let files = [];
    let file = null;
    if (items && items.length) {
      for(let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
    }
    const reader = new FileReader();
    debugger
    reader.onload = function(e) {
      const base64_str = e.target.result;
    }
    reader.readAsDataURL(file); 
  }

  onChange = (e) => {
    this.ipcSendFiles(e.target.files)
    document.getElementById('file-uploader').value = ''  
  }

  ipcSendFiles = (files) => {
    let sendFiles = [];
    Array.from(files).forEach((item, index) => {
      let obj = {
        name: item.name,
        path: item.path
      }
      sendFiles.push(obj)
    });
    console.log(sendFiles);
    ipcRenderer.send('uploadChoosedFiles', sendFiles);
  }

  

  render() {
    const { dragover } = this.state;
    return (
      <div id="upload-view">
        <Row gutter={16}>
          <Col span={20} offset={2}>
            <div className="view-title">
              图片上传 - <Icon type="caret-down" />
            </div>
            <div 
              id="upload-area" 
              className={ dragover ? 'is-dragover' : ''} 
              onPaste={this.onPaste} onDrop={this.onDrop} 
              onDragOver={this.onDragOver} 
              onDragLeave={this.onDragLeave}
            >
              <div id="upload-dragger">
                <Icon type="cloud-upload" />
                <div className="upload-dragger__text">
                  将文件拖到此处，或 <span>点击上传</span>
                </div>
                <input type="file" id="file-uploader" onChange={this.onChange} multiple />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Upload;