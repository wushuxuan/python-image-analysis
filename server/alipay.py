# -*- coding: utf-8 -*-


from datetime import datetime
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
from base64 import b64encode, b64decode
from urllib.parse import quote_plus
from urllib.parse import urlparse, parse_qs
from urllib.request import urlopen
from base64 import decodebytes, encodebytes
import numpy as np
import flask,random
from flask import request
import json

server = flask.Flask(__name__)
class AliPay(object):
    """
    支付宝支付接口
    """
    def __init__(self, appid, app_notify_url, app_private_key_path,
                 alipay_public_key_path, return_url, debug=False):
        self.appid = appid
        self.app_notify_url = app_notify_url
        self.app_private_key_path = app_private_key_path
        self.app_private_key = None
        self.return_url = return_url
        with open(self.app_private_key_path) as fp:
            self.app_private_key = RSA.importKey(fp.read())
        self.alipay_public_key_path = alipay_public_key_path
        with open(self.alipay_public_key_path) as fp:
            self.alipay_public_key = RSA.import_key(fp.read())


        if debug is True:
            self.__gateway = "https://openapi.alipaydev.com/gateway.do"
        else:
            self.__gateway = "https://openapi.alipay.com/gateway.do"

    def direct_pay(self, subject, out_trade_no, total_amount, return_url=None, **kwargs):
        biz_content = {
            "subject": subject,
            "out_trade_no": out_trade_no,
            "total_amount": total_amount,
            "product_code": "FAST_INSTANT_TRADE_PAY",
            # "qr_pay_mode":4
        }

        biz_content.update(kwargs)
        data = self.build_body("alipay.trade.page.pay", biz_content, self.return_url)
        return self.sign_data(data)

    def build_body(self, method, biz_content, return_url=None):
        data = {
            "app_id": self.appid,
            "method": method,
            "charset": "utf-8",
            "sign_type": "RSA2",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "version": "1.0",
            "biz_content": biz_content
        }

        if return_url is not None:
            data["notify_url"] = self.app_notify_url
            data["return_url"] = self.return_url

        return data

    def sign_data(self, data):
        data.pop("sign", None)
        # 排序后的字符串
        unsigned_items = self.ordered_data(data)
        unsigned_string = "&".join("{0}={1}".format(k, v) for k, v in unsigned_items)
        sign = self.sign(unsigned_string.encode("utf-8"))
        ordered_items = self.ordered_data(data)
        quoted_string = "&".join("{0}={1}".format(k, quote_plus(v)) for k, v in ordered_items)

        # 获得最终的订单信息字符串
        signed_string = quoted_string + "&sign=" + quote_plus(sign)
        return signed_string

    def ordered_data(self, data):
        complex_keys = []
        for key, value in data.items():
            if isinstance(value, dict):
                complex_keys.append(key)

        # 将字典类型的数据dump出来
        for key in complex_keys:
            data[key] = json.dumps(data[key], separators=(',', ':'))

        return sorted([(k, v) for k, v in data.items()])

    def sign(self, unsigned_string):
        # 开始计算签名
        key = self.app_private_key
        signer = PKCS1_v1_5.new(key)
        signature = signer.sign(SHA256.new(unsigned_string))
        # base64 编码，转换为unicode表示并移除回车
        sign = encodebytes(signature).decode("utf8").replace("\n", "")
        return sign

    def _verify(self, raw_content, signature):
        # 开始计算签名
        key = self.alipay_public_key
        signer = PKCS1_v1_5.new(key)
        digest = SHA256.new()
        digest.update(raw_content.encode("utf8"))
        if signer.verify(digest, decodebytes(signature.encode("utf8"))):
            return True
        return False

    def verify(self, data, signature):
        if "sign_type" in data:
            sign_type = data.pop("sign_type")
        # 排序后的字符串
        unsigned_items = self.ordered_data(data) #排序
        message = "&".join(u"{}={}".format(k, v) for k, v in unsigned_items)
        return self._verify(message, signature)
