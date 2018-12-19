// 系统框架
const Http = require('http');
// 异步框架
const Koa = require('koa');
// SocketIO
const SocketIO = require('socket.io');
const jsonParser = require('socket.io-json-parser');
// 项目公共库
const Log = require('./lib/log');
const Common = require('./lib/common');
// 项目接口
const loginRouter = require('./router/im/main-router');

module.exports = class ImService {
    constructor() {
        // 创建日志
        this.logger = Log.getLogger('im');
        // 创建异步框架
        this.koa = new Koa();
        this.app = Http.createServer(this.koa.callback());
        this.io = new SocketIO(this.app, {
            parser: jsonParser
        });

        // 增加公共处理
        this.koa.use( async (ctx, next) => {
            // return `next` to pass the context (ctx) on to the next ws middleware

            // 等待其他中间件处理的异步返回
            await next();
            // 所有中间件处理完成
        });

        // 增加路由
        this.koa.use(loginRouter.routes());

        // socket连接
        this.io.on('connection', (socket) => {
            this.logger.info('New client connected');
            this.io.emit('Connect', 'Hello Client');

            socket.on('Msg', (msg) => {
                this.logger.info('Recv msg: ' + msg);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });

        });
    }

    start(opts) {
        // 启动服务器
        opts = opts || {};

        let port = opts.port || 9877;
        this.app.listen(port);
        this.logger.fatal('Im service start in port : ' + port);
    }
}
