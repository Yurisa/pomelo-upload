import React, { Component } from 'react';
import { Tabs } from 'antd';
import './index.less';

const TabPane = Tabs.TabPane;
const db = window.db;

class AllFiles extends Component {

  state = {
    data: []
  }

  componentDidMount() {
    console.log("get")
    this.getFiles();
  }

  handleChange = (key) => {
    console.log(key)
  }

  processData = (data) => {
    data.forEach(d => {
      d.icon = '/asset/filetype/ImageType.png'
    });
    return data;
  }


  getFiles = () => {
    let data = db.read().get('uploaded').slice().reverse().value();
    this.setState({
      data: data
    });
  }

  render() {
    const { data } = this.state;
    const files = this.processData(data);
    console.log('files', files);
    return (
      <Tabs defaultActiveKey="1" onChange={this.handleChange} tabBarStyle={{color: '#eeeeee'}}>
        <TabPane tab="全部文件" key="1">
        {
          files.length > 0 && files.map((item, index) => {
            const {fileName, icon} = item;
            return (
              <div className="cd-disk-block-file" key={index}>
                <span class="icon">
                  <img src={icon} />  
                </span>
                <p>{fileName}</p>   
              </div>
            )
          })
        }
        </TabPane>
        <TabPane tab="正在下载" key="2">
        </TabPane>
      </Tabs>
    )
  }
}

export default AllFiles;