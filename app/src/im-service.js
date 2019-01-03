// 异步框架
const Koa = require('koa');
// Websocket
const websockify = require('koa-websocket');
// Http框架
const Http = require('http');
// 公共库
const Fs = require('fs');
const Path = require('path');
// SocketIO
const SocketIO = require('socket.io');
const jsonParser = require('socket.io-json-parser');

// 项目公共库
const Common = require('./lib/common');
const AppConfig = require('./config/app-config');
// 项目接口
const mainRouter = require('./router/im/client/handler/main-router');
const interMainRouter = require('./router/im/server/handler/server-main-router');

module.exports = class ImService {
    constructor() {
        // 创建内部服务
        this.createInternalServer();

        // 创建外部服务
        this.createExternalServer();
    }

    createExternalServer() {
        // 创建异步框架
        let koa = new Koa();
        this.exApp = websockify(koa);

        // 增加公共处理
        this.exApp.ws.use( async (ctx, next) => {
            // return `next` to pass the context (ctx) on to the next ws middleware

            // 新的连接, 生成SocketId
            ctx.socketId = 'SOCKETID-' + Math.random().toString(36).substr(2).toLocaleUpperCase();
            // 记录连接时间
            let curTime = new Date();
            ctx.connectTtime = curTime.getTime();

            Common.log('im', 'debug', '[' + ctx.socketId + ']-Im Client Connected');

            // 等待其他中间件处理的异步返回
            await next();
            // 所有中间件处理完成
        });

        // 增加路由
        this.exApp.ws.use(mainRouter.routes());
    }

    createInternalServer() {
        // 创建异步框架
        let koa = new Koa();
        this.inApp = Http.createServer(koa.callback());
        this.io = new SocketIO(this.inApp, {
            parser: jsonParser
        });

        // socket连接
        this.io.on('connection', (socket) => {
            // 记录连接时间
            let curTime = new Date();
            socket.connectTtime = curTime.getTime();
            Common.log('im-server', 'debug', '[' + socket.id + ']-Im Server Connected');

            interMainRouter(socket);
        });
    }

    start(opts) {
        // 启动服务器
        opts = opts || {};
        let exPort = AppConfig.exApp.port;
        this.exApp.listen(exPort);

        let inPort = AppConfig.inApp.port;
        if( !Common.isNull(process.env.INSTANCE_ID) ) {
            inPort += parseInt(process.env.INSTANCE_ID);
        }
        this.inApp.listen(inPort);

        Common.log('im', 'fatal', 'Im service start in exPort : ' + exPort + ', inPort : ' + inPort);
    }
}
