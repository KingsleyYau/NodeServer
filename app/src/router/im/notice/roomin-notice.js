/*
* 推送用户进入直播间消息类
* Author: Max.Chiu
* */

// 日志
const appLog = require('../../../lib/app-log').AppLog.getInstance();
// 公共库
const Common = require('../../../lib/common');

// 在线用户
const OnlineUserManager = require('../../../lib/online-users').OnlineUserManager;
// 业务管理器
const BaseNotice = require('./base-notice');

module.exports = class RoomInNotice extends BaseNotice {
    constructor(fromUser) {
        super();
        this.notice.noticeData.req_data.userId = fromUser.socketId;
    }

    static getRoute() {
        return 'imShare/enterRoomNotice';
    }
}