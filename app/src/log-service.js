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

class LogService {
    constructor() {
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

        // socket连接
        this.io.on('connection', (socket) => {
            socket.on('disconnect', () => {
            });

            socket.on('log', (obj) => {
                let json = JSON.stringify(obj);

                let logger = Log.getLogger('');
                logger.log(obj.level, '['+ obj.pid + '][' + obj.category + '] - ' + obj.msg);
            });

        });
    }

    start(opts) {
        // 启动服务器
        opts = opts || {};

        let port = opts.port || 9875;
        this.app.listen(port);

        let logger = Log.getLogger('');
        logger.log('fatal', '[' + process.pid + '][log] - ' + '###################################');
        logger.log('fatal', '[' + process.pid + '][log] - ' + 'Log service start in port : ' + port);
    }
}

let service = new LogService();
service.start();