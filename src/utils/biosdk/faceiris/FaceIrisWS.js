
function getResultMessage(id) {
	var message = "";
	id = parseInt(id);
	switch(id) {
		case 0:
			message = "成功";
			break;
		case -1:
			message = "失败";
			break;
		case -2:
			message = "校验失败";
			break;
		case -3:
			message = "参数错误";
			break;
		case -4:
			message = "空特征库";
			break;
		case -5:
			message = "未按或孬";
			break;
		case -6:
			message = "值不相关"
			break;
		case -7:
			message = "值不匹配"
			break;
		case -8:
			message = "内存不足";
			break;
		case -9:
			message = "有闪存错";
			break;
		case -10:
			message = "传感器错";
			break;
		case -11:
			message = "请抬起手";
			break;
		case -12:
			message = "不支持的指令";
			break;
		case -13:
			message = "操作超时";
			break;
		case -14:
			message = "正在忙啊";
			break;
		case -15:
			message = "设备断开";
			break;
		case -16:
			message = "特征点过少";
			break;
		case -17:
			message = "取消操作";
			break;
		case -18:
			message = "文件错误";
			break;
		case -19:
			message = "没有授权";
			break;
		case -26:
			message = "时间过期";
			break;


		default:
			message = "";
			break;
	}
	return message;
}

