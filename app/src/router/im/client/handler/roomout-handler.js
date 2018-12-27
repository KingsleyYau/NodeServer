/*
* 退出直播间处理类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// 在线用户
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;
// 业务管理器
const BaseHandler = require('./base-handler');
// 房间管理器
const RoomMananger = require('../../room/room').RoomManager;

module.exports = class RoomOutHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imMan/roomOut';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            Common.log('im', 'info', '[' + ctx.socketId + ']-RoomOutHandler.handle');

            let user = this.getBaseRespond(ctx, reqData);
            if( !Common.isNull(user)  ) {
                let roomManager = RoomMananger.getInstance();
                let room = roomManager.getRoom(reqData.req_data.roomId);
                if( !Common.isNull(room) ) {
                    room.delUser(user);
                } else {
                    this.respond.resData.errno = 16104;
                    this.respond.resData.errmsg = 'live room is not exist.'
                }
            }

            resolve(this.respond);
        }.bind(this));
    }
}

