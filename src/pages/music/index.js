import React, { Component } from 'react';
import { Icon } from 'antd';
import MusicList from '../../components/MusicList';
import Media from '../../utils/media';
import './index.less';

const electron = window.electron;
const { ipcRenderer } = electron;

class Music extends Component {
  state = {
    PlayList:[],
    NowPlay:{
      disk_name:'准备播放',
      count:0,
    },
    TimeText:'00:00/00:00',
    ProcessWidth:0,
    PlayButtonState:'pause',
    VolumnState:false,
    VisualState:true,
    handle: null,
    /* 定时执行句柄 */
    list: [],
    /* lrc歌词及时间轴数组 */
    regex: /^[^[]*((?:\s*\[\d+:\d+(?:\.\d+)?\])+)([\s\S]*)$/,
    /* 提取歌词内容行 */
    regex_time: /\[(\d+):((?:\d+)(?:\.\d+)?)\]/g,
    /* 提取歌词时间轴 */
    regex_trim: /^\s+|\s+$/,
    /* 过滤两边空格 */
    callback: null,
    /* 定时获取歌曲执行时间回调函数 */
    interval: 0.3,
    /* 定时刷新时间，单位：秒 */
    format: '<li>{html}</li>',
    /* 模板 */
    prefixid: 'AudioLrcList',
    /* 容器ID */
    hoverClass: 'this_lrc',
    /* 选中节点的className */
    hoverTop: 100,
    /* 当前歌词距离父节点的高度 */
    duration: 0,
    /* 歌曲回调函数设置的进度时间 */
    __duration: -1,
    header:{
        color:"#4f4f4",
        title:"",
        head:false,
        resize:false,
        mini:true
    }
  }

  componentWillMount() {
    ipcRenderer.on('win-data', (event, data)=>{//接收音乐文件列表的数据
      setTimeout(()=>{
        data.forEach((item,index)=>{
          item.play=false;
          item.disk_name = item.file_name
          if(item.active){
            item.play='active';
            this.playCallBack(item,index);
            this.PlayerCommend('play');
          }
        });
        this.setState({
          PlayList: data
        })
      }, 200);
    });
    ipcRenderer.on('Next',()=>{
      this.PlayerCommend('prev');
    });
    ipcRenderer.on('Prev',()=>{
      this.PlayerCommend('next');
    });
    ipcRenderer.on('Play',()=>{
      this.PlayerCommend('play');
    });
  }

  componentDidMount() {
    this.audio = this.refs.audio;
  }

  ChangeTime = (state) => {
    let media=this.refs.audio;
    if(state==='-'){
        media.currentTime=media.currentTime-5;
    }else{
        media.currentTime=media.currentTime+5
    }
  }

  TimeChange = (e) => {
    let media=this.refs.audio;
    let slider=this.refs.slider;
    Media.MediaControl(media,'play','x',slider,e);
    this.PlayerCommend('play');
  }

  MusicProcess = () => {
    let media=this.refs.audio;
    this.setState({
      TimeText: Media.secondDeal(media.currentTime) + '/' +Media.secondDeal(media.duration),
      ProcessWidth: Math.round(media.currentTime) / Math.round(media.duration) * 100 + "%"
    })
  }

  playCallBack = (item,index) => {
    this.setState((preState) => {
      item.count=index;
      item.PlayUrl=item.downloadUrl;
      return {
        NowPlay: item
      }
    });
  }

  PlayerCommend = (commend) => {
    const { PlayList, NowPlay } = this.state;
    if (!PlayList.length) {
      return
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
          PlayList.forEach((item,index) => {
            if (item.play === 'active') {
              this.playCallBack(item, index);
            }
          });
          this.setState({
            PlayList
          })
        }
        break;
      case 'next':
        if (NowCount !== AllCount - 1) {
          PlayList.forEach((item) => {
            item.play = false;
          });
          PlayList[NowCount + 1].play = 'active';
          PlayList.forEach((item,index) => {
            if (item.play === 'active') {
              this.playCallBack(item, index);
            }
          });
          this.setState({
            PlayList
          })
        } else {
          this.PlayerCommend('play');
        }
        break;
      case 'play':
        let media = this.refs.audio;
        if (media.paused) {
          media.play();
          this.setState({
            PlayButtonState: 'play'
          })
          ipcRenderer.send('player-control', 'audio', 'pause')
        } else {
          media.pause();
          this.setState({
            PlayButtonState: 'pause'
          })
          ipcRenderer.send('player-control', 'audio', 'play')
        }
        if (this.state.VisualState) {
          this.Visual();
        }
        document.getElementsByClassName('cd-music-player-main')[0].focus();
        break;
      default: 
        break;
    }
  }

