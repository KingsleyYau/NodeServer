// 日志
const Log = require('../../lib/log');
const appLog = require('../../lib/app-log').AppLog.getInstance();
let logger = Log.getLogger('http');

// 路由
const Router = require('koa-router');

// 记录提交管理器
const RecordSender = require('../../extern/records-sender');
let sender = new RecordSender();

// 设置路由
let loginRouter = new Router();
// 定义为异步中间件
loginRouter.all('/login', async (ctx, next) => {
    // 等待异步接口
    let respond;
    await sender.sendRecord('www.baidu.com', '/a/a/a/a').then( (body) => {
        // logger.info(body);
        respond = body;

    }).catch((err) => {
        logger.info('Send Record Error, ' + err.toString());
    });

    ctx.body = respond;

    appLog.log('http', 'info', '[' + ctx.socketId + ']-respond, ' + ' (' + ctx.session.count + '), ' + ctx.request.url);
    // this.logger.info('[' + ctx.socketId + ']-Respond' + ' (' + ctx.user.count + '), ' + ctx.request.url);
});

loginRouter.all('/test', (ctx, next) => {
    // 等待异步接口
    let respond = 'test';
    ctx.body = respond;
});

module.exports = loginRouter;