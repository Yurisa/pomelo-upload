import React, { Component } from 'react';
import UploadFile from '../../components/UploadFile';
import './index.less';

const electron = window.electron;
const { ipcRenderer } = electron;



// ipcRenderer.on('bigFileUpload', (event, files) => {
//   console.log('收到消息了');
//   // this.setState({
//   //   // file: files[0],
//   //   test: '收到文件了'
//   // })
// })


class Uploading extends Component {
  state = {
    uploadList: [],
    file: undefined,
    test: '1'
  }

  componentWillMount() {
    console.log('will mount');
    // ipcRenderer.on('message', (event, arg) => {
    //   alert("123")
    //   alert(arg)
    // })
    ipcRenderer.on('bigFileUpload', (event, files) => {
      console.log('收到消息了');
      alert("123")
      alert(files)
      console.log(files)
      // this.setState({
      //   // file: files[0],
      //   test: '收到文件了'
      // })
    })
  }


  componentWillUnmount() {
    ipcRenderer.removeAllListeners('bigFileUpload')
  }

  render() {
    const { file, test } = this.state;

    return (
      <div>
        <div style={{color: '#eeeeee'}}>{test}</div>
        <UploadFile file={file}/>
      </div>
    )
  }
}

export default Uploading;