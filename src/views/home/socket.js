import { Message } from 'element-ui'
let urlHead = window.location.protocol === "http:" ? "ws" : "wss";
class WebSocket {
    constructor(url) {
        if(typeof(WebSocket) === 'undefined') {
            Message.error("您的浏览器不支持websocket!");
            return;
        }
        this.socket = new WebSocket(urlHead + "://" + url);
        this.interval = null;
    }
    open() {
        this.interval = setInterval(() => {
            if(this.socket != null) {
                this.socket.send("Heart");
            }
        }, 30000);
        this.socket.onopen = ()=>{
            this.socket.send("连接websocket");
        };
        this.socket.onerror = () => {
            Message.error("websocket连接异常");
        }
        this.socket.onmessage = (e)=> {
            console.log(e);
        }
    }
    close() {
        clearInterval(this.interval);
        this.interval = null;
        this.socket.close();
    }
}