/*
* 推送消息基类
* Author: Max.Chiu
* */

// 日志
const Log = require('../../../lib/log');
let logger = Log.getLogger('im');
// 公共库
const Common = require('../../../lib/common');

// 在线用户
const OnlineUserManager = require('../../../lib/online-users').OnlineUserManager;

module.exports = class BaseNotice {
    constructor() {
        this.notice = {
            noticeData:{
                id:0,
                req_data:{

                }
            }
        }
    }

    static getRoute() {
        return '';
    }

    send(user) {
        this.notice.noticeData.route = this.constructor.getRoute();
        this.notice.noticeData.id = user.noticeId++;

        let json = JSON.stringify(this.notice.noticeData);

        try {
            user.websocket.send(json);
            logger.debug('[' + user.socketId + ']-BaseNotice.send: ', json);
        } catch (err) {
            logger.debug('[' + user.socketId + ']-BaseNotice.send, error: ', err.message);
        }
    }
}