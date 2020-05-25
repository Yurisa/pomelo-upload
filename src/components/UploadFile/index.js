import React, { Component } from 'react';
import SparkMD5 from 'spark-md5';
import { Progress, Icon } from 'antd';
import './index.less';

const blobSlice = File.prototype.slice;
const chunkSize = 1024 * 1024 * 4; // 4MB一块

class UploadFile extends Component {
  state = {
    file: undefined,
    chunks: 0, // 文件总块数
    chunk: 0, // 文件块序号
    isPause: false, // 是否暂停
    fileSize: 0, // 文件大小
    currentChunk: 0,
    isGetMD5: false,
    uploadPrgInnerText: 0,
    fileIndex: 0,
    status: 'progressing', // 三个状态 progressing interrupted completed
  };

  componentDidMount() {
    const file = this.props.file;
    if (file) {
      this.setState(
        {
          fileIndex: 0,
          currentChunk: 0,
          uploadPrgInnerText: 0,
          file: file,
          fileSize: file.size,
          chunks: Math.ceil(file.size / chunkSize),
        },
        () => {
          this.loadBlob(this.state.file);
        }
      );
    }
  }

  sliceChunks = () => {
    const { currentChunk, file, fileSize } = this.state;
    const start = currentChunk * chunkSize;
    const end = start + chunkSize > fileSize ? fileSize : start + chunkSize;

    return blobSlice.call(file, start, end);
  };

  loadBlob = (file) => {
    let chunkSize = 1024 * 1024 * 100, // 每一个文件块为2MB
      chunks = Math.ceil(file.size / chunkSize), // 文件块总数
      chunk = 0, // 文件块的序号
      spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    let loadNext = () => {
      let start = chunk * chunkSize;
      let end = Math.min(start + chunkSize, file.size);

      // 分块读取文件流
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));

      fileReader.onload = (e) => {
        spark.append(e.target.result);
      };

      fileReader.onloadend = () => {
        fileReader.onload = fileReader.onloadend = null;

        if (++chunk < chunks) {
          setTimeout(loadNext, 1);
        } else {
          this.setState(
            (preState) => {
              preState.file.fileMD5 = spark.end();
              return {
                file: preState.file,
                isGetMD5: true,
              };
            },
            () => {
              loadNext = spark = null;
              this.upload();
            }
          );
        }
      };
    };

    loadNext();
  };

  upload = () => {
    const { fileSize, isGetMD5, chunks, file, status } = this.state;
    console.log('开始上传', file);
    let { currentChunk } = this.state;

    if (!fileSize) {
      alert('请选择要上传的文件');
      return;
    }

    if (!isGetMD5) {
      alert('文件较大，MD5值尚未计算完毕，请稍后再试');
      return;
    }

    const xhr = new XMLHttpRequest();
    const chunkData = this.sliceChunks();
    const formData = new FormData();

    this.setState(
      {
        fileIndex: currentChunk + 1,
      },
      () => {
        const { fileIndex } = this.state;
        if (currentChunk + 1 > chunks) return;

        formData.append('fileIndex', fileIndex);
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size);
        formData.append('fileMD5', file.fileMD5);
        formData.append('fileChunks', chunks);
        formData.append('fileContent', chunkData);

        // 获取上传进度
        xhr.upload.onprogress = (e) => {
          this.setState(
            {
              uploadPrgInnerText: parseInt(
                (fileIndex * 10000) / (chunks * 100)
              ),
            },
            () => {
              if (fileIndex === chunks) {
                this.setState({
                  status: 'completed',
                  file: undefined,
                });
                setTimeout(() => {
                  const notification = new window.Notification('上传完成', {
                    title: '上传完成',
                    body: '您有1个任务上传完成',
                  });
                  notification.onClick = () => {
                    console.log('notify');
                  };
                  this.props.onFinished(this.props.index);
                }, 500);
              }
            }
          );
        };

        xhr.open('POST', `http://localhost:7001/upload`);

        xhr.onreadystatechange = () => {
          try {
            if (xhr.readyState === 4 && xhr.status === 200) {
              let result = JSON.parse(xhr.responseText);
              if (result.exist === 1) {
                xhr.abort();
                this.setState({
                  fileIndex: 0,
                  currentChunk: 0,
                  uploadPrgInnerText: 100,
                  status: 'completed',
                });
                this.props.onFinished(this.props.index);
              } else {
                this.setState(
                  {
                    currentChunk: ++currentChunk,
                  },
                  () => {
                    if (fileIndex < chunks && status === 'progressing') {
                      this.upload();
                    }
                  }
                );
              }
            }
          } catch (e) {
            console.log(e);
          }
        };

        xhr.send(formData);
      }
    );
  };

  pause = () => {
    const { fileSize } = this.state;
    if (!fileSize) {
      alert('请选择要上传的文件');
      return;
    }
    this.setState({
      status: 'interrupted',
    });
  };

  reupload = () => {
    console.log('执行reupload');
    this.setState(
      {
        status: 'progressing',
      },
      () => {
        this.upload();
      }
    );
  };

  controlBtn = () => {
    const { status } = this.state;
    if (status === 'progressing') {
      return 'pause';
    }
    return 'play-circle';
  };

  taskTips = () => {
    const { status } = this.state;
    let tips = '正在开始';
    if (status === 'progressing') {
      tips = '正在上传';
    } else if (status === 'completed') {
      tips = '上传完成';
    } else if (status === 'interrupted') {
      tips = '已暂停';
    }
    return tips;
  };

  render() {
    const { uploadPrgInnerText, file, status } = this.state;
    return file ? (
      <div className='task-item'>
        <div className='task-name'>
          {`${this.taskTips()}   ${(file && file.name) || ''}`}
        </div>
        <div className='task-actions'>
          <Icon
            type={this.controlBtn()}
            onClick={status === 'interrupted' ? this.reupload : this.pause}
          />
          <Icon
            type='close'
            onClick={() => this.props.onFinished(this.props.index)}
          />
        </div>
        <div className='task-progress'>
          <Progress
            strokeColor='#87d068'
            percent={uploadPrgInnerText}
            status='active'
          />
        </div>
      </div>
    ) : null;
  }
}

export default UploadFile;
