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
        return await new Promise( async (resolve, reject) => {
            Common.log('im', 'info', '[' + ctx.socketId + ']-BroadcastMsgHandler.handle');

            let user = this.getBaseRespond(ctx, reqData);
            let roomManager = RoomMananger.getInstance();
            await roomManager.broadcast(user, reqData.req_data.roomId, reqData.req_data.msg).then(result => {
                if( Common.isNull(result.err) ) {
                    // 记录连接直播间Id到
                    ctx.room = result.room;

                    this.respond.resData.data = result.room.getData();
                } else {
                    this.respond.resData.errno = 16104;
                    this.respond.resData.errmsg = result.err;
                }
            });

            resolve(this.respond);

        });
    }
}

