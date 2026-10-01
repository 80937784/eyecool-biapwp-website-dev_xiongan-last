const wsUrl = 'ws://127.0.0.1:18833';
const wssUrl = 'wss://localhost:19933';
const isHttps = location.protocol.indexOf('https') === 0;
let nEyeNums = 2;

let client;

const sendMsg = function(cmd, parameters) {
    //发送到服务器
    if (!client) return;
    if (cmd == null || cmd == "") {
        alert('指令未定义或不能为null!');
        return;
    }
    if (parameters == null || parameters == "" || parameters == undefined) {
        client.send(cmd);
    } else {
        client.send(cmd + "$&" + parameters);
    }
};

export const EcIrisWs = {
    callback: { "openCam": [], "eyeCap": [], "closeCam": [], previewImg: null },
    getSocketStatus: function() {
        if (client) {
            return client.readyState;
        }
    },
    connect: function(onSucc, onErr) {
        var that = this;
        if (typeof client == "object" && client != null) {
            onSucc();
            return;
        } // 防止重复创建socket
        else {
            onSucc = onSucc || function() {
                console.log("socket连接成功");
            };
            onErr = onErr || function() {
                console.log("socket连接失败");
            };
            client = new WebSocket(isHttps ? wssUrl : wsUrl);
            client.onopen = function() {
                // client.send("connection Success!");
                onSucc();
            };
            // CONNECTING:0
            // OPEN:1
            // CLOSING:2
            // CLOSED:3
            client.onclose = function(msg) {
                //console.log("onclose:"+msg);
            };
            client.onerror = function(msg) {
                client = null;
                onErr(msg);
            };

            client.onmessage = function(event) {
                //监听来自服务端的数据
                if (event.data == "") {
                    return;
                }
                const messageArray = event.data.split("$&");
                // 拆分消息内容
                if (messageArray.length < 3) { // 不够3个元素，异常
                    return;
                }
                const cmd = messageArray[0];
                if (cmd == "Iris_OpenDevice") {
                    if (messageArray[1] == 0) {
                        that.callback.openCam[0](messageArray[2]);
                    } else {
                        that.callback.openCam[1](messageArray[1], '打开设备失败');
                    }
                } else if (cmd == "EventofPick") {
                    if (messageArray[2] > 0) { // 采集成功
                        const imageJSON = JSON.parse(messageArray[3])
                        that.callback.eyeCap[0](imageJSON.imagebase, imageJSON.feature);
                    } else {
                        console.log(messageArray);
                        that.callback.eyeCap[1](messageArray);
                    }
                } else if (cmd == "EventofPreview") { // 显示采集过程图像
                    if (that.callback.previewImg) {
                        that.callback.previewImg(messageArray[2])
                    }
                } else if (cmd == "EventofActionHint") { // 动作提示

                } else if (cmd == "Iris_GetData") {
                    const imageJSON = JSON.parse(messageArray[2]);
                    this.callback.eyeCap[0](imageJSON.imagebase)
                }
            };


        }
    },
    checkData: function(data) {
        return new RegExp('^[0-9]+$').test(data);
    },
    openIrisCamera: function(params,onSucc, onErr) {
        console.log("Iris_OpenDevice");
        onSucc =
            onSucc ||
            function() {
                console.log("打开摄像头成功");
            };
        onErr =
            onErr ||
            function(msg) {
                console.log("打开摄像头失败:" + msg);
            };
        this.callback.openCam[0] = onSucc;
        this.callback.openCam[1] = onErr;
        sendMsg("Iris_ExtnEntryEx",  "image_rotate$&" + params.image_rotate);
        sendMsg("Iris_OpenDevice$&", "");
    },

    closeIrisCamera: function(onSucc, onErr) {
        console.log("Iris_CloseDevice");
        if (typeof client == "object" && client != null) {
            onSucc =
                onSucc ||
                function() {
                    console.log("关闭成功");
                };
            onErr =
                onErr ||
                function(msg) {
                    console.log("关闭失败:" + msg);
                };
            this.callback.closeCam[0] = onSucc;
            this.callback.closeCam[1] = onErr;
            sendMsg("Iris_CloseDevice$&", "");
        }
    },
    disconnect: function() {
        if (typeof client == "object" && client != null) {
            client.close();
            client = null;
        }
    },

    //虹膜采集
    startIrisCap: function(onSucc, onErr) {
        onSucc =
            onSucc ||
            function() {
                console.log("开始采集");
            };
        onErr =
            onErr ||
            function(msg) {
                console.log("采集失败:" + msg);
            };
        this.callback.eyeCap[0] = onSucc;
        this.callback.eyeCap[1] = onErr;
        sendMsg("Iris_ImageCapure", "2$&1$&20");
    },

    // 虹膜注册
    startRegisterCap: function(onSucc, onErr) {
        this.callback.eyeCap[0] = onSucc;
        this.callback.eyeCap[1] = onErr;
        const nTimeout = 20;
        sendMsg("Iris_ExtnEntry", 0 + "$&" + 4 + "$&" + 8 + "$&");
        sendMsg("Iris_ExtnEntry", 0 + "$&" + 13 + "$&" + 1 + "$&");
        sendMsg("Iris_EnrollTmpl", nEyeNums + '$&' + nTimeout);
    },

    //强制采集
    compulsoryIrisCap: function() {
        sendMsg("TcIrisImageCompulsoryCapEx", "");
    },

    //停止采集
    stopIrisCap: function() {
        sendMsg("TcCancelCaptureEx", "");
    },

    //启动检测设备状态
    startCheckIrisDev: function() {
        sendMsg("TcCheckDeviceEx", "0");
    },

    //获取设备信息
    getIrisDevInfo: function() {
        sendMsg("TcGetConnectedDeviceEx", "");
    },

    //获取身份证信息
    getIdCard: function() {
        sendMsg("TcReadIdCard", "10" + '$&' + "1001");
    },

    eyeFlagChange: function(selObj) {
        nEyeNums = selObj.options[selObj.selectedIndex].value;
    },

    previewImg: function(onProcess) {
        onProcess = onProcess || function() { console.log("设备打开"); }
        this.callback.previewImg = onProcess;
    }

};