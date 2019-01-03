/*
* 发送直播间消息逻辑处理类
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
// 推送消息
const SendMsgNotice = require('../notice/sendmsg-notice');

module.exports = class BroadcastMsgHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imShare/sendLiveChat';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            Common.log('im', 'info', '[' + ctx.socketId + ']-BroadcastMsgHandler.handle');

            let bFlag = false;
            let user = this.getBaseRespond(ctx, reqData);
            let roomManager = RoomMananger.getInstance();
            let room = roomManager.getRoom(reqData.req_data.roomId);
            if( !Common.isNull(user)  ) {
                if( !Common.isNull(room) ) {
                    bFlag = true;
                } else {
                    this.respond.resData.errno = 16104;
                    this.respond.resData.errmsg = 'live room is not exist.'
                }
            }

            if( bFlag ) {
                // 发送消息到直播间
                let notice = new SendMsgNotice(user, reqData.req_data.msg);
                room.broadcast(notice);
            }

            resolve(this.respond);

        }.bind(this));
    }
}

