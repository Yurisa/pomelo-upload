import React, { Component } from 'react';
import './index.less';

class Music extends Component {
  render() {
    return (
      <div className="cd-music-player-main" style={{width: 200, height: 300}}>
        <audio ref="audio" src="http://localhost:7001/public/uploads/大碗宽面.mp3" autoPlay id="audio"></audio>
      </div>
    )
  }
}

export default Music;