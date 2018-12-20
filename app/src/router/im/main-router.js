/*
* Im主路由
* */

// 路由
const Router = require('koa-router');

// 日志
const Log = require('../../lib/log');
let logger = Log.getLogger('im');

// 公共库
const Common = require('../../lib/common');
// 用户
const User = require('../../lib/users').User;
const OnlineUserManager = require('../../lib/online-users').OnlineUserManager;
// 房间管理器
const RoomMananger = require('./room/room').RoomManager;

const BaseHandler = require('./base-handler');
const LoginHandler = require('./login-handler');
const LogoutHandler = require('./logout-handler');
const RoomCreateHandler = require('./roomcreate-handler');
const RoomInHandler = require('./roomin-handler');
const RoomOutHandler = require('./roomout-handler');
const SendMsgHandler = require('./sendmsg-handler');

// 设置路由
let mainRouter = new Router();
// 定义为异步中间件
mainRouter.all('/', async (ctx, next) => {
    // 等待异步接口
    await new Promise(function (resolve, reject) {
        ctx.websocket.on('message', async function (message) {
            logger.info('[' + ctx.socketId + ']-Request, ' + message);

            let data = '';
            let handlerRespond = {};
            let handler = new BaseHandler();

            let reqData = JSON.parse(message);
            if( reqData.route == LoginHandler.getRoute() ) {
                handler = new LoginHandler();
            } else if( reqData.route == LogoutHandler.getRoute() ) {
                handler = new LogoutHandler();
            } else if( reqData.route == RoomCreateHandler.getRoute() ) {
                handler = new RoomCreateHandler();
            } else if( reqData.route == RoomInHandler.getRoute() ) {
                handler = new RoomInHandler();
            } else if( reqData.route == RoomOutHandler.getRoute() ) {
                handler = new RoomOutHandler();
            } else if( reqData.route == SendMsgHandler.getRoute() ) {
                handler = new SendMsgHandler();
            }

            await handler.handle(ctx, reqData).then( (respond) => {
                handlerRespond = respond;
            }).catch( (err) => {
                logger.info('[' + ctx.socketId + ']-Handle, error: ', err.message + ', Stack: ' + err.stack);
            });

            if( !Common.isNull(handlerRespond.resData) && handlerRespond.resData != '' ) {
                // 需要返回的命令
                let json = '';
                json = JSON.stringify(handlerRespond.resData);
                ctx.websocket.send(json);
                logger.info('[' + ctx.socketId + ']-Respond, ' + json);
            }

            if(handlerRespond.isKick) {
                // 需要断开客户端
                ctx.websocket.close();
            }

            resolve(handlerRespond);
        })

        ctx.websocket.on('close', function (err) {
            logger.info('[' + ctx.socketId + ']-Close: ' + err);

            let user = OnlineUserManager.getInstance().getUser(ctx.socketId);
            let roomManager = RoomMananger.getInstance();
            roomManager.delUser(user);
            OnlineUserManager.getInstance().delUser(user);

            reject(err);
        });

        ctx.websocket.on('error', function (err) {
            logger.info('[' + ctx.socketId + ']-Error, error: ' + err);

            let user = OnlineUserManager.getInstance().getUser(ctx.socketId);
            let roomManager = RoomMananger.getInstance();
            roomManager.delUser(user);
            OnlineUserManager.getInstance().delUser(user);

            reject(err);
        });

    }.bind(this)).then().catch(
        (err) => {
            logger.info('[' + ctx.socketId + ']-Unknow, error: ' + err);

            let user = OnlineUserManager.getInstance().getUser(ctx.socketId);
            let roomManager = RoomMananger.getInstance();
            roomManager.delUser(user);
            OnlineUserManager.getInstance().delUser(user);
        }
    );
});

module.exports = mainRouter;