import React from 'react';
import { Row, Col, Icon, Select, Input, Checkbox, Popconfirm, message } from 'antd';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // react过渡动画 
import ReactBnbGallery from 'react-bnb-gallery';
import pasteStyle from '../../mainUtils/pasteTemplate';
import './index.less';

const Option = Select.Option;
const Search = Input.Search;

const electron = window.electron;
const { ipcRenderer } = electron;
const db = window.db;
export default class Gallery extends React.Component {
  state = {
    images: [],
    idx: 0,
    imgInfo: {
      id: null,
      imgUrl: ''
    },
    picBed: [], 
    choosedList: {},
    choosedPicBed: [],
    searchText: '',
    filterList: [],
    handleBarActive: false,
    pasteStyle: '',
    pasteStyleMap: {
      Markdown: 'markdown',
      HTML: 'HTML',
      URL: 'URL',
      UBB: 'UBB',
      Custom: 'Custom'
    },
    galleryOpened: false,
  }

  componentWillMount() {
    setTimeout(() => {
      this.getGallery()
    }, 200);
  }

  getPicBeds (event, picBeds) {
    this.setState({
      picBed: picBeds
    })
  }

  getGallery = () => {
    const { searchText } = this.state
    if (searchText) {
      let data = db.read().get('uploaded')
        .filter(item => {
          return item.fileName.indexOf(searchText) !== -1
        }).reverse().value();
      this.setState({
        images: data,
        filterList: data
      })
    } else {
      console.log('读取上传图片');
      let data = db.read().get('uploaded').slice().reverse().value();
      this.setState({
        images: data,
        filterList: data
      });
    }
  }

  handlePasteStyleChange = (val) => {
    db.read().set('settings.pasteStyle', val)
    .write();
    this.setState({
      pasteStyle: val
    })
  }

  toggleHandleBar = () => {
    this.setState((preState) => {
      return { handleBarActive: !preState.handleBarActive }
    })
  }

  isMultiple = (obj) => {
    return Object.values(obj).some(item => item)
  }

  /**
   * 批量删除
   */
  onConfirmMutiDelete () {
    const { choosedList } = this.state;
    if (Object.values(choosedList).some(item => item)) {
        let files = [];
        Object.keys(choosedList).forEach(key => {
          if (choosedList[key]) {
            const file = db.read().get('uploaded').getById(key).value();
            files.push(file);
            db.read().get('uploaded').removeById(key).write();
          }
        })
        this.choosedList = {};
        this.getGallery();
        const obj = {
          title: '操作结果',
          body: '删除成功'
        };
        const myNotification = new window.Notification(obj.title, obj);
        myNotification.onclick = () => {
          return true
        };
    }
  }

  /**
   * 批量复制
   */
  multiCopy = () => {
    const { choosedList } = this.state;
    if (Object.values(choosedList).some(item => item)) {
      let copyString = ''
      const style = db.read().get('settings.pasteStyle').value() || 'markdown'
      Object.keys(choosedList).forEach(key => {
        if (choosedList[key]) {
          const item = db.read().get('uploaded').getById(key).value()
          const url = item.url || item.imgUrl
          copyString += pasteStyle(db, style, url) + '\n'
          choosedList[key] = false
        }
      })
      const obj = {
        title: '批量复制链接成功',
        body: copyString
      }
      const myNotification = new window.Notification(obj.title, obj)
      electron.clipboard.writeText(copyString)
      myNotification.onclick = () => {
        return true
      }
    }
  }

  zoomImage = (index) => {
    this.setState({
      idx: index
    }, () => {
      this.toggleGallery()
    })
  }

  /**
   * 打开关闭画廊
   */
  toggleGallery = () => {
    this.setState(prevState => ({
      galleryOpened: !prevState.galleryOpened
    }));
  }

  /**
   * 复制链接
   */
  copy = (item) => {
    const url = item.url || item.imgUrl;  
    console.log('url', url);
    const style = db.read().get('settings.pasteStyle').value() || 'markdown';
    const copyLink = pasteStyle(db, style, url);
    const obj = {
      title: '复制链接成功',
      body: copyLink,
      icon: url
    };
    const myNotification = new window.Notification(obj.title, obj);
    electron.clipboard.writeText(copyLink);
    myNotification.onclick = () => {
      return true
    };
  }

  onCheckBoxChange = (e) => {
    console.log('checkbox', e.target.value, e.target.checked);
    
    this.setState((preState) => {
      preState.choosedList[e.target.value] = e.target.checked;
      return {
        handleBarActive: true,
        choosedList: preState.choosedList
      }
    })
  }

