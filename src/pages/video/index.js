import React, { Component } from 'react';
import { Icon } from 'antd';
import Media from '../../utils/media';
import './index.less';

const electron = window.electron;
const { ipcRenderer } = electron;

class Video extends Component {
  state = {
    PlayList: [],
    NowPlay: {
      disk_name: '准备播放',
      count: 0,
    },
    TimeText: '00:00/00:00',
    ProcessWidth: 0,
    VideoHeight: 'calc(100% - 70px)',
    CacheWidth: 0,
    PlayButtonState: 'sf-icon-play',
    VolumnState: false,
    animation: '',
    BarAnimation: '',
    FullFlag: false,
    FullButton: 'sf-icon-expand',
    TimeOutID: 0,
    header: {
      title: '',
    },
  };

  componentWillMount() {
    ipcRenderer.on('win-data', (event, data) => {
      //接收视频文件列表的数据
      setTimeout(() => {
        data.forEach((item, index) => {
          item.play = false;
          item.disk_name = item.file_name;
          if (item.active) {
            item.play = 'active';
            this.playCallBack(item, index);
            this.VideoPlayerCommend('play');
          }
        });
        this.setState({
          PlayList: data,
        });
      }, 200);
    });
    ipcRenderer.on('video-prev', () => {
      this.VideoPlayerCommend('prev');
    });
    ipcRenderer.on('video-Play', () => {
      this.VideoPlayerCommend('play');
    });
    ipcRenderer.on('video-next', () => {
      this.VideoPlayerCommend('next');
    });
  }

  playCallBack = (item, index) => {
    this.setState((preState) => {
      item.count = index;
      item.PlayUrl = item.downloadUrl;
      return {
        NowPlay: item,
      };
    });
  };

  ChangeTime = (state) => {
    let media = this.refs.video;
    if (state === '-') {
      media.currentTime = media.currentTime - 5;
    } else {
      media.currentTime = media.currentTime + 5;
    }
  };
  VideoPlayerCommend = (commend) => {
    const { PlayList, NowPlay } = this.state;
    if (!PlayList.length) {
      return;
    }
    let NowCount = NowPlay.count;
    let AllCount = PlayList.length;
    switch (commend) {
      case 'prev':
        if (NowCount !== 0) {
          PlayList.forEach((item) => {
            item.play = false;
          });
          PlayList[NowCount - 1].play = 'active';
          this.setState({
            PlayList,
          });
        }
        break;
      case 'next':
        if (NowCount !== AllCount - 1) {
          PlayList.forEach((item) => {
            item.play = false;
          });
          PlayList[NowCount + 1].play = 'active';
          this.setState({
            PlayList,
          });
        } else {
          this.VideoPlayerCommend('play');
        }
        break;
      case 'play':
        let media = this.refs.video;
        if (media.paused) {
          media.play();
          this.setState({
            PlayButtonState: 'play',
            animation: 'animated zoomOut',
          });
          ipcRenderer.send('player-control', 'video', 'pause');
        } else {
          media.pause();
          this.setState({
            PlayButtonState: 'pause',
            animation: 'animated zoomIn',
          });
          ipcRenderer.send('player-control', 'video', 'play');
        }
        this.refs.VideoPlayer.focus();
        break;
      default:
        break;
    }
  };

  ChangeVolumn = (e) => {
    let media = this.refs.video;
    let volunm = this.refs.volunm;
    Media.MediaControl(media, 'volunm', 'y', volunm, e);
  };

  VideoEnded = () => {
    let media = this.refs.video;
    media.currentTime = 0;
    this.VideoPlayerCommend('play');
  };

  TimeChange = (e) => {
    let media = this.refs.video;
    let slider = this.refs.slider;
    Media.MediaControl(media, 'play', 'x', slider, e);
    this.VideoPlayerCommend('play');
  };

  VideoProcess = () => {
    let media = this.refs.video;
    this.setState({
      TimeText:
        Media.secondDeal(media.currentTime) +
        '/' +
        Media.secondDeal(media.duration),
      ProcessWidth:
        (Math.round(media.currentTime) / Math.round(media.duration)) * 100 +
        '%',
    });
  };

  VideoCache = () => {
    let media = this.refs.video;
    try {
      this.setState({
        CacheWidth:
          (
            media.buffered.end(media.buffered.length - 1) / media.duration
          ).toFixed(2) *
            100 +
          '%',
      });
    } catch (e) {}
  };

  ShowControl = () => {
    const { FullFlag } = this.state;
    this.refs.VideoPlayer.focus();
    if (FullFlag) {
      this.setState({
        BarAnimation: 'animated slideInUp',
        VideoHeight: 'calc(100% - 70px)',
      });
    }
  };

