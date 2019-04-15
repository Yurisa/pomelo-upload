import React, { Component } from 'react';
import './index.less';

class Video extends Component {

  state = {
    PlayList:[],
    NowPlay:{
        disk_name:'准备播放',
        count:0,
    },
    TimeText:'00:00/00:00',
    ProcessWidth:0,
    VideoHeight:'calc(100% - 70px)',
    CacheWidth:0,
    PlayButtonState:'sf-icon-play',
    VolumnState:false,
    animation:'',
    BarAnimation:'',
    FullFlag:false,
    FullButton:'sf-icon-expand',
    TimeOutID:0,
    header:{
        title:"",
    }
  }

  render() {
    return (
      <div className="cd-video-player-main" ref="VideoPlayer" onMouseDown={() => {this.setState({VolumnState: false})}} tabIndex="-1">

      </div>
    )
  }
}

export default Video;