  ChangeVolumn = (e) => {
    let media=this.refs.audio;
    let volunm=this.refs.volunm;
    Media.MediaControl(media,'volunm','y',volunm,e)
  }

  Visual = () => {
    let audio =this.audio;
    if (!this.audioSrc) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.audioSrc = this.ctx.createMediaElementSource(audio);
      this.audioSrc.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    let frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    let canvas = document.getElementById('canvas'),
        cwidth = canvas.width,
        cheight = canvas.height,
        meterWidth = 10, //width of the meters in the spectrum
        capHeight = 2,
        capStyle = '#5b5bea',
        meterNum = 800 / (10 + 2), //count of the meters
        capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        this.ctx = canvas.getContext('2d');
        let gradient = this.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(1, '#8140ff');
        gradient.addColorStop(0.5, '#5b5bea');
        gradient.addColorStop(0, '#fff');
    const renderFrame = () => {
        let array = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(array);
        let step = Math.round(array.length / meterNum);
        this.ctx.clearRect(0, 0, cwidth, cheight);
        for (let i = 0; i < meterNum; i++) {
            let value = array[i * step];
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);
            };
            this.ctx.fillStyle = capStyle;
            if (value < capYPositionArray[i]) {
                this.ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
            } else {
                this.ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                capYPositionArray[i] = value;
            };
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(i * 12 , cheight - value + capHeight, meterWidth, cheight);
        }
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
    this.setState({
      VisualState: false
    })
  }

  handleMouseDown = (e) => {
    e.stopPropagation();
    this.setState((preState) => ({
      VolumnState: !preState.VolumnState
    }))
  }

  handleCanPlay = () => {
    this.PlayerCommend('play')
  }

  render() {
    const { NowPlay, VolumnState, ProcessWidth, TimeText, PlayList, PlayButtonState } = this.state;
    return (
      <div className="cd-music-player-main">
          <div className="cd-music-player-container">
            <div className="cd-music-player-title">{NowPlay.disk_name}</div>
            <ul>
                <li className="cd-music-player-H-btn"></li>
                <li className="cd-music-player-S-btn" onClick={() => this.PlayerCommend('prev')}>
                  <Icon type="step-backward" />
                </li>
                <li className='cd-music-player-B-btn' onClick={() => this.PlayerCommend('play')}>
                  {
                    PlayButtonState === 'pause' ? <Icon type="caret-right" /> : PlayButtonState === 'play' ? <Icon type="pause" /> : <Icon type="loading"/>
                  }
                </li>
                <li className="cd-music-player-S-btn" onClick={() => this.PlayerCommend('next')}>
                  <Icon type="step-forward" />
                </li>
                <li className="cd-music-player-H-btn" onMouseDown={(e) => this.handleMouseDown(e)}>
                  <Icon type="sound" />
                </li>
            </ul>
            {
              VolumnState ? (
                <div className="cd-music-player-volumn">
                  <div className="cd-player-volumn-container" ref="volunm" onMouseDown={(e) => this.ChangeVolumn(e)}>
                    <div className="cd-player-volumn-slider">
                      <span></span>
                    </div>
                  </div>
                  </div>
              ) : null          
            }
            <div className="cd-music-player-time"><div id="AudioLrcList"></div><span>{TimeText}</span></div>
            <div className="cd-player-slider-container" onMouseDown={(e) => this.TimeChange(e)} ref="slider">
                <div className="cd-player-slider" style={{width: ProcessWidth}}>
                  <span></span>
                </div>
            </div>
            <canvas width="350" height="240" id="canvas"></canvas>
          </div>
          <audio 
            id="audio"
            ref="audio" 
            preload="auto" 
            onEnded={() => this.PlayerCommend('next')} 
            onTimeUpdate={this.MusicProcess} 
            onError={() => this.PlayerCommend('next')} 
            onDurationChange={() => this.setState({PlayButtonState: 'play'})} 
            onSeeking={() => this.setState({PlayButtonState: 'loading'})} 
            onCanPlay={this.handleCanPlay} 
            src={NowPlay.PlayUrl} >
          </audio>
          <MusicList PlayList={PlayList} play={this.playCallBack} ref="List"></MusicList>
      </div>
    )
  }
}

export default Music;