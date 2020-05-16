import React from 'react';
import { Layout, Upload, message, Button, Card } from 'antd';
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


const { Header, Content, Footer } = Layout;



class file extends React.Component {

  state = {
    imageUrl: "",
    loading: false,
    data: [],
    datazfjh: [],
    zhfxUrl: '',
    zsUrl: ''
  }

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
        console.log(imageUrl)
        var fd = new FormData()
        fd.append('url', imageUrl.replace(/^data:image\/\w+;base64,/, ""))
        axios.post('api/analysis', fd)
          .then((response) => {
            console.log("直方图：")
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

        //直方均衡图
        axios.post('api/analysiszfjh', fd)
          .then((response) => {
            console.log("直方均衡图：")
            console.log(response);
            console.log(response.data.message);
            var resData: any = [];
            response.data.message.forEach((element: any, index: any) => {
              resData.push({ value: element[0], rgb: index })
            });
            console.log(resData)
// localStorage.setItem("zhfxUrl","data:image/jpeg;base64," + response.data.url)
            this.setState({
              datazfjh: resData,
              zhfxUrl: "data:image/jpeg;base64," + response.data.url
            })
          })
          .catch(function (error) {
            console.log(error);
          });


        //噪声图
        axios.post('api/PepperandSalt', fd)
          .then((response) => {
            console.log("噪声图：")
            console.log(response);
            this.setState({
              zsUrl: "data:image/jpeg;base64," + response.data.message
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

  render() {
    const { imageUrl, data, datazfjh } = this.state;
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
          <h1 style={{ color: '#fff', flex: '1' }}>图像分析 - 免费功能</h1>
          <Button type="primary" style={{ marginTop: '18px' }} onClick={() => history.push('/')}>
            退出
        </Button>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Card title="上传图片">
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={this.beforeUpload}
              onChange={this.handleChange}
            >
              {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </Card>
          <Card title="分析结果" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', flexFlow: 'row' }}>
              <div style={{ flex: 1 }}>
                <h1>直方图分析：</h1>
                <Chart width={600} height={400} data={data} scale={cols} forceFit>
                  <Axis name="rgb" />
                  <Axis name="value" />
                  <Tooltip
                    crosshairs={{
                      type: "y"
                    }}
                  />
                  <Geom type="line" position="rgb*value" size={2} />
                </Chart>
              </div>
              <div style={{ flex: 1 }}>
                <h1>直方均衡分析：</h1>
                <Chart width={600} height={400} data={datazfjh} scale={cols} forceFit>
                  <Axis name="rgb" />
                  <Axis name="value" />
                  <Tooltip
                    crosshairs={{
                      type: "y"
                    }}
                  />
                  <Geom type="line" position="rgb*value" size={2} />
                </Chart>
              </div>
            </div>
          </Card>
          <Card style={{opacity:0}}>
            <img style={{ width: '350px' }} src={this.state.zhfxUrl} />
            <img style={{ width: '350px',marginLeft:12 }} src={this.state.zsUrl} />
          </Card>

        </Content>
        <Footer style={{ textAlign: 'center' }}>by XXX</Footer>
      </Layout>
    );
  }
}



export default file;