  processImages = (images) => {
    let photos = [];
    images.forEach(item => {
      const { imgUrl, fileName} = item;
      photos.push({
        photo: imgUrl,
        caption: fileName,
        subcaption: fileName,
        thumbnail: imgUrl,
      })
    })
    return photos
  }

  onConfirmDelete = (item) => {
    const { id } = item;
    const file = db.read().get('uploaded').getById(id).value();
    db.read().get('uploaded').removeById(id).write()
    const obj = {
      title: '操作结果',
      body: '删除成功'
    }
    const myNotification = new window.Notification(obj.title, obj)
    myNotification.onclick = () => {
      return true
    }
    this.getGallery()
  }

  onCancelDelete = (e) => {
    message.error('Click on No');
  }

  onSearch = (value) => {
    console.log('111')
    this.setState({
      searchText: value
    }, () => {
      this.getGallery();
    });
  }

  render() {
    const { filterList, handleBarActive, pasteStyle, pasteStyleMap, choosedList, idx, images, galleryOpened } = this.state;
    const photos = this.processImages(images);
    return (
      <div id="gallery-view">
        <div className="view-title" onClick={this.toggleHandleBar}>
          相册 -  
          {
            filterList.length
          }  <Icon className={`icon-caret-bottom ${handleBarActive ? 'icon-caret-bottom-active' : ''}`} type="caret-down" />
        </div>
        <ReactCSSTransitionGroup
         component="div"
         transitionName="fade"
         transitionEnterTimeout={500}
         transitionLeaveTimeout={300}>
          {
            handleBarActive ? (
              <Row>
                <Col span={20} offset={2}>
                  <Row className="handle-bar" gutter={16}>
                    <Col span={12}>
                      <Select placeholder="选择粘贴的格式" style={{width: '100%'}} size="small" onChange={this.handlePasteStyleChange}>
                        {
                          Object.keys(pasteStyleMap).map((key) => {
                            return <Option key={key} value={pasteStyleMap[key]}>{key}</Option>
                          })
                        }
                      </Select>
                    </Col>
                  </Row>
                  <Row className="handle-bar" gutter={16}>
                    <Col span={12}>
                      <Search placeholder="搜索" style={{width: '100%'}} onSearch={(value) => this.onSearch(value)}/>
                    </Col>
                    <Col span={6}>
                      <div className={`item-base copy round ${this.isMultiple(choosedList) ? 'active' : null}`} onClick={() => this.multiCopy()}>
                        <Icon type="file-text" /> 批量复制
                      </div>
                    </Col>
                    <Col span={6}>
                      <Popconfirm 
                        title="确定要删除这张图片吗" 
                        onConfirm={() => this.onConfirmMutiDelete()} 
                        onCancel={this.onCancelDelete} 
                        okText="Yes" 
                        cancelText="No"
                      >
                        <div className={`item-base delete round ${this.isMultiple(choosedList) ? 'active' : null}`}>
                          <Icon type="delete" /> 批量删除
                        </div>
                      </Popconfirm> 
                    </Col>
                  </Row>
                </Col>
              </Row>
            ) : null
          }
        </ReactCSSTransitionGroup>
        <Row className={`gallery-list ${handleBarActive ? 'gallery-list-small' : ''}`}>
          <Col span={20} offset={2}>
            <Row gutter={16}>
              <ReactBnbGallery
                show={galleryOpened}
                photos={photos}
                activePhotoIndex={idx}
                onClose={this.toggleGallery} />
              {
                images.map((item, index) => (
                  <Col className="gallery-list__img" span={6} key={item.id}>
                    <img
                      className="gallery-list__item"
                      src={item.imgUrl}
                      onClick={() => this.zoomImage(index)}
                      alt=""
                    />
                    <div className="gallery-list__fileName">{item.fileName}</div>
                    <div className="gallery-list__tool-panel">
                      <Icon type="file-text" onClick={() => this.copy(item)} />
                      <Popconfirm 
                        title="确定要删除这张图片吗" 
                        onConfirm={() => this.onConfirm(item)} 
                        onCancel={this.onCancel} 
                        okText="Yes" 
                        cancelText="No"
                      >
                        <Icon type="delete" />
                      </Popconfirm>
                      <Checkbox class="pull-right" value={item.id} onChange={this.onCheckBoxChange} />
                    </div> 
                  </Col>
                ))
              }
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}