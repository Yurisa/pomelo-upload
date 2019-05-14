import React, { Component } from 'react';
import './index.less';

class MouseMenu extends Component {

  state = {
    MenuData:[  
      {
        name:"打开",key:"Ctrl+O",command:"open",data:"",disabled:'SelectFiles.length>1'
      },
      {
        name:"下载",key:"Ctrl+d",command:"download",data:""
      },
      {
        name:"删除",key:"Ctrl+dd",command:"remove",data:""
      },
      {
        name:"属性",key:"Alt+Enter",command:"info",data:"",disabled:'SelectFiles.length>1'
      }
    ],
    MouseMenuShow: false,
  }

  MenuShow = (event) => { 
    if(event.button!==2){
      this.setState({
        MouseMenuShow: false
      })
      return
    }
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      MouseMenuShow: true
    }, () => {
      let menu = this.refs.MouseMenu;
      let createNode = this.props.node;
      menu.style.left = event.pageX + -parseFloat(createNode.getBoundingClientRect().left) + createNode.offsetLeft + 'px';
      menu.style.top = event.pageY + -parseFloat(createNode.getBoundingClientRect().top) + createNode.offsetTop + 'px';
      // if ((menu.getBoundingClientRect().left + menu.offsetWidth) > createNode.getBoundingClientRect().width) {
      //     menu.style.left = createNode.getBoundingClientRect().width - menu.getBoundingClientRect().width + 'px';
      // }
      // if ((menu.getBoundingClientRect().top + menu.offsetHeight) - createNode.getBoundingClientRect().top > createNode.offsetHeight) {
      //     menu.style.top = createNode.getBoundingClientRect().height - menu.getBoundingClientRect().height + 'px';
      // }
      createNode.onmouseup = () => {
          if (event.button === 2) {
              createNode.onmousedown = null;
              createNode.onmouseup = null;
          }
      };
    })
  }

  MenuClick = (item) => {
    this.props.handleClick(item);
    this.setState({
      MouseMenuShow: false
    })
  }

  render() {
    const { MouseMenuShow, MenuData } = this.state;
    return  MouseMenuShow ? (
      <ul ref="MouseMenu" className="cd-mouse-menu">
        {
          MenuData.map((item, index) => (
            <li onClick={() => this.MenuClick(item)} key={index}>
              <button>{item.name}<span>{item.key}</span></button>
            </li>
          ))
        }
      </ul>
    ) : null
  }
}

export default MouseMenu;