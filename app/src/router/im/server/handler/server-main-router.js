/*
* Im主路由
* */

// 路由
const Router = require('koa-router');

// 项目公共库
const Common = require('../../../../lib/common');
// Model的Keys
const DBModelKeys = require('../../../../db/model-keys');
// 用户
const User = require('../../../../user/users').User;
// 在线用户管理
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;
// 房间管理器
const RoomMananger = require('../../room/room').RoomManager;

// 逻辑处理
const noticeRouter = require('../../client/notice/notice-router').NoticeRouter.getInstance();

// 设置路由
module.exports = function mainRouter(socket) {
    socket.on('disconnect', () => {
        Common.log('im-server', 'info', '[' + socket.id + ']-MainRouter.disconnect, ' + socket.id);
    });

    for (let i = 0; i < noticeRouter.routeArray.length; i++) {
        let route = noticeRouter.routeArray[i].getRoute();
        socket.on(route, (reqData) => {
            let json = JSON.stringify(reqData);
            Common.log('im-server', 'info', '[' + socket.id + ']-MainRouter.on, ' + route + ', ' + json);

            // 转发通知
            if( !Common.isNull(reqData.socketId) ) {
                let user = OnlineUserManager.getInstance().getUserWithSocket(reqData.socketId);
                if( !Common.isNull(user) ) {
                    // 增加本地推送Id
                    reqData.id = user.noticeId++;

                    let disconnect = false;
                    if( !Common.isNull(reqData.isKick) ) {
                        disconnect = reqData.isKick;

                        // 删除多余字段
                        delete reqData['isKick'];
                    }

                    json = JSON.stringify(reqData);
                    Common.log('im-server', 'info', '[' + user.userId + ']-MainRouter.on, ' + route + ', notice: ' + json);
                    user.websocket.send(json);

                    if( disconnect ) {
                        user.websocket.close();
                    }
                }
            }
        });
    }
};