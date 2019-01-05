/*
* 推送直播间关闭消息类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// 在线用户
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;
// 业务管理器
const BaseNotice = require('./base-notice');

module.exports = class RoomCloseNotice extends BaseNotice {
    constructor(roomId) {
        super();
        this.obj.noticeData.req_data.roomId = roomId;
    }

    static getRoute() {
        return 'imShare/roomCloseNotice';
    }
}