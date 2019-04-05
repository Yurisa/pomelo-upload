import React, { Component } from 'react';
import { Row, Col, Icon } from 'antd';
import './index.less';

const electron = window.electron;
const { ipcRenderer } = electron;

class Upload extends Component {

  state = {
    dragover: false
  }

  componentDidMount() {
    // ipcRenderer.on('uploadProgress', (event, progress) => {
    //   console.log(progress);
    // });
  }

  onDrop = (e) => {
    e.preventDefault();
    this.setState({
      dragover: false
    });
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
    this.uploadClipboardFiles()
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
    ipcRenderer.send('uploadChoosedFiles', sendFiles);
  }

  uploadClipboardFiles () {
    ipcRenderer.send('uploadClipboardFiles')
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
              onPaste={this.onPaste} 
              onDrop={this.onDrop} 
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