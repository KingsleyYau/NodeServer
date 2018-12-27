/*
* Http服务类
* */

// http服务
const Http = require('http');
Http.globalAgent.maxSockets = Infinity;
const Https = require('https');
// 异步框架
const Koa = require('koa');
// 静态资源
const Serve = require('koa-static');
// 公共库
const Fs = require('fs');
const Path = require('path');

// 项目公共库
const Common = require('./lib/common');
const Session = require('./lib/session');
const AppConfig = require('./config/app-config');
// 项目接口
const loginRouter = require('./router/http/login-router');

module.exports = class HttpService {
    constructor() {
        // 创建异步框架
        this.app = new Koa();

        // 配置静态资源文件
        let staticRoot = new Serve(Path.join(__dirname, 'static'));
        this.app.use(staticRoot);

        // 使用session中间件
        this.app.use(Session.getSession());

        // 增加公共处理
        this.app.use(async (ctx, next) => {
            let sessionId = ctx.session.sessionId;
            if( Common.isNull(sessionId) ) {
                ctx.session = {
                    sessionId: 'SESSIONID-' + Math.random().toString(36).substr(2).toLocaleUpperCase(),
                    count: 0
                }
            } else {
                ctx.session.count++;
            }

            Common.log('http', 'info', '[' + ctx.socketId + ']-request, ' + ' (' + ctx.session.count + '), ' + ctx.request.url);

            // 等待其他中间件处理的异步返回
            await next();
            // 所有中间件处理完成
        });

        // 增加路由
        this.app.use(loginRouter.routes());
    }

    start(opts) {
        // 启动服务器
        opts = opts || {};

        let port = AppConfig.http.port;;
        Http.createServer(this.app.callback()).listen(port);

        Common.log('http', 'fatal', 'Http service start in port : ' + port);
    }
}