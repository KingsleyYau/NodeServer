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
// const ImService = require('./socketio-service');

let port = 9876;
// 启动Http
http = new HttpService();
http.start({ port:port} );

// 启动Im
im = new ImService();
im.start({ port:port + 1});

logger.fatal('Server start finish');