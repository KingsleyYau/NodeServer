/*
* 进入直播间逻辑处理类
* Author: Max.Chiu
* */

// 日志
const Log = require('../../lib/log');
let logger = Log.getLogger('im');

const Common = require('../../lib/common');

// 用户
const User = require('../../lib/users').User;
// 房间管理器
const RoomMananger = require('./room/room').RoomManager;
// 业务管理器
const BaseHandler = require('./base-handler');

module.exports = class RoomInHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imMan/roomIn';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            logger.info('[' + ctx.socketId + ']-RoomInHandler.handle, ' + reqData);

            let roomManager = RoomMananger.getInstance();
            let room = roomManager.getRoom(reqData.req_data.roomid);
            if( Common.isNull(room) ) {
                room = roomManager.addRoom();
            }

            let user = this.getBaseRespond(ctx, reqData);
            if( !Common.isNull(user)  ) {
                room.addUser(user);
                this.respond.resData.data = room.getData();
            }

            resolve(this.respond);
        }.bind(this));
    }
}

