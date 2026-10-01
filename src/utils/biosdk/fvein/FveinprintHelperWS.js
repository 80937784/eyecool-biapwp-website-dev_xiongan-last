const wsUrl = 'ws://127.0.0.1:18834';
const wssUrl = 'wss://localhost:19934';
const isHttps = location.protocol.indexOf('https') === 0;

function GetErrMsgGA(ret) {
    switch (ret) {
        case '1':
        case '0':
            return "成功";
            break;

        case '-1':
            return "参数错误";
            break;

        case '-2':
            return "内存不足";
            break;

        case '-3':
            return "不支持令";
            break;

        case '-4':
            return "设备断开";
            break;

        case '-5':
            return "未初始化";
            break;

        case '-6':
            return "错误号错";
            break;

        case '-9':
            return "其他错误";
            break;

        case '-13':
            return "操作超时";
            break;

        default:
            return "";
            break;
    }
}

function GetMessageTips(ret) {
    switch (ret) {
        case '1':
            return "取模板数据中：请您按手指...";
            break;

        case '4':
            return "请移开手指后再次按手指...";
            break;

        case '5':
            return "正在读取指静脉图像，及其模板数据，请稍候...";
            break;

        case '6':
            return "多次采集的手指静脉相似度太低,请重新采集...";
            break;

        case '7':
            return "取模板数据中：请您抬起手指后，再按...";
            break;

        case '8':
            return "恭喜，成功获取注册模板数据";
            break;

        case '9':
            return "请您水平居中按捺一枚手指，以取特征数据...";
            break;

        case '10':
            return "恭喜，成功获取比对模板数据";
            break;

        default:
            return "";
            break;
    }
}

let client;

//发送消息到服务器
const sendMsg = function (msg) {
    if (client) {
        client.send(msg);
    }
    else {
        return;
    }
};

