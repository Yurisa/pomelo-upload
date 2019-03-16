import React from 'react'
import { Row,Col } from 'antd';
import '../style/common.less';
import { connect } from 'react-redux';
import NavLeft from '../components/NavLeft';

class Layout extends React.Component{

  render(){
    return (
      <Row className="container">
        <Col span={6} className="nav-left">
          <NavLeft />
        </Col>
        <Col span={18} className="main">
          <Row>
            {this.props.children}
          </Row>
        </Col>
      </Row>
    );
  }
}

export default connect()(Layout);