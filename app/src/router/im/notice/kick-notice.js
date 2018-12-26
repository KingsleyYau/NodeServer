/*
* 断开用户连接消息类
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

module.exports = class KickNotice extends BaseNotice {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imShare/kickNotice';
    }

    send(user) {
        super.send(user);
        user.websocket.close();
    }
}