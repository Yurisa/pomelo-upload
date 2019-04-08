import React from 'react';
import { Row, Col, Icon, Select, Input, Checkbox } from 'antd';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // react过渡动画 
import ReactBnbGallery from 'react-bnb-gallery'
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
    dialogVisible: false
  }

  componentWillMount() {
    ipcRenderer.on('updateGallery', (event) => {
      setTimeout(() => {
        this.filterList = this.getGallery()
      }, 200);
    })
    ipcRenderer.send('getPicBeds');
    ipcRenderer.on('getPicBeds', this.getPicBeds);
  }

  getPicBeds (event, picBeds) {
    this.setState({
      picBed: picBeds
    })
  }

  getGallery = () => {
    const { choosedPicBed, searchText } = this.state
    if (choosedPicBed.length > 0) {
      let arr = [];
      choosedPicBed.forEach(item => {
        let obj = {
          type: item
        }
        if (searchText) {
          obj.fileName = searchText;
        }
        arr = arr.concat(db.read().get('uploaded').filter(obj => {
          return obj.fileName.indexOf(searchText) !== -1 && obj.type === item
        }).reverse().value());
      });
      this.setState({
        images: arr
      })
      return arr;
    } else {
      if (searchText) {
        let data = db.read().get('uploaded')
          .filter(item => {
            return item.fileName.indexOf(searchText) !== -1
          }).reverse().value();
        this.setState({
          images: data
        })
        return data
      } else {
        let data = db.read().get('uploaded').slice().reverse().value();
        this.setState({
          images: data
        });
        return data
      }
    }
  }

  handlePasteStyleChange = (val) => {
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

  zoomImage = (index) => {
    console.log('inex', index);
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
   * 打开对话框
   */
  openDialog = (item) => {
    const { id, imgUrl } = item;
    this.setState({
      imgInfo: { id, imgUrl },
      dialogVisible: true
    })
  }

  copy = (item) => {

  }

  remove = (item) => {

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

  render() {
    const { filterList, handleBarActive, choosedPicBed, pasteStyle, pasteStyleMap, choosedList, idx, images, galleryOpened } = this.state;
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
                      <Search placeholder="搜索" style={{width: '100%'}} onSearch={value => console.log(value)}/>
                    </Col>
                    <Col span={6}>
                      <div className={`item-base copy round ${this.isMultiple(choosedList) ? 'active' : null}`}>
                        <Icon type="file-text" /> 批量复制
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className={`item-base delete round ${this.isMultiple(choosedList) ? 'active' : null}`}>
                        <Icon type="delete" /> 批量删除
                      </div>
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
                    />
                    <div className="gallery-list__tool-panel">
                      <Icon type="file-text" onClick={(item) => this.copy(item)} />
                      <Icon type="edit" onClick={(item) => this.openDialog(item)}/>
                      <Icon type="delete" onClick={(item) => this.remove(item)} />
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