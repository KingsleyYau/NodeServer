/*
* 断开客户端逻辑处理类
* Author: Max.Chiu
* */

// 日志
const Log = require('../../lib/log');
let logger = Log.getLogger('im');

const Common = require('../../lib/common');

// 用户
const User = require('../../lib/users').User;
// 业务管理器
const BaseHandler = require('./base-handler');

module.exports = class LogoutHandler extends BaseHandler {
    constructor() {
        super();
    }

    static getRoute() {
        return 'imLogin/logout';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            logger.info('[' + ctx.socketId + ']-LogoutHandler.handle');

            let user = this.getBaseRespond(ctx, reqData);
            if( !Common.isNull(user)  ) {
                this.respond.isKick = true;
            }

            resolve(this.respond);
        }.bind(this));
    }
}

