import { Message } from 'element-ui'

function GetErrMsg(ret) {
    switch (ret) {
        case '0':
            return "成功";
            break;

        case '-1':
            return "失败";
            break;

        case '-2':
            return "校验错误";
            break;

        case '-3':
            return "参数错误";
            break;

        case '-4':
            return "设备内没指纹信息";
            break;

        case '-5':
            return "手指未按或手指质量差";
            break;

        case '-6':
            return "指纹合成失败";
            break;

        case '-7':
            return "指纹比对失败";
            break;

        case '-8':
            return "内存不足";
            break;

        case '-9':
            return "有闪存错";
            break;

        case '-10':
            return "传感器错";
            break;

        case '-11':
            return "请抬起手";
            break;

        case '-12':
            return "不支持的指令";
            break;

        case '-13':
            return "操作超时";
            break;

        case '-14':
            return "设备占用";
            break;

        case '-15':
            return "设备断开";
            break;

        case '-16':
            return "特点过少";
            break;

        case '-17':
            return "取消操作";
            break;

        case '-18':
            return "文件错误";
            break;

        default:
            return "";
            break;
    }

}

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
let client;
const wsUrl = 'ws://127.0.0.1:18831';
const wssUrl = 'wss://localhost:19931';
const isHttps = location.protocol.indexOf('https') === 0;
///-------------------------------------------
const sendMsg = function(msg) {
    if (client) client.send(msg);
    else Message("socket连接失败，可能connet未调用，请重试");

};
export const EcFingerWs = {
    callback: { "GetTemplet": [], "GetFeature": [], "Match": [], "GetImageData": [], previewImg: null },
    callbackGA: { "GetTemplet": [], "GetFeature": [], "Match": [], "GetImageData": [], previewImg: null },

    getSocketStatus: function() {
        if (client) return client.readyState;
    },
    connect: function(onSucc, onErr) {
        if (typeof client == "object" && client != null) return; // 防止重复创建socket			
        var that = this;
        onSucc = onSucc || function() { console.log("socket连接成功"); };
        onErr = onErr || function() { console.log("socket连接失败"); };

        // 创建websocket
        client = new WebSocket(isHttps ? wssUrl : wsUrl);
        // CONNECTING:0
        // OPEN:1
        // CLOSING:2
        // CLOSED:3
        client.onopen = function(msg) {
            if (client.readyState == WebSocket.OPEN) {
                if (onSucc) {
                    onSucc();
                }
            } else {
                if (onErr) onErr();
            }
        };
        client.onclose = function(msg) {
            console.log("onclose:" + msg);
        };
        client.onerror = function() {
            client = null;
            if (onErr) {
                onErr();
            } else {
                console.log("连接设备失败，请检查是否已安装插件");
            }
        };
        client.onFailor = function(msg) {
            console.log("连接设备失败，请检查是否已安装插件");
            onErr(10001, "连接失败");
        };
        client.onmessage = function(msg) {
            if (typeof msg.data != "string") return;
            var arrayMsg = msg.data.split("$&");
            if (arrayMsg.length < 2) return;
            var cmd = arrayMsg[0];
            var ret = arrayMsg[1];
            console.log(arrayMsg)
            switch (cmd) {
                case "100": // 获取模板
                    if (ret == "0") {
                        that.callback.GetTemplet[0](arrayMsg[2]);
                    } else {
                        that.callback.GetTemplet[1](ret, GetErrMsg(ret));
                    }
                    break;

                case "101": // 获取特征
                    if (ret == "0") {
                        that.callback.GetFeature[0](arrayMsg[2]);
                    } else {
                        that.callback.GetFeature[1](ret, GetErrMsg(ret));
                    }
                    break;

                case "102": // 特征比对
                    if (ret == '0') // 比对成功
                    {
                        that.callback.Match[0]();
                    } else {
                        that.callback.Match[1](ret, GetErrMsg(ret));
                    }
                    break;
                case "103": // 获取图像
                    if (ret == '0') {
                        that.callback.GetImageData[0](arrayMsg[2]);
                    } else {
                        that.callback.GetImageData[1](ret, GetErrMsg(ret));
                    }
                    break;

                    //-----------------------------------------------
                case "120": // 获取模板
                    if (ret == "0") {
                        that.FPIGetImageDataGA(that.callbackGA.GetImageData[0], that.callbackGA.GetImageData[1]);
                    } else {
                        that.callbackGA.GetTemplet[1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "121": // 获取特征
                    if (ret == "0") {
                        that.callbackGA.GetFeature[0](arrayMsg[2]);
                    } else {
                        that.callbackGA.GetFeature[1](ret, GetErrMsgGA(ret));
                    }
                    break;

                case "122": // 特征比对
                    if (ret == '0') // 比对成功
                    {
                        that.callbackGA.Match[0]();
                    } else {
                        that.callbackGA.Match[1](ret, GetErrMsgGA(ret));
                    }
                    break;
                case "123": // 获取图像
                    if (ret == '0') {
                        that.callbackGA.GetImageData[0](arrayMsg[2]);
                    } else {
                        that.callbackGA.GetImageData[1](ret, GetErrMsgGA(ret));
                    }
                    break;
            }
        };
    },

    // 断开连接(释放websocket对象)
    disconnect: function() {
        if (typeof client == "object" && client != null) {
            client.onclose = function() {};
            client.close();
            client = null;
        }
    },

    //-------------------------- 商行接口
    // 获取指纹模板
    FPIGetTemplet: function(port, timeout, onSucc, onErr) {
        onSucc = onSucc || function() { console.log("获取指纹模板成功"); };
        onErr = onErr || function(msg) { console.log("获取指纹模板失败:" + msg); };
        this.callback.GetTemplet[0] = onSucc;
        this.callback.GetTemplet[1] = onErr;
        sendMsg("100$&" + port + "$&" + timeout);
    },

    // 获取指纹特征
    FPIGetFeature: function(port, timeout, onSucc, onErr) {
        onSucc = onSucc || function() { console.log("获取指纹特征成功"); };
        onErr = onErr || function(msg) { console.log("获取指纹特征失败:" + msg); };
        this.callback.GetFeature[0] = onSucc;
        this.callback.GetFeature[1] = onErr;
        sendMsg("101$&" + port + "$&" + timeout);
    },

    // 指纹特征比对
    FPIMatch: function(template, feature, level, onSucc, onErr) {
        onSucc = onSucc || function() { console.log("指纹特征比对成功"); };
        onErr = onErr || function(msg) { console.log("指纹特征比对失败:" + msg); };
        this.callback.Match[0] = onSucc;
        this.callback.Match[1] = onErr;
        sendMsg("102$&" + template + "$&" + feature + "$&" + level);
    },

    // 获取图像
    FPIGetImageData: function(fileIndex, format, onSucc, onErr) {
        onSucc = onSucc || function() { console.log("获取指纹图像成功"); };
        onErr = onErr || function(msg) { console.log("获取指纹图像失败:" + msg); };
        this.callback.GetImageData[0] = onSucc;
        this.callback.GetImageData[1] = onErr;
        sendMsg("103$&" + fileIndex + "$&" + format);
    },

    // 获取指纹模板(GA)
    FPIGetTempletGA: function(onSucc, onErr) {
        onSucc = onSucc || function() { console.log("获取GA指纹模板成功"); };
        onErr = onErr || function(msg) { console.log("获取GA指纹模板失败:" + msg); };
        this.callbackGA.GetTemplet[0] = onSucc;
        this.callbackGA.GetImageData[0] = onSucc;
        this.callbackGA.GetTemplet[1] = onErr;
        this.callbackGA.GetImageData[1] = onErr;
        sendMsg("120$&" + "1" + "$&" + "0" + "$&" + "1" + "$&" + "99" + "$&" + "10");
    },

    // 获取指纹特征(GA)
    FPIGetFeatureGA: function(onSucc, onFail) {
        onSucc = onSucc || function() { console.log("获取GA指纹特征成功"); };
        onFail = onFail || function(msg) { console.log("获取GA指纹特征失败:" + msg); };
        this.callbackGA.GetFeature[0] = onSucc;
        this.callbackGA.GetFeature[1] = onFail;
        sendMsg("121$&1$&0$&1$&99$&15");
    },

    // 指纹特征比对(GA)
    FPIMatchGA: function(template, feature, level, onSucc, onErr) {
        onSucc = onSucc || function() { console.log("指纹特征比对成功"); };
        onErr = onErr || function(msg) { console.log("指纹特征比对失败:" + msg); };
        this.callbackGA.Match[0] = onSucc;
        this.callbackGA.Match[1] = onErr;
        sendMsg("122$&" + template + "$&" + feature + "$&" + level);
    },

    // 获取图像(GA)
    FPIGetImageDataGA: function(onSucc, onErr, fileIndex, format) {
        onSucc = onSucc || function() { console.log("获取GA指纹图像成功"); };
        onErr = onErr || function(msg) { console.log("获取GA指纹图像失败:" + msg); };
        this.callbackGA.GetImageData[0] = onSucc;
        this.callbackGA.GetImageData[1] = onErr;
        sendMsg("123$&" + fileIndex + "$&" + format);
    },

    previewImg: function(onProcess) {
        onProcess = onProcess || function() { console.log("设备打开"); }
        this.callback.previewImg = onProcess;
    }
};
