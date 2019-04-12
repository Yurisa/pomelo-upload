import React, { Component } from 'react';
import { Row, Col, Icon, Tabs } from 'antd';
import UploadFile from '../../components/UploadFile';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // react过渡动画 
import './index.less';

const TabPane = Tabs.TabPane;

const {electron, Notification} = window;
const { ipcRenderer } = electron;


class Upload extends Component {

  state = {
    dragover: false,
    uploadList: [],
    file: undefined
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

  chooseFile = () => {
    document.getElementById('file-uploader').click();
  }

  onChange = (e) => {
    this.ipcSendFiles(e.target.files)
  }

  ipcSendFiles = (files) => {
    this.setState(preState => {
      return {
        uploadList: [...preState.uploadList, ...files]
      }
    })
    const notification = new Notification('正在上传', {
      title: '正在上传',
      body: '成功添加上传任务，请到正在上传查看',
    });
    notification.onClick = () => {
      console.log('notify')
    }
  }

  onFinished = (index) => {
    const { uploadList } = this.state;
    uploadList.splice(index, 1, undefined);
    this.setState({
      uploadList
    })
  }

  uploadClipboardFiles () {
    ipcRenderer.send('uploadClipboardFiles')
  }

  handleChange = (key) => {
    console.log(key)
  }

  renderUploadingTab = () => {
    const { uploadList } = this.state;
    const len = uploadList.filter(item => item).length;
    return (
      <div>
      正在上传  {len ? <span className="uploadListNum">
            {len}
          </span> : null
        }
      </div>
    )
  }
  render() {
    const { dragover, uploadList } = this.state;
    return (
      <Tabs defaultActiveKey="1" onChange={this.handleChange} tabBarStyle={{color: '#eeeeee'}}>
        <TabPane tab="上传区" key="1">
          <div id="upload-view">
            <Row gutter={16}>
              <Col span={20} offset={2}>
                <div className="view-title">
                  文件上传
                </div>
                <div 
                  id="upload-area" 
                  className={ dragover ? 'is-dragover' : ''} 
                  onPaste={this.onPaste} 
                  onDrop={this.onDrop} 
                  onDragOver={this.onDragOver} 
                  onDragLeave={this.onDragLeave}
                >
                  <div id="upload-dragger" onClick={this.chooseFile}>
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
        </TabPane>
        <TabPane tab={this.renderUploadingTab()} key="2">
          <ReactCSSTransitionGroup
            component="div"
            transitionName="fade"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}
          >
            {
              uploadList.length > 0 
              ? uploadList.map((file, index) => (
                <UploadFile key={index} file={file} index={index} onFinished={this.onFinished}/>
              )) : <span style={{color: '#eeeeee'}}>暂无上传任务</span>
            }
          </ReactCSSTransitionGroup>
        </TabPane>
      </Tabs>
    );
  }
}

export default Upload;