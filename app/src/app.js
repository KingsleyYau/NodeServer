/*
* 程序入口
* */

// 项目公共库
const Log = require('./lib/log');
// 创建日志
const logger = Log.getLogger('main');

// Http服务
const HttpService = require('./http-service');
// Im服务
const ImService = require('./im-service');

// 日志服务
const appLog = require('./lib/app-log').AppLog.getInstance();

let port = 9876;
// 启动Http
http = new HttpService();
http.start({ port:port} );

// 启动Im
im = new ImService();
im.start({ port:port + 1});

appLog.log('main', 'fatal', 'Server start finish, pid : ' + process.pid + ', env : ' + process.env.NODE_ENV + ', instance : ' + process.env.INSTANCE_ID);