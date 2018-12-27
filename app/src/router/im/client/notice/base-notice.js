/*
* 推送消息基类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');

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
            Common.log('im', 'info', '[' + user.socketId + ']-BaseNotice.send: ' + json);
            user.websocket.send(json);
        } catch (err) {
            Common.log('im', 'debug', '[' + user.socketId + ']-BaseNotice.send, error: ' + err.message);
        }
    }
}