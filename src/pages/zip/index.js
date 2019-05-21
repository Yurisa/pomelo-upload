import React, { Component } from 'react';
import './index.less';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
const domain = 'http://localhost:7001';
const electron = window.electron;
const { ipcRenderer } = electron;

class Zip extends Component {

  state = {
    fileName: '',
    innerFiles: []
  }
  componentDidMount() {
    ipcRenderer.on('win-data', async (event, data) => {//接收音乐文件列表的数据
      this.setState({
        fileName: data.file_name.split('.')[0]
      })
      this.view({
        downloadPath: `${domain}/public/uploads/${encodeURIComponent(data.file_name)}`
      })
    });

  }

  // 查看
  view(row) {

    JSZipUtils.getBinaryContent(row.downloadPath, (err, data) => {
      if (err) {
        throw err;
      }
      JSZip.loadAsync(data).then((files) => {
        const innerFiles = [];
        for (const key in files.files) {
          innerFiles.push(files.files[key])
        }
        this.setState({
          innerFiles: innerFiles
        })
      })
    })
  }

  processData = (data) => {
    data.map(d => {
      d.fileName = d.name;
      const file_suffix = d.name.replace(/.+\./,"")
      if (file_suffix === 'xls') {
        d.icon = './asset/filetype/ExcelType.png';
      } else if (file_suffix === 'doc' || file_suffix === 'docx') {
        d.icon = './asset/filetype/DocType.png';
      } else if (file_suffix === 'pdf') {
        d.icon = './asset/filetype/PdfType.png';
      } else if (file_suffix === 'mp4') {
        d.icon = './asset/filetype/VideoType.png';
      } else if (file_suffix === 'rar' || file_suffix === 'zip') {
        d.icon = './asset/filetype/RarType.png';
      } else if (file_suffix === 'ppt' || file_suffix === 'pptx') {
        d.icon = './asset/filetype/PptType.png';
      } else if (file_suffix === 'svg' || file_suffix === 'png' || file_suffix === 'jpg') {
        d.icon = './asset/filetype/ImageType.png';
      } else if (file_suffix === 'mp3') {
        d.icon = './asset/filetype/MusicType.png'
      } else if (file_suffix === 'txt') {
        d.icon = './asset/filetype/TxtType.png'
      } else {
        d.icon = './asset/filetype/OtherType.png';
      }
    });
    return data;
  }


  render() {
    const { innerFiles:files } = this.state;
    const innerFiles = this.processData(files);
    return (
      <div>
        {
          innerFiles.length > 0 && innerFiles.map((item, index) => {
            const { fileName, icon } = item;
            return (
              <div
                className={`cd-disk-block-file ${item.active ? 'cd-disk-block-file-active' : null}`}
                key={`${fileName}_${index}`}
              >
                <span className="icon">
                  <img src={icon} alt="" />
                </span>
                <p>{fileName}</p>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default Zip;