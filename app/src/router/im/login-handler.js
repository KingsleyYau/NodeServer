/*
* 登录逻辑处理类
* Author: Max.Chiu
* */

// 日志
const appLog = require('../../lib/app-log').AppLog.getInstance();
// 公共库
const Common = require('../../lib/common');

// 用户
const User = require('../../lib/users').User;
const OnlineUserManager = require('../../lib/online-users').OnlineUserManager;
// 业务管理器
const BaseHandler = require('./base-handler');

module.exports = class LoginHandler extends BaseHandler {
    constructor() {
        super();

        this.route = LoginHandler.getRoute();
    }

    static getRoute() {
        return 'imLogin/login';
    }

    async handle(ctx, reqData) {
        return await new Promise(function (resolve, reject) {
            appLog.log('im', 'info', '[' + ctx.socketId + ']-LoginHandler.handle');

            let user = new User(ctx.socketId, ctx.websocket);
            OnlineUserManager.getInstance().addUser(user);

            user = this.getBaseRespond(ctx, reqData);
            if( !Common.isNull(user) ) {
                this.respond.resData.data = {
                    socketid:user.socketId,
                    notice:{
                        roomlist:[
                            {
                                roomid:'123',
                                anchor_id:'321'
                            }
                        ]
                    }
                }
            }

            resolve(this.respond);
        }.bind(this));
    }
}

