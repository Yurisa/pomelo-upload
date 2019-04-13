import React, { Component } from 'react';
import { Tabs, Menu, Dropdown } from 'antd';
import MouseMenu from '../../components/MouseMenu';
import './index.less';

const TabPane = Tabs.TabPane;
const db = window.db;

const DiskData = {
  ClipboardType: false,//剪切板是复制还是剪切
  Clipboard: [],//剪切板的文件
  SelectFiles: [],//选择的文件
  NavData: [],//记录导航栏数据
  KeyFlag: false,//全局键盘记录
  NowSelect: {},//记录一个选择的文件
  DiskShowState: 'cd-disk-block-file',//文件显示类型，默认图标,
  SelectTips: '0个项目',//选择文件提示
  Type: 'disk',//头部分类标签,
  ClassifyName: '网盘',//地址栏左侧分类显示文本,
  DiskSize: { /*网盘大小*/
      total: 0,
      use: 0,
      Percent: '0%',
      Background: '#2682fc',
      text: '0B/0B',
  },
}

class AllFiles extends Component {

  state = {
    data: [],
  }

  componentDidMount() {
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
      d.icon = '/asset/filetype/ImageType.png'
    });
    return data;
  }


  getFiles = () => {
    let data = db.read().get('uploaded').slice().reverse().value();
    this.setState({
      data: data
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
        console.log(downloadFiles);
        break;
      default :
        break; 
    }
  }


  render() {
    const { data } = this.state;
    const files = this.processData(data);
    return (
      <Tabs defaultActiveKey="1" onChange={this.handleChange} tabBarStyle={{color: '#eeeeee'}}>
        <TabPane tab="全部文件" key="1">
          <div ref="main">
            {
              files.length > 0 && files.map((item, index) => {
                const {fileName, icon} = item;
                return (
                  <div className={`cd-disk-block-file ${item.active ? 'cd-disk-block-file-active' : null}`} key={index} onMouseDown={e => this.selectFiles(e, item, index)}>
                    <span className="icon">
                      <img src={icon} />  
                    </span>
                    <p>{fileName}</p>   
                  </div>              
                )
              })
            }
          </div>
        <MouseMenu node={this.refs.main} ref="MouseMenu" handleClick={this.handleClick}/>
        </TabPane>
        <TabPane tab="正在下载" key="2">
        </TabPane>
      </Tabs>
    )
  }
}

export default AllFiles;