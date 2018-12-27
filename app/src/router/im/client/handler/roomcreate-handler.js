/*
* 进入直播间逻辑处理类
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

module.exports = class RoomCreateHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imMan/roomCreate';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            Common.log('im', 'info', '[' + ctx.socketId + ']-RoomCreateHandler.handle');

            let roomManager = RoomMananger.getInstance();
            let room = roomManager.getRoom(reqData.req_data.roomid);
            if( Common.isNull(room) ) {
                room = roomManager.addRoom();
            }

            this.respond.resData.data = room.getData();

            resolve(this.respond);
        }.bind(this));
    }
}

