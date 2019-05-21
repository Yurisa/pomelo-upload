import React, { Component } from 'react';
import { Tabs } from 'antd';
import axios from 'axios';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // react过渡动画 
import MouseMenu from '../../components/MouseMenu';
import DownloadFile from '../../components/DownloadFile';
import './index.less';

const domain = 'http://localhost:7001';
const TabPane = Tabs.TabPane;
const db = window.db;
const electron = window.electron;
const { ipcRenderer } = electron;

const DiskData = {
  ClipboardType: false,//剪切板是复制还是剪切
  Clipboard: [],//剪切板的文件
  SelectFiles: [],//选择的文件
  NavData: [],//记录导航栏数据
  KeyFlag: false,//全局键盘记录
  NowSelect: {},//记录一个选择的文件
  SelectTips: '0个项目',//选择文件提示
  Type: 'disk',//头部分类标签,
}

class AllFiles extends Component {

  state = {
    data: [],
    TransformData: [],
  }

  componentDidMount() {
    ipcRenderer.on('download', (e, file) => {
      const { TransformData } = this.state;
      for (let i = 0; i < TransformData.length; i++) {
        if (file.name === TransformData[i].name) {
          setTimeout(() => {
            for (let name in TransformData[i]) {
              this.setState(preState => {
                const { TransformData } = preState;
                TransformData[i][name] = file[name];
                return {
                  TransformData
                }
              });
            }
          }, 50);
          return;
        } 
      }
      this.setState(preState => {
        const { TransformData } = preState;
        TransformData.push(file)
        return {
          TransformData
        }
      });
    });
    window.addEventListener('keydown', (e) => {
      e.stopPropagation();
      DiskData.KeyFlag = e.key;
    })
    window.addEventListener('keyup', (e) => {
      DiskData.KeyFlag = null;
    })
    this.getFiles();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', (e) => {
      e.KeyFlag = null;
    });
    window.removeEventListener('keyup', (e) => {
      e.KeyFlag = null;
    });
  }

  handleChange = (key) => {
    console.log(key)
  }

  processData = (data) => {
    data.forEach(d => {
      if (d.file_suffix) {
        const { file_suffix } = d;
        d.fileName = d.file_name;
        d.downloadUrl = `${domain}${d.file_path}`
        if (file_suffix === 'xls') {
          d.icon = './asset/filetype/ExcelType.png';
        } else if (file_suffix === 'doc' || file_suffix === 'docx') {
          d.icon = './asset/filetype/DocType.png';
        } else if (file_suffix === 'pdf') {
          d.icon = './asset/filetype/PdfType.png';
        } else if (file_suffix === 'mp4') {
          d.icon = './asset/filetype/VideoType.png';
        } else if (file_suffix === 'rar' || file_suffix === 'zip') {
          d.icon = './asset/filetype/RarType.png';
        } else if (file_suffix === 'ppt' || file_suffix === 'pptx') {
          d.icon = './asset/filetype/PptType.png';
        } else if (file_suffix === 'svg' || file_suffix === 'png' || file_suffix === 'jpg') {
          d.icon = './asset/filetype/ImageType.png';
        } else if (file_suffix === 'mp3') {
          d.icon = './asset/filetype/MusicType.png'
        } else if (file_suffix === 'txt') {
          d.icon = './asset/filetype/TxtType.png'
        } else {
          d.icon = './asset/filetype/OtherType.png';
        }
      } else if (d.imgUrl) {
        d.downloadUrl = d.imgUrl;
        d.icon = './asset/filetype/ImageType.png';
      } 
    });
    return data;
  }


  getFiles = async () => {
    let data1 = db.read().get('uploaded').slice().reverse().value();
    let { data: data2} = await axios.get(`${domain}/upload-files`);
    this.setState({
      data: data2.reverse().concat(data1)
    });
  }

  selectFiles = (event, item, index) => {
    event.persist();
    const { data } = this.state;
    this.refs.MouseMenu.MenuShow(event);
    if (event.button === 0) {
        event.stopPropagation();
        if (DiskData.KeyFlag === 'Control') {//Ctrl多选
            this.setState(preState => {
              const { data } = preState;
              if (data.length > 0) {
                data[index].active = !data[index].active
              }
              return {
                data: data
              }
            }); // 反选
        } else if (DiskData.KeyFlag === 'Shift') {//Shift多选
            let Start = index, End;
            this.setActive(index, true)
            if (DiskData.NowSelect) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i] === DiskData.NowSelect) {
                        Start = i;
                    }
                    if (data[i] === item) {
                        End = i;
                    }
                }
            }
            for (let j = Math.min(End, Start); j < Math.max(End, Start) + 1; j++) {
              this.setActive(j, true)
            }
            DiskData.NowSelect = data[Math.max(End, Start)];
            DiskData.NowIndex = Math.max(End, Start);
        } else if (!DiskData.KeyFlag) {//单选
            this.ClearSelect();
            this.setActive(index, true)
            DiskData.NowIndex = index;
            DiskData.NowSelect = item;
        }
    } else if (event.button === 2) {
      DiskData.NowIndex = index;
      DiskData.NowSelect = item;
    }
  }

  setActive = (index, flag) => {
    this.setState(preState => {
      const { data } = preState;
      if (data.length > 0) {
        data[index].active = flag
      }
      return {
        data
      }
    }); 
  }

  ClearSelect() {
    this.setState(preState => {
      const { data } = preState;
      data.forEach(item => {
        item.active = false;
      })
      return {
        data
      }
    });
    DiskData.SelectFiles = []
  }

  handleClick = (action) => {
    const { command } = action;
    switch(command) {
      case 'download': 
        const downloadFiles = this.state.data.filter(item => item.active);
        downloadFiles.forEach(file => {
          electron.remote.getCurrentWindow().webContents.downloadURL(file.downloadUrl);
        });
        break;
      case 'open' : 
        this.openFile();
        break;
      case 'remove' :
        this.removeFile();
      default :
        break; 
    }
  }

  ControlTrans = (event, file, index) => {
    event.persist();
    if (event.target.dataset.icon === 'close') {
      if(file.trans_type === 'download'){
        ipcRenderer.send('download', 'cancel', file.id);
      }else{
        this.deleteTransformData(index);
      }
      return;
    }
    if (file.state === 'completed') {
      console.log('删除');
      this.deleteTransformData(index);
    } else {
      let command=(file.state === 'progressing') ? 'pause':'resume';
      ipcRenderer.send('download', command, file.id);
    }
  }

  deleteTransformData = (index) => {
    this.setState(preState => {
      const { TransformData } = preState;
      TransformData.splice(index, 1);
      return {
        TransformData
      }
    });
  }

  renderDownloadingab = () => {
    const { TransformData } = this.state;
    const len = TransformData.filter(item => item).length;
    return (
      <div>
      正在下载  {len ? <span className="downloadListNum">
            {len}
          </span> : null
        }
      </div>
    )
  }

  openFile = (item) => {
    let openType = null;
    if (!item) {
      const fileList = this.state.data.filter(item => item.active);
      if (fileList.length > 0) {
        if (fileList.every(item => item.file_suffix === 'mp3')) {
          fileList.forEach(item => {
            item.active = false;
          });
          fileList[0].active = true;
          openType = 'audio';
          ipcRenderer.send('file-control', openType, fileList);
        } else if (fileList.every(item => item.file_suffix === 'mp3' || 'avi')) {
          fileList.forEach(item => {
            item.active = false;
          });
          fileList[0].active = true;
          openType = 'video';
          ipcRenderer.send('file-control', openType, fileList); 
        } 
      }
      return;
    }
    if (item.file_suffix) {
      const { file_suffix } = item;
      let data = [];
      if (file_suffix === 'pdf') {
        openType = 'pdf';
        ipcRenderer.send('file-control', openType, item)
      } else if (file_suffix === 'mp3') {
        const MusicList = this.state.data.filter(item => item.active);
        openType = 'audio';
        data.push(item);        
        ipcRenderer.send('file-control', openType, data.length ? data : MusicList)
      } else if (file_suffix === 'mp4') {
        const VideoList = this.state.data.filter(item => item.active);
        openType = 'video';
        data.push(item);        
        ipcRenderer.send('file-control', openType, data.length ? data : VideoList)
      } else if (file_suffix === 'txt') {
        openType = 'text';
        ipcRenderer.send('file-control', openType, item);
      } else if (file_suffix === 'zip') {
        openType = 'zip';
        ipcRenderer.send('file-control', openType, item);
      }
    } else {
      alert('暂不支持打开此类型')
    }
  }

  removeFile = async (item) => {
    if (!item) {
      const fileList = this.state.data.filter(item => item.active);
      if (fileList.length > 0) {
        for(let i = 0; i < fileList.length; i++) {
          let res = await axios.delete(`${domain}/file/${fileList[i].file_id}`);
        }
        this.getFiles();
      }
      return;
    }
  }

  render() {
    const { data, TransformData } = this.state;
    const files = this.processData(data);
    return (
      <Tabs defaultActiveKey="1" onChange={this.handleChange} tabBarStyle={{color: '#eeeeee'}}>
        <TabPane tab="全部文件" key="1">
          <div ref="main">
            {
              files.length > 0 && files.map((item, index) => {
                const {fileName, icon} = item;
                return (
                  <div 
                    className={`cd-disk-block-file ${item.active ? 'cd-disk-block-file-active' : null}`} 
                    key={`${fileName}_${index}`} 
                    onMouseDown={e => this.selectFiles(e, item, index)}
                    onDoubleClick={() => this.openFile(item)}
                  >
                    <span className="icon">
                      <img src={icon} alt=""/>  
                    </span>
                    <p>{fileName}</p>   
                  </div>              
                )
              })
            }
          </div>
        <MouseMenu node={this.refs.main} ref="MouseMenu" handleClick={this.handleClick}/>
        </TabPane>
        <TabPane tab={this.renderDownloadingab()} key="2">
          <ReactCSSTransitionGroup
            component="div"
            transitionName="fade"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}
          >
            {
              TransformData.length > 0 ? TransformData.map((file, index) => {
                return <DownloadFile file={file} key={file} index={index} ControlTrans={this.ControlTrans}/>
              }) : <span style={{color: '#eeeeee'}}>暂无下载任务</span>
            }
          </ReactCSSTransitionGroup>
        </TabPane>
      </Tabs>
    )
  }
}

export default AllFiles;