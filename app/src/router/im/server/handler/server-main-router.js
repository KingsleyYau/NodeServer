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
const BaseHandler = require('./server-base-handler');
const KickHandler = require('./server-kick-handler');

// 消息推送类
const KickNotice = require('../../client/notice/kick-notice');

// 设置路由
module.exports = function mainRouter(socket) {
    socket.on('disconnect', () => {
        Common.log('im-server', 'info', '[' + socket.id + ']-MainRouter, Internal Client Disonnected, ' + socket.id);
    });

    socket.on(KickHandler.getRoute(), (reqData) => {
        let handler = new KickHandler();
        handler.handle(socket, reqData);
    });

};