/*
* 发送消息逻辑处理类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// 在线用户
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;
// 业务管理器
const BaseHandler = require('./base-handler');
// 推送消息
const NoticeSender = require('../notice-sender/notice-sender');
const SendMsgNotice = require('../notice/sendmsg-notice');

module.exports = class SendMsgHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imShare/sendMsg';
    }

    async handle(ctx, reqData) {
        return await new Promise( async (resolve, reject) => {
            Common.log('im', 'info', '[' + ctx.socketId + ']-SendMsgHandler.handle');

            let bFlag = false;
            let user = this.getBaseRespond(ctx, reqData);

            if( !Common.isNull(user) ) {
                // 查找目标用户
                if( !Common.isNull(reqData.req_data.toUserId) ) {
                    OnlineUserManager.getInstance().getUserWithId(reqData.req_data.toUserId).then( async (userList) => {
                        for (let i = 0; i < userList.length; i++) {
                            let desUser = userList[i];

                            // 发送消息到用户
                            let sender = new NoticeSender();
                            let notice = new SendMsgNotice(user.userId, desUser.userId, reqData.req_data.msg);
                            sender.send(desUser.userId, notice);
                        }
                    });
                }
            }

            resolve(this.respond);
        });
    }
}

