/*
* 退出直播间处理类
* Author: Max.Chiu
* */

// 日志
const Log = require('../../lib/log');
let logger = Log.getLogger('im');
// 公共库
const Common = require('../../lib/common');

// 用户
const User = require('../../lib/users').User;
// 房间管理器
const RoomMananger = require('./room/room').RoomManager;
// 业务管理器
const BaseHandler = require('./base-handler');

module.exports = class RoomOutHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imMan/roomOut';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            logger.info('[' + ctx.socketId + ']-RoomOutHandler.handle, ' + reqData);

            let user = this.getBaseRespond(ctx, reqData);
            if( !Common.isNull(user)  ) {
                let roomManager = RoomMananger.getInstance();
                let room = roomManager.getRoom(reqData.req_data.roomid);
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