  HideControl = () => {
    const { FullFlag, TimeOutID } = this.state;
    this.refs.VideoPlayer.focus();
    if (FullFlag) {
      clearTimeout(TimeOutID);
      const tmp = setTimeout(() => {
        this.setState({
          BarAnimation: 'animated fadeOut',
          VideoHeight: '100%',
        });
        clearTimeout(TimeOutID);
      }, 5000);
      this.setState({
        TimeOutID: tmp,
      });
    }
  };

  FullScreen = (flag) => {
    const { TimeOutID, FullFlag } = this.state;
    let el = this.refs.VideoPlayer;
    el.focus();
    if (flag) {
      // const result = document.exitFullscreen
      //   ? document.exitFullscreen()
      //   : document.mozCancelFullScreen
      //   ? document.mozCancelFullScreen()
      //   : document.webkitExitFullscreen
      //   ? document.webkitExitFullscreen()
      //   : '';
      setTimeout(() => {
        this.setState({
          FullFlag: false,
        });
      }, 200);
      clearTimeout(TimeOutID);
    }
    if (FullFlag) {
      // const result = document.exitFullscreen
      //   ? document.exitFullscreen()
      //   : document.mozCancelFullScreen
      //   ? document.mozCancelFullScreen()
      //   : document.webkitExitFullscreen
      //   ? document.webkitExitFullscreen()
      //   : '';
      setTimeout(() => {
        this.setState({
          FullFlag: false,
        });
      }, 200);
      clearTimeout(TimeOutID);
    } else {
      (el.requestFullscreen && el.requestFullscreen()) ||
        (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
        (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) ||
        (el.msRequestFullscreen && el.msRequestFullscreen());
      setTimeout(() => {
        this.setState({
          FullFlag: true,
        });
      }, 200);
    }
  };

  VideoError = (e) => {
    alert('视频出错');
  };

  handleDurationChange = () => {
    this.setState({
      PlayButtonState: 'play',
    });
  };

  handleSeeking = () => {
    this.setState({
      PlayButtonState: 'loading',
    });
  };

  handleMouseDown = (e) => {
    e.stopPropagation();
    this.setState((preState) => ({
      VolumnState: !preState.VolumnState,
    }));
  };

  handleCanPlay = () => {
    this.VideoPlayerCommend('play');
  };

  render() {
    const {
      VideoHeight,
      NowPlay,
      VolumnState,
      PlayButtonState,
      animation,
      BarAnimation,
      ProcessWidth,
      CacheWidth,
      TimeText,
      FullButton,
    } = this.state;
    return (
      <div
        className='cd-video-player-main'
        ref='VideoPlayer'
        onMouseDown={() => {
          this.setState({ VolumnState: false });
        }}
        tabIndex='-1'
      >
        <div className='cd-video-main'>
          <video
            style={{ height: VideoHeight }}
            crossOrigin='*'
            onError={this.VideoError}
            onEnded={this.VideoEnded}
            onDoubleClick={this.FullScreen}
            onClick={() => this.VideoPlayerCommend('play')}
            onProgress={this.VideoCache}
            onTimeUpdate={this.VideoProcess}
            ref='video'
            onDurationChange={this.handleDurationChange}
            onSeeking={this.handleSeeking}
            onCanPlay={this.handleCanPlay}
            src={NowPlay.PlayUrl}
          />
          <div
            className={`cd-video-fliter ${animation}`}
            onClick={() => this.VideoPlayerCommend('play')}
          >
            {PlayButtonState === 'pause' ? (
              <Icon type='caret-right' />
            ) : PlayButtonState === 'play' ? (
              <Icon type='pause' />
            ) : (
              <Icon type='loading' />
            )}
          </div>
          <div
            className={`cd-video-control ${BarAnimation}`}
            onMouseOver={this.ShowControl}
            onMouseOut={this.HideControl}
          >
            <div
              className={`cd-video-play ${PlayButtonState}`}
              onClick={() => this.VideoPlayerCommend('play')}
            />
            <div
              className='cd-video-player-slider-container'
              onMouseDown={(e) => this.TimeChange(e)}
              ref='slider'
            >
              <div
                className='cd-player-process-bar'
                style={{ width: ProcessWidth }}
              >
                <span />
              </div>
              <div className='VideoTempBar' style={{ width: CacheWidth }} />
            </div>
            <div className='cd-video-player-time'>{TimeText}</div>
            <div
              className={`${
                VolumnState ? 'cd-video-player-volumn-active' : ''
              }`}
              style={{ float: 'left', marginTop: '5px' }}
              onMouseDown={(e) => this.handleMouseDown(e)}
            >
              <Icon type='sound' />
            </div>
            <div
              className='FullButton'
              onClick={() => this.FullScreen(FullButton)}
            />
            {VolumnState ? (
              <div className='cd-video-player-volumn' v-show='VolumnState'>
                <div
                  className='cd-player-volumn-container'
                  ref='volunm'
                  onMouseDown={(e) => this.ChangeVolumn(e)}
                >
                  <div className='cd-player-volumn-slider'>
                    <span />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Video;
