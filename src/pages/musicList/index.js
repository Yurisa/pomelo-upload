import React, { Component } from 'react';
import './index.less';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
const domain = 'http://localhost:7001'

class MusicList extends Component {

  componentDidMount() {
    this.view({
      downloadPath: `${domain}/public/uploads/${encodeURIComponent('课程源码.zip')}`
    })
  }

  // 查看
  view(row) {

    JSZipUtils.getBinaryContent(row.downloadPath, (err, data) => {
        if(err) {
            throw err; 
        }
        JSZip.loadAsync(data).then((files) => {
            files.files['课程源码/.gitignore'].async("string").then(function(con){
  
              console.log(con);
            })
        })
    })
  }


  render() {
    return (
      <div>test123</div>
    )
  }
}

export default MusicList;