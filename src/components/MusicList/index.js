import React, { Component } from 'react';
import './index.less';

class MusicList extends Component {

  ClickPlay = (item, index) => {
    const { PlayList } = this.props;
    PlayList.forEach((list)=>{
      list.play=false;
    });
    item.play='active';
    this.props.play(item, index)
  }

  render() {
    const { PlayList } = this.props;
    return (
      <ul className="sf-music-player-list">
        {
          PlayList.map((item, index) => {
            const { play, disk_name } = item;
            return <li key={index} className={play ? 'active' : ''} onClick={() => this.ClickPlay(item,index)}>{index < 9?'0':''}{index+1} {disk_name}</li>
          })
        }
      </ul>
    )
  }
}

export default MusicList;