import React, { Component } from 'react';
import './index.less';

const electron = window.electron;
const { ipcRenderer } = electron;

class Pdf extends Component {
  state = {
    src: null
  }

  componentWillMount() {
    ipcRenderer.on('win-data', (event, data)=>{//接收打开pdf文件的数据
      setTimeout(()=>{
        this.setState({
          src: `/pdf/web/viewer.html?file=${data.downloadUrl}')`
        })
      }, 200);
    });
  }

  render() {
    const { src } = this.state;
    return (
      <div className="PdfWindow">
        <div className="PDfContainer">
          <iframe src={src}></iframe>
        </div>
      </div>
    )
  }
}

export default Pdf;