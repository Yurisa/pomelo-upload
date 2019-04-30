import React, { Component } from 'react';
import Highlight from 'react-highlight'; 
import axios from 'axios';
import 'highlight.js/styles/github.css';
import './index.less';

const electron = window.electron;
const { ipcRenderer } = electron;
const domain = 'http://localhost:7001';

class Text extends Component {
  state = {
    content: ''
  }

  componentWillMount() {
    ipcRenderer.on('win-data', async (event, data)=>{//接收音乐文件列表的数据
      const { data: res } = await axios.get(`${domain}/fileContent?fileName=${data.file_name}`);
      if (res.code === 1) {
        this.setState({
          content: res.data
        });
      }
    });
  }

  render() {
    const { content } = this.state;
    return (
      <div className="text-main">
        <Highlight language="text">
          {content}
        </Highlight>
      </div>
    )
  }
}

export default Text;