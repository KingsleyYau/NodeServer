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

// 用户
const OnlineUserManager = require('./lib/online-users').OnlineUserManager;

// 启动Http
http = new HttpService();
http.start();

// 启动Im
im = new ImService();
im.start();

function handle(signal) {
    appLog.log('main', 'fatal', 'Server exit pid : ' + process.pid + ', env : ' + process.env.NODE_ENV + ', instance : ' + process.env.INSTANCE_ID);
    // 清空缓存用户列表
    OnlineUserManager.getInstance().logoutAllLocalUsers();
    // 退出程序
    process.exit();
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGTERM', handle);

appLog.log('main', 'fatal', 'Server start finish, pid : ' + process.pid + ', env : ' + process.env.NODE_ENV + ', instance : ' + process.env.INSTANCE_ID);