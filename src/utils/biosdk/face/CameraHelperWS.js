import { Message } from "element-ui";
const wsUrl = "ws://127.0.0.1:18832";
const wssUrl = "wss://localhost:19932";
const isHttps = location.protocol.indexOf("https") === 0;
const paramsInner = {
    ip: "127.0.0.1",
    port: 18832,
    imgWidth: 640,
    imgHeight: 480,
    imgCompress: 85,
    pupilDistMin: 60,
    isActived: 1,
    nirCount: 1,
    compareFacePos: 1,
    isAudio: 1,
    isText: 1,
    language: 0,
    motionTimeout: 15,
    timeout: 20,
    headYaw: 20,
    headPitch: 20,
    headRoll: 20,
    eyeDegree: 60,
    mouthDegree: 10,
    roiX: 120,
    roiY: 0,
    roiW: 400,
    roiH: 480,
    brightnessMin: 85,
    brightnessMax: 200,
    delay: 0,
    distanceFromAxis: 0,
    openByThread: 1,
    LocalFileCache: 1,
    liveThreshold: "0.7",
    motionCount: 4,
    motionWeight: [1, 1, 1, 1],
    thres_eye: 60,
    thres_mouth: 15,
    thres_yaw: 15,
    thres_pitch: 10,
    quality: 70,
    locc: 1,
    rocc: 1,
    mocc: 1,
    faceDropInterval: 600,
    hack: 1
};
let client;

function sendMsg(msg) {
    if (client && client.readyState == WebSocket.OPEN) {
        client.send(msg);
    } else {
        Message("client is not connected,retry...");
    }
}

export const EcFaceWs = {
    callback: { openCam: [], faceCheck: [], closeCam: [], previewImg: null },

    getSocketStatus: function() {
        if (client) {
            return client.readyState;
        }
    },

    connect: function(
        onSucc,
        onErr,
    ) {
        if (typeof client == "object" && client != null) { // 防止重复创建socket
            if (onSucc) {
                onSucc();
            }
        } else {
            var that = this;
            onSucc =
                onSucc ||
                function() {
                    console.log("socket连接成功");
                };
            onErr =
                onErr ||
                function() {
                    console.log("socket连接失败");
                    onErr("socket连接失败");
                };
            client = new WebSocket(isHttps ? wssUrl : wsUrl);
            // CONNECTING:0 OPEN:1 CLOSING:2 CLOSED:3
            client.onopen = function(msg) {
                if (client.readyState == WebSocket.OPEN) {
                    sendMsg("201$&" + JSON.stringify(paramsInner));
                    if (onSucc) {
                        onSucc();
                    }
                } else {
                    if (onErr) {
                        onErr();
                    }
                }
            };
            client.onclose = function(msg) {};
            client.onerror = function(msg) {
                Message({
                    message: "socket连接失败",
                    type: "error"
                });
                client = null;
            };
            client.onmessage = function(msg) {
                if (typeof msg.data != "string") return;
                var arrayMsg = msg.data.split("$&");
                if (arrayMsg.length < 2) return;
                var cmd = arrayMsg[0];
                var ret = arrayMsg[1];
                switch (cmd) {
                    case "203": // 打开双模
                        if (ret == "0") {
                            that.callback.openCam[0]();
                        } else {
                            that.callback.openCam[1](ret, "打开失败");
                        }
                        break;
                    case "204": // 关闭设备
                        that.callback.closeCam[0]();
                        break;
                    case "205": // 检活结果
                        if (ret == "0") {
                            // 启动检活成功，不做提示
                        } else if (ret == "100") {
                            // 检活成功，显示结果图像
                            that.callback["faceCheck"][0](arrayMsg[4]);
                            console.log("检活成功" + ret);
                        } // 检活失败，含启动失败+结果失败
                        else {
                            that.callback.faceCheck[1]("检活失败");
                            console.log("ack=206:ret=" + ret);
                            if (ret != "104") {
                                // “取消”不再回调
                                that.callback["faceCheck"][1](ret, "检活失败");
                            }
                        }
                        break;
                    case "300": // 预览数据
                        //TODO 预览数据向上展示预览页面
                        if (ret == "0") {
                            that.callback.previewImg(arrayMsg[2]);
                        }
                        break;
                }
            };
        }
    },

    // 断开连接(释放websocket对象)
    disconnect: function(onSucc, onErr) {
        onSucc = onSucc || function() {};
        onErr = onErr || function() {};
        if (typeof client == "object" && client != null) {
            client.onclose = function() {};
            client.close();
            client = null;
        }
        onSucc();
    },

    // 打开双模设备
    openCam: function(onSucc, onErr) { 
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
        sendMsg("203$&" + JSON.stringify(paramsInner));
    },

    // 关闭设备
    closeCam: function(onSucc, onErr) {
        if (typeof client == "object" && client && client.readyState == 1) {
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
            sendMsg("204");
        } else {
            onSucc();
        }
    },

    // 启动双模检活
    faceCheck: function(onSucc, onErr) {
        onSucc =
            onSucc ||
            function() {
                console.log("检活成功");
            };
        onErr =
            onErr ||
            function(msg) {
                console.log("检活失败:" + msg);
            };
        this.callback.faceCheck[0] = onSucc;
        this.callback.faceCheck[1] = onErr;
        sendMsg("205");
    },

    // 预览数据
    previewImg: function(onProcess) {
        onProcess = onProcess || function() { console.log("检活成功"); }
        this.callback.previewImg = onProcess;
    }
};