@server.route('/alipay', methods=['GET'])
def pay():
    return_url = 'http://47.92.87.172:8000/?charset=utf-8&out_trade_no=201702021223&method=alipay.trade.page.pay.return&total_amount=0.01&sign=J6SM7n8tWz5qqRhYkRsFoimoIujdczeM45Ntu2lQ9vhWzUfNI5GDeJR5YV9Etj3AqdTe%2FJyEEQtwbeesTTI6QC%2BThUVwqPxrp9NrTS6Byg5X8XCYcegRxVLi6a%2BRChW4oDWRdtK0Fhy4ERTUpPDjt3o7CA%2BLPCZ8mAe6X3VDF9Cki3BzbWtbAAmTnFCiemreV0cSkpq24Cygvdg6lbFMwCGtnXEOr3Lz3IcIy2dvktOw%2FjR3Xf9W%2BVVWWk6dO0qiT8OixT64wKZpywp9%2BTw0lsZuG7IYx1o5utdGAA4IXs1bijBh6%2BNaXLdPIP6maNu6vkd6i9otpoInUMSimcLLvg%3D%3D&trade_no=2020040822001421910500844616&auth_app_id=2016102400750676&version=1.0&app_id=2016102400750676&sign_type=RSA2&seller_id=2088102180875075&timestamp=2020-04-08+10%3A29%3A45'
    alipay = AliPay(
        appid="2016102200738140",
        app_notify_url="http://localhost:8000/index/", # 异步
        app_private_key_path="./trade/private_2048.txt",
        alipay_public_key_path="./trade/zhifubao_gongkey.txt",  # 支付宝的公钥，验证支付宝回传消息使用，不是你自己的公钥,
        debug=True,  # 默认False,
        return_url="http://localhost:8000/index/" # 同步
    )

    o = urlparse(return_url)
    query = parse_qs(o.query)
    processed_query = {}
    ali_sign = query.pop("sign")[0] # 把返回的sign拿出，把返回url中的sign删除
    for key, value in query.items(): # 变成字符串
        processed_query[key] = value[0]
    print (alipay.verify(processed_query, ali_sign))

    url = alipay.direct_pay(
        subject="测试订单1",
        out_trade_no=random.randint(201702021,2017020212222),
        total_amount=0.01,
        return_url="http://localhost:8000/index/"
    )
    re_url = "https://openapi.alipaydev.com/gateway.do?{data}".format(data=url)
    resu = {'code': 200, 'message': re_url}
    return json.dumps(resu, ensure_ascii=False)  # 将字典转换为json串, json是字符串
if __name__ == "__main__":
    # return_url = 'http://47.92.87.172:8000/?total_amount=0.01&timestamp=2017-08-15+17%3A15%3A13&sign=jnnA1dGO2iu2ltMpxrF4MBKE20Akyn%2FLdYrFDkQ6ckY3Qz24P3DTxIvt%2BBTnR6nRk%2BPAiLjdS4sa%2BC9JomsdNGlrc2Flg6v6qtNzTWI%2FEM5WL0Ver9OqIJSTwamxT6dW9uYF5sc2Ivk1fHYvPuMfysd90lOAP%2FdwnCA12VoiHnflsLBAsdhJazbvquFP%2Bs1QWts29C2%2BXEtIlHxNgIgt3gHXpnYgsidHqfUYwZkasiDGAJt0EgkJ17Dzcljhzccb1oYPSbt%2FS5lnf9IMi%2BN0ZYo9%2FDa2HfvR6HG3WW1K%2FlJfdbLMBk4owomyu0sMY1l%2Fj0iTJniW%2BH4ftIfMOtADHA%3D%3D&trade_no=2017081521001004340200204114&sign_type=RSA2&auth_app_id=2016080600180695&charset=utf-8&seller_id=2088102170208070&method=alipay.trade.page.pay.return&app_id=2016080600180695&out_trade_no=201702021222&version=1.0'
	server.run(debug=True, port=8889, host='0.0.0.0')
