import React, { Component } from 'react';
import { Progress, Icon } from 'antd';
import './index.less';

const electron = window.electron;

class DownloadFile extends Component {
  state = {
    downloadPrgInnerText: 0,
  }

  ControlButton(state){
    let btn='';
    if(state==='interrupted'){
      btn='play-circle';
    }else if(state==='progressing'){
      btn='pause';
    }else if(state==='completed'){
      btn='play-circle';
    }
    return btn;
 }

  ControlTrans(item,index){
    this.props.ControlTrans(item,index)
  }

  PercentCount(item){
    return parseFloat(((item.chunk/item.size)*100));
  }

  OpenDownPath(item){
    electron.shell.showItemInFolder(item.path);
  } 

  CopyLink(item){
    electron.clipboard.writeText(item.url[0]);
  }

  taskTips(item){
    let tips='正在开始';
    if(item.state==='progressing'){
        tips='正在'+(item.trans_type==='upload'?'上传':'下载');
    }else if(item.state==='completed'){
        tips=(item.trans_type==='upload'?'上传':'下载')+'完成'
    }else if(item.state==='interrupted'){
        tips='已暂停'
    }
    return tips
  }

  formatSeconds(value) {
    let secondTime = parseInt(value);// 秒
    let minuteTime = 0;// 分
    let hourTime = 0;// 小时
    if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if(minuteTime > 60) {
            //获取小时，获取分钟除以60，得到整数小时
            hourTime = parseInt(minuteTime / 60);
            //获取小时后取佘的分，获取分钟除以60取佘的分
            minuteTime = parseInt(minuteTime % 60);
        }
    }
    let result = "" + parseInt(secondTime) + "秒";
    if(minuteTime > 0) {
        result = "" + parseInt(minuteTime) + "分" + result;
    }
    if(hourTime > 0) {
        result = "" + parseInt(hourTime) + "小时" + result;
    }
    return result;
  }

  MathSpeend(item){
    let NowTime=(new Date().getTime()/1000);
    let time=NowTime-item.time;
    let speed=parseFloat(item.chunk/time);
    let remaining_chunk=item.size-item.chunk;
    let remaining_time=remaining_chunk/speed;
    return this.FileSize(speed) +'/s  剩余时间:' + this.formatSeconds(remaining_time);
  }

  FileSize (bytes) {
    bytes=parseFloat(bytes);
    if (bytes === 0) return '0B';
    let k = 1024,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i];
  }

  render() {
    const { index, file } = this.props;
    return file ? (
      <div className="task-item">
        <div className="task-name">
          {`${this.taskTips(file)}   ${file && file.name || ''}`}
        </div>
        <div className="task-actions">
          <Icon type={this.ControlButton(file && file.state)} onClick={(e) => this.ControlTrans(e, file, index)}/>
          <Icon type="close" onClick={(e) => this.ControlTrans(e, file, index)}/>
          <Icon type="folder" onClick={() => this.OpenDownPath(file)}/>
          <Icon type="link" onClick={() => this.CopyLink(file)} />
        </div>
        <div className="task-progress">
          <Progress  
            strokeColor="#87d068"
            percent={this.PercentCount(file)}
            status="active"/>
        </div>
        <div className="task-speed">
            { this.FileSize(file.chunk)} / {this.FileSize(file.size)}
            { file.state === 'progressing' ? <span>{this.MathSpeend(file)}</span> : null}
          </div>
      </div> 
    ): null
  }
}

export default DownloadFile;