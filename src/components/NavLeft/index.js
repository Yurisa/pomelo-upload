import React from 'react';
import { Menu, Icon } from 'antd';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { switchMenu } from './../../redux/action';
import MenuConfig from './../../config/menuConfig';
import './index.less';
const SubMenu = Menu.SubMenu;
class NavLeft extends React.Component {
  state = {
    currentKey: ''
  }
  // 菜单点击
  handleClick = ({ item, key }) => {
    if (key === this.state.currentKey) {
      return false;
    }
    // 事件派发，自动调用reducer，通过reducer保存到store对象中
    const { dispatch } = this.props;
    dispatch(switchMenu(item.props.title));

    this.setState({
      currentKey: key
    });
    // hashHistory.push(key);
  };
  componentWillMount() {
    const menuTreeNode = this.renderMenu(MenuConfig);

    this.setState({
      menuTreeNode
    })
  }
  // 菜单渲染
  renderMenu = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <SubMenu title={item.title} key={item.key}>
            {this.renderMenu(item.children)}
          </SubMenu>
        )
      }
      return <Menu.Item title={item.title} key={item.key}>
        <NavLink to={item.key}>
          <Icon type={item.icon} />
          <span>{item.title}</span>
        </NavLink>
      </Menu.Item>
    })
  }
  homeHandleClick = () => {
    const { dispatch } = this.props;
    dispatch(switchMenu('首页'));
    this.setState({
      currentKey: ""
    });
  };
  render() {
    return (
      <div>
        <NavLink to="/setting/upload" onClick={this.homeHandleClick}>
          <div className="logo">
            <img src="/asset/logo-pomelo.svg" alt="" />
            <h1>Pomelo</h1>
          </div>
        </NavLink>
        <Menu
          onClick={this.handleClick}
          theme="dark"
          mode="inline"
        >
          {this.state.menuTreeNode}
        </Menu>
      </div>
    );
  }
}
export default connect()(NavLeft)