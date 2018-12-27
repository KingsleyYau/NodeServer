/*
* 推送用户退出直播间消息类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// 在线用户
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;
// 业务管理器
const BaseNotice = require('./base-notice');

module.exports = class RoomOutNotice extends BaseNotice {
    constructor(fromUser) {
        super();
        this.notice.noticeData.req_data.userid = fromUser.socketId;
    }

    static getRoute() {
        return 'imShare/leaveRoomNotice';
    }
}