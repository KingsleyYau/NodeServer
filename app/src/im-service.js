// 异步框架
const Koa = require('koa');
// Websocket
const websockify = require('koa-websocket');
// 公共库
const Fs = require('fs');
const Path = require('path');
// 项目公共库
const Log = require('./lib/log');
const appLog = require('./lib/app-log').AppLog.getInstance();
const Session = require('./lib/session');
const Common = require('./lib/common');
// 项目接口
const loginRouter = require('./router/im/main-router');

module.exports = class ImService {
    constructor() {
        // 创建日志
        this.logger = Log.getLogger('im');
        // 创建异步框架
        let koa = new Koa();
        this.app = websockify(koa);

        // 增加公共处理
        this.app.ws.use( async (ctx, next) => {
            // return `next` to pass the context (ctx) on to the next ws middleware

            // 新的连接, 生成SocketId
            ctx.socketId = 'SOCKETID-' + Math.random().toString(36).substr(2).toLocaleUpperCase();

            // 等待其他中间件处理的异步返回
            await next();
            // 所有中间件处理完成
        });

        // 增加路由
        this.app.ws.use(loginRouter.routes());
    }

    start(opts) {
        // 启动服务器
        opts = opts || {};

        let port = opts.port || 9877;
        this.app.listen(port);

        appLog.log('im', 'fatal', 'Im service start in port : ' + port);
    }
}
