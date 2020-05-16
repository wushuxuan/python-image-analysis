import cv2
import base64
import numpy as np
import flask, json,random
from PIL import Image
from flask import request


# 创建一个服务，把当前这个python文件当做一个服务
server = flask.Flask(__name__)
# server.config['JSON_AS_ASCII'] = False
# @server.route()可以将普通函数转变为服务 登录接口的路径、请求方式
@server.route('/analysiszfjh', methods=['POST'])
def analysiszfjh():
    # 获取通过url请求传参的数据
    url = request.form['url']
    # 判断用户名、密码都不为空，如果不传用户名、密码则username和pwd为None
    if url:
        if url:
            img = base64_to_image(url)
            dark1 = cv2.imwrite('dark_1.jpg',img)
            imgread = cv2.imread('dark_1.jpg',0)
			# histogram equalization
            equ = cv2.equalizeHist(imgread)
            dark2 = cv2.imwrite('dark_jh.jpg',equ)
            imgread2 = cv2.imread('dark_jh.jpg',0)
            base64_str = cv2.imencode('.jpg',imgread2)[1].tostring()
            base64_str1 = str(base64.b64encode(base64_str))[2:-1]
			# 两个图片的像素分布连接在一起，拍成一维数组
			# res = np.hstack((img,equ))
            resu = {'code': 200, 'message': equ.tolist(),'url':base64_str1}
            return json.dumps(resu, ensure_ascii=False)  # 将字典转换为json串, json是字符串
        else:
            resu = {'code': -1, 'message': 'url不能为空'}
            return json.dumps(resu, ensure_ascii=False)
@server.route('/analysis', methods=['POST'])
def analysis():
    # 获取通过url请求传参的数据
    url = request.form['url']
    # 判断用户名、密码都不为空，如果不传用户名、密码则username和pwd为None
    if url:
        if url:
            img = base64_to_image(url)
            histb = cv2.calcHist([img],[0],None,[256],[0,255])
            resu = {'code': 200, 'message': histb.tolist()}
            return json.dumps(resu, ensure_ascii=False)  # 将字典转换为json串, json是字符串
        else:
            resu = {'code': -1, 'message': 'url不能为空'}
            return json.dumps(resu, ensure_ascii=False)
@server.route('/PepperandSalt', methods=['POST'])
def PepperandSalt():
    # 获取通过url请求传参的数据
    url = request.form['url']
    # 判断用户名、密码都不为空，如果不传用户名、密码则username和pwd为None
    if url:
        if url:
            img = base64_to_image(url)
            dark1 = cv2.imwrite('zs_1.jpg',img)
            imgread = cv2.imread('zs_1.jpg',0)
            img1=PepperandSaltUrl(img,0.2)
            dark2 = cv2.imwrite('zs_jh.jpg',img1)
            imgread2 = cv2.imread('zs_jh.jpg',0)
            base64_str = cv2.imencode('.jpg',imgread2)[1].tostring()
            base64_str1 = str(base64.b64encode(base64_str))[2:-1]
            resu = {'code': 200, 'message': base64_str1}
            return json.dumps(resu, ensure_ascii=False)  # 将字典转换为json串, json是字符串
        else:
            resu = {'code': -1, 'message': 'url不能为空'}
            return json.dumps(resu, ensure_ascii=False)
def PepperandSaltUrl(src,percetage):
    NoiseImg=src
    NoiseNum=int(percetage*src.shape[0]*src.shape[1])
    for i in range(NoiseNum):
        randX=np.random.random_integers(0,src.shape[0]-1)
        randY=np.random.random_integers(0,src.shape[1]-1)
        if np.random.random_integers(0,1)<=0.5:
            NoiseImg[randX,randY]=0
        else:
            NoiseImg[randX,randY]=255          
    return NoiseImg 
def base64_to_image(base64_code):
    # base64解码
    img_data = base64.b64decode(base64_code)
    # 转换为np数组
    img_array = np.fromstring(img_data, np.uint8)
    # 转换成opencv可用格式
    img = cv2.imdecode(img_array, cv2.COLOR_RGB2BGR)
    return img
if __name__ == '__main__':
	server.run(debug=True, port=8888, host='0.0.0.0')
