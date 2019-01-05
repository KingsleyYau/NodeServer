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
        return new Promise( async (resolve, reject) => {
            Common.log('im', 'debug', '[' + ctx.socketId + ']-RoomCreateHandler.handle');

            let user = this.getBaseRespond(ctx, reqData);
            let roomManager = RoomMananger.getInstance();
            await roomManager.addRoom(user).then(result => {
                if( Common.isNull(result.err) ) {
                    this.respond.resData.data = result.room.descData();
                } else {
                    this.respond.resData.errno = 16104;
                    this.respond.resData.errmsg = result.err;
                }
            });

            resolve(this.respond);
        });
    }
}

