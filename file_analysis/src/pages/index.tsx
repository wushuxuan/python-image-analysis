import React from 'react';
import { history } from 'umi';
import { Card, Alert } from 'antd';
import styles from './index.less';

class Index extends React.Component {
  componentDidMount() {
    history.push('/charge')
  }
  render() {
    return (
      <div>
        <Alert message="已完成扫码支付，正在跳转中...." type="success" />
      </div>
    );
  }
}


export default Index;
