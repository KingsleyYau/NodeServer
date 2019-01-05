/*
* Im主路由
* */

// 路由
const Router = require('koa-router');

// 项目公共库
const Common = require('../../../../lib/common');
// 用户
const User = require('../../../../user/users').User;
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;
// 房间管理器
const RoomMananger = require('../../room/room').RoomManager;
// 业务逻辑处理
const HandleRouter = require('./client-bridge-router').HandleRouter;
const HeartBeatHandler = require('./heartbeat-handler');

// 设置路由
let clientMainRouter = new Router();

function disconnect(ctx) {
    let user = OnlineUserManager.getInstance().getUserWithSocket(ctx.socketId);
    if( !Common.isNull(user) ) {
        OnlineUserManager.getInstance().logout(user);
        if( !Common.isNull(ctx.room) ) {
            let roomManager = RoomMananger.getInstance();
            roomManager.delRoomUser(user, ctx.room.roomId);
        }
    }
}

clientMainRouter.all('/', async (ctx, next) => {
    // 等待异步接口
    await new Promise(function (resolve, reject) {
        ctx.websocket.on('message', async (message) => {
            let reqData = JSON.parse(message);

            // 过滤心跳日志
            if( reqData.route != HeartBeatHandler.getRoute() ) {
                Common.log('im', 'info', '[' + ctx.socketId + ']-MainRouter.request, ' + message);
            }

            let data = '';
            let handlerRespond = {};
            let handler = null;

            // 路由分发
            let handlerCls = HandleRouter.getInstance().getRouterByName(reqData.route);
            if( handlerCls ) {
                handler = new handlerCls();
            }

            if( handler ) {
                // 统一处理返回
                await handler.handle(ctx, reqData).then( (respond) => {
                    handlerRespond = respond;
                }).catch( (err) => {
                    Common.log('im', 'info', '[' + ctx.socketId + ']-MainRouter.handle, err: ', err.message + ', Stack: ' + err.stack);
                });

                if( !Common.isNull(handlerRespond.resData) && handlerRespond.resData != '' ) {
                    // 需要返回的命令
                    let json = '';
                    json = JSON.stringify(handlerRespond.resData);
                    ctx.websocket.send(json);

                    // 过滤心跳日志
                    if( reqData.route != HeartBeatHandler.getRoute() ) {
                        Common.log('im', 'info', '[' + ctx.socketId + ']-MainRouter.respond, ' + json);
                    }
                }

                if(handlerRespond.isKick) {
                    // 需要断开客户端
                    ctx.websocket.close();
                }

                resolve(handlerRespond);
            } else {
                reject();
            }

        })

        ctx.websocket.on('close', function (err) {
            Common.log('im', 'debug', '[' + ctx.socketId + ']-MainRouter.close, ' + err);

            disconnect(ctx);
            reject(err);
        });

        ctx.websocket.on('error', function (err) {
            Common.log('im', 'error', '[' + ctx.socketId + ']-MainRouter.error, ' + err);

            disconnect(ctx);
            reject(err);
        });

    }.bind(this)).then().catch(
        (err) => {
            Common.log('im', 'error', '[' + ctx.socketId + ']-MainRouter.catch, ' + err);

            disconnect(ctx);
        }
    );
});

module.exports = clientMainRouter;