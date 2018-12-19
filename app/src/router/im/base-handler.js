/*
* 逻辑处理基类
* Author: Max.Chiu
* */

// 日志
const Log = require('../../lib/log');
let logger = Log.getLogger('im');
// 公共库
const Common = require('../../lib/common');

// 在线用户
const OnlineUserManager = require('../../lib/online-users').OnlineUserManager;

module.exports = class BaseHandler {
    constructor() {
        this.respond = {
            isKick:false,
            resData:{
                id:0,
                errno:0,
                errmsg:'',
                data:null
            }

        }
    }

    static getRoute() {
        return '';
    }

    getBaseRespond(ctx, reqData) {
        this.respond.resData.id = reqData.id;
        this.respond.resData.route = this.constructor.getRoute();

        let user = OnlineUserManager.getInstance().getUser(ctx.socketId);
        if( Common.isNull(user) ) {
            // 还没登录
            this.respond.resData.errno = 10002;
            this.respond.resData.errmsg = 'Need to login.';
        }

        return user;
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            logger.info('[' + ctx.socketId + ']-BaseHandler.handle, ' + reqData);
            this.getBaseRespond(reqData);
            reject('');
        }.bind(this));
    }
}