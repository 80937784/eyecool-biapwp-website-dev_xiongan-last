const wsUrl = 'ws://192.168.61.122:7681/MultiModalFaceSDK';
const wssUrl = 'wss://localhost:7683/MultiModalFaceSDK';
const isHttps = location.protocol.indexOf('https') === 0;
let client;


const sendMsg = function (cmd) {
    //发送到服务器
    if (!client) return;
    if (cmd == null || cmd == "") {
        alert('指令未定义或不能为null!');
        return;
    }
    client.send(cmd);

};

export const EcMultiWs = {
    callback: { "openDevice": [], "closeDevice": [], "startCap": [], previewImg: null },

    connect: function (onSucc, onErr) {
        var that = this;
        if (typeof client == "object" && client != null) {
            onSucc();
            return;
        } // 防止重复创建socket
        else {
            onSucc = onSucc || function () {
                console.log("socket连接成功");
            };
            onErr = onErr || function () {
                console.log("socket连接失败");
            };
            client = new WebSocket(isHttps ? wssUrl : wsUrl);
            client.onopen = function () {
                onSucc();
            };
            client.onclose = function (msg) {
            };
            client.onerror = function (msg) {
                client = null;
                onErr(msg);
            };

            client.onmessage = function (event) {
                const data = event.data;
                //监听来自服务端的数据
                if (data == "") {
                    return;
                }
                const messageJson = JSON.parse(data);
                const cmd = messageJson.cmd;
                const messageContent = messageJson.data;
                console.log(cmd);
                if (cmd == "opendevice") {
                    if (messageJson.data.ret == 0) {
                        that.callback.openDevice[0](messageContent);
                    } else {
                        that.callback.openDevice[1](messageContent);
                    }
                }
                if (cmd == "closedevice") {
                    if (messageContent.ret == 0) {
                        that.callback.closeDevice[0](messageContent)
                    }
                    else {
                        that.callback.closeDevice[1](messageContent)
                    }
                }
                if (cmd == "capresult") {
                    if ((data.irisfea && data.irisfea != '' && data.irisfea != null) && (data.faceimg && data.faceimg != '' && data.faceimg != null)) {
                        const faceImgBase64 = data.faceimg;
                        that.callback.startCap[0](faceImgBase64);
                    }
                }
                if (cmd == "videoframe") {
                    if (messageContent.frame && messageContent.frame != null && messageContent.frame.length > 0) {
                        that.callback.previewImg[0](messageContent.frame)
                    }
                }
            };


        }
    },
    openDevice: function (onSucc, onErr) {
        console.log("opendevice");
        onSucc =
            onSucc ||
            function () {
                console.log("打开摄像头成功");
            };
        onErr =
            onErr ||
            function (data) {
                console.log("打开摄像头失败:" + data);
            };
        this.callback.openDevice[0] = onSucc;
        this.callback.openDevice[1] = onErr;
        const msg = { "cmd": "opendevice" };
        sendMsg(JSON.stringify(msg));
    },

    closeDevice: function (onSucc, onErr) {
        if (typeof client == "object" && client != null) {
            onSucc =
                onSucc ||
                function () {
                    console.log("关闭成功");
                };
            onErr =
                onErr ||
                function (data) {
                    console.log("关闭失败:" + data);
                };
            this.callback.closeDevice[0] = onSucc;
            this.callback.closeDevice[1] = onErr;
            const msg = { "cmd": "closedevice" };
            sendMsg(JSON.stringify(msg));
        }
    },
    disconnect: function () {
        if (typeof client == "object" && client != null) {
            client.close();
            client = null;
        }
    },
    //虹膜采集
    startCap: function (onSucc, onErr) {
        console.log("startcap");
        onSucc =
            onSucc ||
            function () {
                console.log("开始采集");
            };
        onErr =
            onErr ||
            function (data) {
                console.log("采集失败:" + data);
            };
        const singleeye = parseInt("0", 10);
        const msg = { "cmd": "startcap", "data": { "registermode": 1, "singleeye": singleeye, "timeout": 0 } };
        this.callback.startCap[0] = onSucc;
        this.callback.startcap[1] = onErr;
        sendMsg(JSON.stringify(msg));
    },

    //停止采集
    stopCap: function () {
        const msg = { "cmd": "stopcap" };
        sendMsg(JSON.stringify(msg));
    },
    
    previewImg: function (onProcess) {
        onProcess = onProcess || function () { console.log("设备打开"); }
        this.callback.previewImg = onProcess;
    }
};