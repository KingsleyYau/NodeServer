/*
* 发送直播间消息逻辑处理类
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

// 推送消息
const SendMsgNotice = require('./notice/sendmsg-notice');

module.exports = class SendMsgHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imShare/sendLiveChat';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            logger.info('[' + ctx.socketId + ']-SendMsgHandler.handle');

            let bFlag = false;
            let user = this.getBaseRespond(ctx, reqData);
            let roomManager = RoomMananger.getInstance();
            let room = roomManager.getRoom(reqData.req_data.roomid);
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