export const HelperWS=(function(){
	var socket;
	var preview;
	
	var sendMsg = function(msg){
		if (socket) socket.send(msg);
		else alert("socket连接失败，可能connet未调用。");
	};
	var IrisFaceAPI={	
		callback:{"openDevice":[], "closeDevice":[], "faceCapture":[], "irisEnroll":[], "irisCapture":[], 
				"irisFaceEnroll":[], "irisFaceCapture":[], "mergeFeature":[], "matchFeature":[], 
				"faceCrop":[], "irisCrop":[]}, 
		
		getSocketStatus:function(){
			if (socket) return socket.readyState;
		}, 
		connect:function( onSucc, onFail){
			if (typeof socket == "object" && socket != null) 
			{console.log("进来了"); return;}// 防止重复创建socket	
			
			// 创建websocket
			var host = (window.location.protocol == 'http:') ? 'ws://127.0.0.1:18836' : 'wss://localhost:19936';
			// var host = url || "ws://localhost:18836";
			socket = new WebSocket(host);			
			
			var that = this;
			onSucc = onSucc || function(){console.log("socket连接成功");};
			onFail = onFail || function() {console.log("socket连接失败");};
			
			
			// CONNECTING:0
			// OPEN:1
			// CLOSING:2
			// CLOSED:3
			socket.onopen = function(msg){
				if (socket.readyState == WebSocket.OPEN)
				{
					if (onSucc) 
					{
						onSucc();
					}
				}
				else{
					if (onFail) onFail();
				}				
			};
			socket.onclose = function(msg){
				//console.log("onclose:"+msg);
			};
			socket.onerror = function(msg){
				onFail();
			};
			socket.onmessage = function(msg){
				if (typeof msg.data != "string") return;
				var arrayMsg = msg.data.split("$&");
				//console.log("length="+arrayMsg.length);
				//console.log(msg.data);
				if (arrayMsg.length < 2) return;
				var cmd = arrayMsg[0];
				var ret = arrayMsg[1];
				switch (cmd)
				{
				case "600":	// 打开
					if (ret == "0")
					{
						that.callback["openDevice"][0]();
					}
					else
					{
						that.callback["openDevice"][1](ret, getResultMessage(ret));
					}
					break;
					
				case "601" : // 关闭设备
					that.callback["closeDevice"][0]();
					break;
					
				case "602" : // 人脸采集
					if (ret == '6000')	// 采集成功，显示结果 图像+坐标
					{
						that.callback["faceCapture"][0](arrayMsg[2]+"$&"+arrayMsg[3]);
					}
					else // 采集失败
					{
						if (ret != '-2')	// “取消”不再回调
						{
							that.callback["faceCapture"][1](ret, getResultMessage(ret));
						}	
					}
					
					break;
					
				case "603" : // 虹膜注册
					if (ret == '6000')	// 注册成功，显示结果 图像+模板
					{
						that.callback["irisEnroll"][0](arrayMsg[2]+"$&"+arrayMsg[3]);
					}
					else // 注册失败
					{
						if (ret != '-2')	// “取消”不再回调
						{
							that.callback["irisEnroll"][1](ret, getResultMessage(ret));
						}	
					}
					
					break;
					
				case "604" : // 虹膜采集
					if (ret == '6000')	// 采集成功，显示结果 图像+特征
					{
						that.callback["irisCapture"][0](arrayMsg[2]+"$&"+arrayMsg[3]);
					}
					else // 采集失败
					{
						if (ret != '-2')	// “取消”不再回调
						{
							that.callback["irisCapture"][1](ret, getResultMessage(ret));
						}	
					}
					
					break;
					
				case "605" : // 虹膜人脸注册
					if (ret == '6000')	// 注册成功，显示结果 虹膜图像+虹膜模板+人脸图+人脸坐标+人脸特征
					{
						that.callback["irisFaceEnroll"][0](arrayMsg[2]+"$&"+arrayMsg[3]+"$&"+arrayMsg[4]+"$&"+arrayMsg[5]+"$&"+arrayMsg[6]);
					}
					else // 注册失败
					{
						if (ret != '-2')	// “取消”不再回调
						{
							that.callback["irisFaceEnroll"][1](ret, getResultMessage(ret));
						}	
					}
					
					break;
					
				case "606" : // 虹膜人脸采集
					if (ret == '6000')	// 采集成功，显示结果 虹膜图像+虹膜特征+人脸图+人脸坐标+人脸特征
					{
						that.callback["irisFaceCapture"][0](arrayMsg[2]+"$&"+arrayMsg[3]+"$&"+arrayMsg[4]+"$&"+arrayMsg[5]+"$&"+arrayMsg[6]);
					}
					else // 采集失败
					{
						if (ret != '-2')	// “取消”不再回调
						{
							that.callback["irisFaceCapture"][1](ret, getResultMessage(ret));
						}	
					}
					
					break;
					
				case "607" : // 特征融合
					if (ret == "0")
					{
						that.callback["mergeFeature"][0](arrayMsg[2]);
					}
					else
					{
						that.callback["mergeFeature"][1](ret, getResultMessage(ret));
					}
					
					break;
					
				case "608" : // 虹膜比对
					if (ret == "0")
					{
						that.callback["matchFeature"][0](arrayMsg[2]);
					}
					else
					{
						that.callback["matchFeature"][1](ret, getResultMessage(ret));
					}
					
					break;
					
				case "609" : // 人脸图像裁剪
					if (ret == "0")
					{
						that.callback["faceCrop"][0](arrayMsg[2]);
					}
					else
					{
						that.callback["faceCrop"][1](ret, getResultMessage(ret));
					}
					
					break;
					
				case "610" : // 虹膜图像裁剪
					if (ret == "0")
					{
						that.callback["irisCrop"][0](arrayMsg[2]+"$&"+arrayMsg[3]);
					}
					else
					{
						that.callback["irisCrop"][1](ret, getResultMessage(ret));
					}
					
					break;
					
				case "300": // 预览数据	
					that.callback["openDevice"][2](arrayMsg[2]+"$&"+arrayMsg[3]+"$&"+arrayMsg[4]);
					break;
				}
			};
		}, 
		
		disconnect:function()
		{
			if (socket == "object" || socket != null)
			{
				socket.onclose = function(){};
				socket.close();
				socket = null;
			}
		}, 
		
		// 打开设备
		openDevice:function(params, onSucc, onFail, onPreview){
			onSucc = onSucc || function(){console.log("打开设备成功");};
			onFail = onFail || function(ret){console.log("打开设备失败:"+ret);};
			onPreview = onPreview || function(data){console.log("preview");};
			this.callback["openDevice"][0] = onSucc;
			this.callback["openDevice"][1] = onFail;
			this.callback["openDevice"][2] = onPreview;
			sendMsg("600$&"+JSON.stringify(params));
		},
		
		// 关闭设备
		closeDevice:function(onSucc, onFail){
			onSucc = onSucc || function(){console.log("关闭成功");};
			onFail = onFail || function(ret){console.log("关闭失败:"+ret);};
			this.callback["closeDevice"][0] = onSucc;
			this.callback["closeDevice"][1] = onFail;
			sendMsg("601");
		}, 
		
		// 启动人脸采集
		faceCapture:function(liveCheck, timeout, onSucc, onFail){
			onSucc = onSucc || function(){console.log("启动人脸采集成功");};
			onFail = onFail || function(ret){console.log("启动人脸采集失败:"+ret);};
			this.callback["faceCapture"][0] = onSucc;
			this.callback["faceCapture"][1] = onFail;
			sendMsg("602$&"+liveCheck+"$&"+timeout);
		},
		
		// 启动虹膜注册
		irisEnroll:function(eye_flag, timeout, onSucc, onFail){
			onSucc = onSucc || function(){console.log("启动虹膜注册成功");};
			onFail = onFail || function(ret){console.log("启动虹膜注册失败:"+ret);};
			this.callback["irisEnroll"][0] = onSucc;
			this.callback["irisEnroll"][1] = onFail;
			sendMsg("603$&"+eye_flag+"$&"+timeout);
		}, 
		
		// 启动虹膜采集
		irisCapture:function(timeout, onSucc, onFail){
			onSucc = onSucc || function(){console.log("启动虹膜采集成功");};
			onFail = onFail || function(ret){console.log("启动虹膜采集失败:"+ret);};
			this.callback["irisCapture"][0] = onSucc;
			this.callback["irisCapture"][1] = onFail;
			sendMsg("604$&"+timeout);
		}, 	
		
		// 启动虹膜人脸注册
		irisFaceEnroll:function(eyeFlag, timeout, onSucc, onFail){
			onSucc = onSucc || function(){console.log("启动虹膜人脸注册成功");};
			onFail = onFail || function(ret){console.log("启动虹膜人脸注册失败:"+ret);};
			this.callback["irisFaceEnroll"][0] = onSucc;
			this.callback["irisFaceEnroll"][1] = onFail;
			sendMsg("605$&"+eyeFlag+"$&"+timeout);
		}, 
		
		// 启动虹膜人脸采集
		irisFaceCapture:function(timeout, onSucc, onFail){
			onSucc = onSucc || function(){console.log("启动虹膜人脸采集成功");};
			onFail = onFail || function(ret){console.log("启动虹膜人脸采集失败:"+ret);};
			this.callback["irisFaceCapture"][0] = onSucc;
			this.callback["irisFaceCapture"][1] = onFail;
			sendMsg("606$&"+timeout);
		}, 
		
		// 虹膜人脸特征融合
		mergeFeature:function(faceFeat, irisFeat, onSucc, onFail){
			onSucc = onSucc || function(data){console.log("特征融合成功");};
			onFail = onFail || function(ret){console.log("特征融合失败:"+ret);};
			this.callback["mergeFeature"][0] = onSucc;
			this.callback["mergeFeature"][1] = onFail;
			sendMsg("607$&"+faceFeat+"$&"+irisFeat);
		}, 
		
		// 特征比对
		matchFeature:function(feat1, feat2, onSucc, onFail){
			onSucc = onSucc || function(score){console.log("比对成功:"+score);};
			onFail = onFail || function(ret){console.log("比对失败:"+ret);};
			this.callback["matchFeature"][0] = onSucc;
			this.callback["matchFeature"][1] = onFail;
			sendMsg("608$&"+feat1+"$&"+feat2);
		}, 
		
		// 人脸图像裁剪
		faceCrop:function(faceImg, faceRect, width, height, maxSize, onSucc, onFail){
			onSucc = onSucc || function(data){console.log("裁剪成功:"+data);};
			onFail = onFail || function(ret){console.log("裁剪失败:"+ret);};
			this.callback["faceCrop"][0] = onSucc;
			this.callback["faceCrop"][1] = onFail;
			sendMsg("609$&"+faceImg+"$&"+faceRect+"$&"+width+"$&"+height+"$&"+maxSize);
		}, 
		
		// 虹膜图像裁剪
		irisCrop:function(irisImg, eyeNum, cropType, format, onSucc, onFail){
			onSucc = onSucc || function(data){console.log("裁剪成功:"+data);};
			onFail = onFail || function(ret){console.log("裁剪失败:"+ret);};
			this.callback["irisCrop"][0] = onSucc;
			this.callback["irisCrop"][1] = onFail;
			sendMsg("610$&"+irisImg+"$&"+eyeNum+"$&"+cropType+"$&"+format);
		}, 
		
	};
	return IrisFaceAPI;
})();