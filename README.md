- [简介](#简介)
- [功能说明](#功能说明)
- [构建](#构建)
  - [环境要求](#环境要求)
  - [依赖包的安装](#依赖包的安装)
  - [编译](#编译)
  - [打发布包](#打发布包)
  - [发布到仓库](#发布到仓库)
- [安装](#安装)
- [使用](#使用)
- [项目结构说明](#项目结构说明)
- [FAQ](#faq)
  - [npm如何安装](#npm如何安装)
  - [npm编译错误](#npm编译错误)
  - [npm install 安装缓慢问题](#npm install 安装缓慢问题)
  - [使用多模态录入失败](#使用多模态录入失败)
- [相关链接](#相关链接)
- [支持](#支持)

## 简介

本工程为多模态智慧管理云平台3.0版本前端，主要集成指纹、虹膜、人脸、多模态等生物信息，对设备、人员、场景进行相关联的集成化saas系统。该工程的前端主要应用vue-cli+vue-router+vuex进行搭建，组件库为elementui [官方文档](https://element.eleme.cn/) 。

## 功能说明

1. 生物信息以及账号密码登录。
2. 维护成员以及人员的生物信息以及基本信息，生物信息包含人脸、虹膜、指纹、多模态、指静脉。
3. 设备的维护以及管理，包括设备信息维护、设备参数下发、设备参数维护等。
4. 场景管理。

## 构建

### 环境要求

运行环境要求:

- node14+ 
- npm6+ 
- vue-cli4+

编译要求:

- node14+ 
- npm6+ 

### 依赖包的安装

前端的依赖包安装在编译过程进行，详见下方编译章节内容。

### 编译

------



```shell
# 克隆项目
git clone http://192.168.0.68/gitlab/sdeyecool/eyecool-biapwp-website.git
# 进入项目目录
cd eyecool-biapwp-website
# 安装依赖
npm install

```

### 打发布包

------

```shell
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

### 发布到仓库

前端编译好的项目目前只存储至企业云盘，并没有存放至仓库。



## 安装

若想使用该系统的生物信息识别以及录入功能，则需要安装相应的sdk：

| sdk名称          | sdk版本    | 备注          |
| -------------- | -------- | ----------- |
| 眼神科技指纹SDK      | 1.0.0.5  |             |
| 眼神科技虹膜SDK      | V3.2.4.4 |             |
| 眼神科技虹膜人脸多模态SDK | 1.0.0.6  | 1.0.0.9也可使用 |
| 眼神科技人脸摄像头SDK   | 1.0.9.52 |             |



## 使用

项目[编译](#编译)完成后，运行以下命令：

```shell
# 本地运行
npm run dev
```

浏览器访问 http://localhost:80

注：若80端口被其他进程占用，则为http://localhost:81，以此类推。相应地址也会在控制台输出。

## 项目结构说明



```
├───bin                               自动化构建脚本
├───build                             运维使用的node脚本
├───eyecool-popwin-view               动态人脸内容
├───node_modules                      构建系统的依赖
├───public                      	  静态资源
│   └───config                   	  打包后可修改logo、项目名称等配置
├───src								  工程主要的源码
│   ├───api                       	  接口
│   ├───assets                        静态资源，包括全局css
│   ├───components           		  全局公用组件
│   │   ├───BioCollect				  生物信息采集组件
│   │   ├───Breadcrumb				  项目框架内置面包屑
│   │   ├───Editor				      编辑器
│   │   ├───Hamburger				  svg（无用）
│   │   ├───HeaderSearch		      系统头部搜索
│   │   ├───IconSelect				  icon选择器
│   │   ├───Pagination				  分页器
│   │   ├───PanThumb				  内容容器（无用）
│   │   ├───progress				  进度条
│   │   ├───RightPanel				  框架内置组件
│   │   ├───RightToolbar			  框架内置组件
│   │   ├───Screenfull				  全屏
│   │   ├───SizeSelect				  尺寸选择
│   │   ├───SvgIcon				      svg
│   │   ├───ThemePicker				  主题选择器
│   │   ├───UploadFile				  文件上传
│   │   └───UploadImage				  图片上传
│   ├───directive           		  自定义指令
│   ├───layout           		      布局相关内容
│   ├───router           		      路由配置项
│   ├───store           		      vuex配置项
│   ├───utils           		      全局公用方法
│   ├───views           		      项目页面
│   ├───App.vue           		      入口页面组件
│   ├───main.js           		      入口文件
│   ├───mscsschange.js                兼容IE的css设置
│   ├───permission.js           	  路由权限配置
│   └───settings.js           		  项目基本配置
├───.editorconfig                     编译器配置
├───.env.development                  配置开发环境的环境变量
├───.env.production                   配置生产环境的环境变量
├───.env.staging                  	  配置测试环境的环境变量
├───.eslintignore                     eslint忽略项
├───.eslintrc.js                      eslint配置项
├───.gitignore                  	  git忽略项
├───babel.config.js                   babel浏览器兼容性
├───package.json                  	  依赖配置文件
├───package-lock.json                 依赖配置文件（锁定依赖项的版本）
└───vue.config.js                     vuecli配置未见

```





## FAQ

### npm如何安装

新版的NodeJS已经集成了npm，所以在安装完node时npm也一并安装好了。可以在cmd命令行输入" npm -v"来测试是否成功安装。



### npm编译错误

在本机已经安装好**node**环境，并且在执行  ``npm instal``命令时，出现大量报错，考虑是否为npm的版本或者node的版本的问题，如果更新至最新版本还是出现报错，建议安装node版本为**14.17.1** （npm版本自动为6.14.13）。



### npm install 安装缓慢问题

由于项目基于node服务的单页面应用，其本身借运行与打包构建都是借助了一些npm市场上的插件或组件。然而在npm install拉取远程包的过程中，由于外网的访问速度被限制还有的链接指向的是github，所以导致我们的安装速度大打折扣，甚至是安装失败，因此可以使用：

```shell
npm config set registry https://registry.npm.taobao.org
```

可以切换至国内镜像，提升下载速度。或者可以使用cnpm进行下载，其命令和npm一致，即``cnpm install`` ,不过要想使用需要安装cnpm,请输入一下命令：

```shell
npm install -g cnpm --registry=https://registry.npm.taobao.org
```



### 使用多模态录入失败

在项目使用中使用多模态采集录入生物信息时，画面能正常显示，但还未录入就提示失败可能是sdk的版本问题，目前只兼容1.0.0.6版本以及1.0.0.9版本，若1.0.0.9版本也出现相同问题，请安装1.0.0.6版本，并且该sdk的运行浏览器最好是**谷歌浏览器** 。



## 相关链接

- [下载地址](http://192.168.0.68/gitlab/sdeyecool/prodcut/Saas3.0/eyecool-biapwp-website.git)
- [BUG登记](http://192.168.0.68/zentao/index.php?m=bug&f=browse&root=218&branch=&type=byModule&param=1664)
- [需求地址](http://192.168.0.68/zentao/index.php?m=product&f=browse&root=218&branch=&type=byModule&param=1664)

## 支持

支持人员:

- 开发：[何振东](hezhendong@eyecool.cn)   [马文军](mawenjun@eyecool.cn)
- 设计： [马文军](mawenjun@eyecool.cn)