import React from 'react';
import { Layout, Form, Input, Button, message, Card } from 'antd';
import { history } from 'umi';
import { UserOutlined,LockOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
import styles from './home.less';

export default () => {
  // const layout = {
  //   labelCol: { span: 8 },
  //   wrapperCol: { span: 16 },
  // };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
    if (values.username == "user" && values.password == "123456") {
      message.success('登录成功！');
      history.push('/choose')
    } else {
      message.error('请检查账号或密码是否填写正确！');
    }
  };

  return (
    <Layout className="layout" style={{backgroundImage: 'url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg)',
    backgroundRepeat:' no-repeat',
    backgroundPosition:' center 110px',
    backgroundSize: '100%',}}>
      <Content style={{ padding: '0 50px', minHeight: '100vh' }}>
        <div style={{ width: '100%', margin: '5% auto' }}>
          <div style={{ textAlign: 'center' }}> <h1 style={{fontSize: '35px', marginTop: '64px',marginBottom: '24px'}}>基于React的图像分析与发布系统</h1></div>
          <div style={{ width: '368px', margin: '5% auto'}}>

            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input size="large" placeholder="用户名：user"  prefix={<UserOutlined />}/>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password size="large"  placeholder="密码：123456"  prefix={<LockOutlined/>} />
              </Form.Item>

              <Form.Item>
                <Button size="large" type="primary" htmlType="submit" style={{width:'100%'}}>
                  登录
            </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

      </Content>
    </Layout>
  );
}
