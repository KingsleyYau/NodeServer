/*
* 内部逻辑处理基类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// Model的Keys
const DBModelKeys = require('../../../../db/model-keys');
// 用户
const User = require('../../../../user/users').User;
// 在线用户管理
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;

// 业务管理器
const BaseHandler = require('./server-base-handler');
// 消息推送类
const KickNotice = require('../../client/notice/kick-notice');

module.exports = class KickHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'kick';
    }

    async handle(socket, reqData) {
        return await new Promise(function (resolve, reject) {
            let json = JSON.stringify(reqData);
            Common.log('im-server', 'info', '[' + socket.id + ']-KickHandler.handle');

            let socketId = reqData.req_data[DBModelKeys.RedisKey.UserKey.SocketIdKey];
            let oldUser = OnlineUserManager.getInstance().getUser(socketId);
            if( !Common.isNull(oldUser) ) {
                Common.log('im-server', 'warn', '[' + socket.id  + ']-KickHandler.handle, Client Kick By Remote: ' + json);
                let notice = new KickNotice();
                notice.send(oldUser);
            }

            this.sendRespond(socket, reqData);

            resolve();
        }.bind(this));
    }
}