export const EcFveinWs =
{
    callbackFun: { "FVD_OpenDevice": [], "FVD_CloseDevice": [], "LIVESCAN_GetFPRawData": [], "FVD_EnrollTmpl": [], "FVD_ExtractFeature": [], "FVD_Match": [], "LIVESCAN_GetImageData": [] },

    getSocketStatus: function () {
        if (client) {
            return client.readyState;
        }
    },

    connect: function (onSuccess, onFail, onPreviewImg, onCaptureImg, onCaptureImgErr) {
        if (typeof client == "object" && client != null) {
            onSuccess();
            return;// 防止重复创建socket
        }

        const that = this;

        onSuccess = onSuccess || function () { console.log("socket连接成功"); };
        onFail = onFail || function () { console.log("socket连接失败"); };

        // 创建websocket
        client = new WebSocket(isHttps ? wssUrl : wsUrl);
        // CONNECTING:0
        // OPEN:1
        // CLOSING:2
        // CLOSED:3
        client.onopen = function (msg) {
            if (client.readyState == WebSocket.OPEN) {
                if (onSuccess) {
                    // 创建img标签
                    if (typeof preview != "object") {

                        onSuccess();
                    }
                }
            }
            else {
                if (onFail) {
                    onFail();
                }
            }
        };

        client.onclose = function (msg) {
            client = null;
        };

        client.onFailor = function (msg) {
            client = null;
            onFail(10001, "连接失败");
        };

        //处理服务器端返回的数据
        client.onmessage = function (msg) {
            if (typeof msg.data != "string") {
                return;
            }
            const arrayMsg = msg.data.split("$&");

            if (arrayMsg.length < 2) {
                return;
            }

            const cmd = arrayMsg[0];
            const ret = arrayMsg[1];

            switch (cmd) {
                case "110":	// 打开指静脉采集仪
                    if (ret == "1") {
                        that.callbackFun["FVD_OpenDevice"][0]();
                    }
                    else {
                        that.callbackFun["FVD_OpenDevice"][1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "111":	// 关闭指静脉采集仪
                    if (ret == "1") {
                        that.callbackFun["FVD_CloseDevice"][0]();
                    }
                    else {
                        that.callbackFun["FVD_CloseDevice"][1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "120": // 登记模板
                    if (ret == "1") {
                        that.callbackFun["FVD_EnrollTmpl"][0](arrayMsg[2]);
                    }
                    else if (ret == "400") {
                        that.callbackFun["FVD_EnrollTmpl"][2](GetMessageTips(arrayMsg[2]));
                    }
                    else {
                        that.callbackFun["FVD_EnrollTmpl"][1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "121": // 提取特征
                    if (ret == "1") {
                        EcFveinWs.LIVESCAN_GetImageData(onCaptureImg,onCaptureImgErr);
                    }
                    else if (ret == "400") {
                        onCaptureImgErr(GetMessageTips(arrayMsg[2]));
                    }
                    else {
                        that.callbackFun["FVD_ExtractFeature"][1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "122": // 模板特征比对
                    if (ret == '1')	// 比对成功
                    {
                        that.callbackFun["FVD_Match"][0]();
                    }
                    else {
                        that.callbackFun["FVD_Match"][1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "123": // 获取图像
                    if (ret == '0') {
                        that.callbackFun["LIVESCAN_GetImageData"][0](arrayMsg[2]);
                        onCaptureImg(arrayMsg[2]);
                    }
                    else {
                        that.callbackFun["LIVESCAN_GetImageData"][1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "300": // 预览数据		
                    onPreviewImg(arrayMsg[2]);
                    break;
            }
        };
    },

    // 断开连接(释放websocket对象)
    disconnect: function () {
        if (typeof client == "object" && client != null) {
            client.onclose = function () { };
            client.close();
            client = null;
        }
        //onSuccess();
    },

    //下面是设备核心功能调用

    //打开指静脉设备
    FVD_OpenDevice: function (onSuccess, onFail) {
        this.callbackFun["FVD_OpenDevice"][0] = onSuccess;
        this.callbackFun["FVD_OpenDevice"][1] = onFail;

        sendMsg("110$&");
    },

    //关闭指纹采集仪
    FVD_CloseDevice: function (onSuccess, onFail) {
        this.callbackFun["FVD_CloseDevice"][0] = onSuccess||function(){console.log('关闭成功')};
        this.callbackFun["FVD_CloseDevice"][1] = onFail||function(){console.log('关闭失败')};

        sendMsg("111$&");
    },

    //采集一帧图像
    LIVESCAN_GetFPRawData: function (onSuccess, onFail) {
        this.callbackFun["LIVESCAN_GetFPRawData"][0] = onSuccess;
        this.callbackFun["LIVESCAN_GetFPRawData"][1] = onFail;

        sendMsg("LIVESCAN_GetFPRawData");
    },



    //登记模板
    FVD_EnrollTmpl: function (timeout, onSuccess, onFail, onMessage) {
        this.callbackFun["FVD_EnrollTmpl"][0] = onSuccess;
        this.callbackFun["FVD_EnrollTmpl"][1] = onFail;
        this.callbackFun["FVD_EnrollTmpl"][2] = onMessage;

        sendMsg("120$&" + timeout);
    },

    // 获取特征
    FVD_ExtractFeature: function (onSuccess, onFail) {
        this.callbackFun["FVD_ExtractFeature"][0] = onSuccess;
        this.callbackFun["FVD_ExtractFeature"][1] = onFail;

        sendMsg("121$&" + 10000);
    },


    // 模板特征比对
    FVD_Match: function (template, feature, onSuccess, onFail) {
        this.callbackFun["FVD_Match"][0] = onSuccess;
        this.callbackFun["FVD_Match"][1] = onFail;

        sendMsg("122$&" + template + "$&" + feature);
    },

    // 获取图像
    LIVESCAN_GetImageData: function ( onSuccess, onFail) {
        this.callbackFun["LIVESCAN_GetImageData"][0] = onSuccess;
        this.callbackFun["LIVESCAN_GetImageData"][1] = onFail;

        sendMsg("123$&0$&1");
    }
};
