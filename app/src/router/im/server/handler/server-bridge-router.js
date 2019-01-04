/*
* 允许转发的路由
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');
// 业务路由
const KickNotice = require('../../client/notice/kick-notice');
const RoomInNotice = require('../../client/notice/roomin-notice');
const RoomOutNotice = require('../../client/notice/roomout-notice');
const SendMsgNotice = require('../../client/notice/sendmsg-notice');

class BridgeRouter {
    static getInstance() {
        if( Common.isNull(BridgeRouter.instance) ) {
            BridgeRouter.instance = new BridgeRouter();
        }
        return BridgeRouter.instance;
    }

    constructor() {
        this.routeArray = this.constructor.getAllRoutes();
    }

    static getAllRoutes() {
        return [
            KickNotice,
            RoomInNotice,
            RoomOutNotice,
            SendMsgNotice
        ]
    }
}

BridgeRouter.instance = null;

module.exports = {
    BridgeRouter
}