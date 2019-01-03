/*
* 所有推送路由
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// 业务路由
const KickNotice = require('./kick-notice');
const SendMsgNotice = require('./sendmsg-notice');

class NoticeRouter {
    static getInstance() {
        if( Common.isNull(NoticeRouter.instance) ) {
            NoticeRouter.instance = new NoticeRouter();
        }
        return NoticeRouter.instance;
    }

    constructor() {
        this.routeArray = this.constructor.getAllRoutes();
    }

    static getAllRoutes() {
        return [
            KickNotice,
            SendMsgNotice
        ]
    }
}

NoticeRouter.instance = null;

module.exports = {
    NoticeRouter
}