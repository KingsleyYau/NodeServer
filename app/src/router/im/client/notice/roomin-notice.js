/*
* 推送用户进入直播间消息类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// 业务管理器
const BaseNotice = require('./base-notice');

module.exports = class RoomInNotice extends BaseNotice {
    constructor(userId) {
        super();
        this.obj.noticeData.req_data.userId = userId;
    }

    static getRoute() {
        return 'imShare/enterRoomNotice';
    }
}