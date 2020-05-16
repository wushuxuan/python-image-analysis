import React from 'react';
import { Layout, Card, message, Button, Modal } from 'antd';
import { history } from 'umi';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Guide,
  Shape,
  Facet,
  Util
} from "bizcharts";
import axios from 'axios';
import styles from './file.less';
const { Meta } = Card;

const { Header, Content, Footer } = Layout;



class file extends React.Component {

  state = {
    imageUrl: "",
    loading: false,
    data: [],
    visible: false
  }


  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e: any) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e: any) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  getBase64 = (img: any, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  handleChange = (info: any) => {
    console.log(info)
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, (imageUrl: any) => {
        this.setState({
          imageUrl,
          loading: false,
        });
        var fd = new FormData()
        fd.append('url', imageUrl.replace(/^data:image\/\w+;base64,/, ""))
        axios.post('api/analysis', fd)
          .then((response) => {
            console.log(response);
            console.log(response.data.message);
            var resData: any = [];
            response.data.message.forEach((element: any, index: any) => {
              resData.push({ value: element[0], rgb: index })
            });
            console.log(resData)
            this.setState({
              data: resData
            })
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      );
    }
  };


  beforeUpload = (file: any) => {
    console.log(file.type)
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'video/mp4';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG/MP4 file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('FILE must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  }

  charge = () => {
    axios.get('pay/alipay')
      .then((response) => {
        console.log(response);
        console.log(response.data.message);
        window.location.href = response.data.message
      })
      .catch(function (error) {
        console.log(error);
      });
    //  history.push('/charge')
  }

  render() {
    const { imageUrl, data } = this.state;
    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const cols = {
      value: {
        min: 0
      },
      rgb: {
        range: [0, 1]
      }
    };

    return (
      <Layout className="layout">
        <Header style={{ display: 'flex', flexFlow: 'row' }}>
          <h1 style={{ color: '#fff', flex: '1' }}>图像分析与发布</h1>
          <Button type="primary" style={{ marginTop: '18px' }} onClick={() => history.push('/')}>
            退出
        </Button>
        </Header>
        <Content style={{
          padding: '0 50px', minHeight: '80vh', backgroundImage: 'url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg)',
          backgroundRepeat: ' no-repeat',
          backgroundPosition: ' center 110px',
          backgroundSize: '100%',
        }}>
          {/* <div style={{ textAlign: 'center', marginTop: '15%' }}><Button size="large" type="primary" onClick={this.showModal}>功能介绍</Button></div>
          <div style={{ display: 'flex', flexFlow: 'row', marginTop: '5%' }}>
            <div style={{ flex: 1, textAlign: 'center' }}><Button size="large" type="primary" onClick={() => history.push('/file')}>免费功能</Button></div>
            <div style={{ flex: 1, textAlign: 'center' }}><Button size="large" type="primary" onClick={this.charge}>付费功能</Button></div>
          </div> */}
          <div style={{width:'80%',margin:'24px auto',display:'flex',flexFlow:'row'}}>
            <Card
              hoverable
              style={{ width: 240,flex:1,marginRight:24 }}
              cover={<img alt="example" src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*ZhzDQLMyYlYAAAAAAAAAAABkARQnAQ" />}
            >
              <Meta title="功能介绍" description="本系统是一个基于react的图像分析与发布系统" onClick={this.showModal}/>
            </Card>
            <Card
              hoverable
              style={{ width: 240,flex:1,marginRight:24 }}
              cover={<img alt="example" src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*I-ygS5prYksAAAAAAAAAAABkARQnAQ" />}
            >
              <Meta title="免费功能" description="免费功能仅展示图像分析折线图" onClick={() => history.push('/file')}/>
            </Card>
            <Card
              hoverable
              style={{ width: 240,flex:1,marginRight:24 }}
              cover={<img alt="example" src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*mb-WQILTlSEAAAAAAAAAAABkARQnAQ" />}
            >
              <Meta title="付费功能" description="付费功能展示图像分析折线图以及对比图" onClick={this.charge}/>
            </Card>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>by XXX</Footer>
        <Modal
          title="功能介绍"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确认"
          cancelText="取消"
        >
          <p>
            本系统是一个基于react的图像分析与发布系统。其中免费功能包括给出图像的直方图喝噪声分析图。收费功能要求你完成收费授权后，系统根据你所上载的图像，给出对应的处理结果图。
          </p>
        </Modal>
      </Layout>
    );
  }
}



export default file;