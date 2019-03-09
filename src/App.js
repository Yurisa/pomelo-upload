import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const electron = window.electron;
const {ipcRenderer} = electron;
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')


class App extends Component {

  state = {
    dropover: false
  }

  componentDidMount() {
    console.log('挂载完毕');
    ipcRenderer.on('uploadProgress', (event, progress) => {
      console.log(progress);
    });
  }

  onDrop = (e) => {
    e.preventDefault();
    this.setState({
      dragover: false
    });
    console.log('file1', e.dataTransfer.files);
    this.ipcSendFiles(e.dataTransfer.files)
  }

  onDragOver = (e) => {
    e.preventDefault();
    this.setState({
      dragover: true
    });
  }

  onDragLeave = (e) => {
    e.preventDefault();
    this.setState({
      dragover: false
    })
  }

  onPaste = (e) => {
    e.preventDefault();
 
    const items = e.clipboardData && e.clipboardData.items;
    console.log('clipitems', items);
    let files = [];
    let file = null;
    if (items && items.length) {
      for(let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
    }
    const reader = new FileReader();
    debugger
    reader.onload = function(e) {
      const base64_str = e.target.result;
      console.log(base64_str);
    }
    reader.readAsDataURL(file); 
    console.log('file2', file);
  }

  ipcSendFiles = (files) => {
    let sendFiles = [];
    Array.from(files).forEach((item, index) => {
      let obj = {
        name: item.name,
        path: item.path
      }
      sendFiles.push(obj)
    });
    console.log(sendFiles);
    ipcRenderer.send('uploadChoosedFiles', sendFiles);
  }

  

  render() {
    const { dropover } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload1234.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <div style={{width: 400, height: 400, background: 'red'}} onPaste={this.onPaste} onDrop={this.onDrop} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} >

          </div>
        </header>
      </div>
    );
  }
}

export default App;
