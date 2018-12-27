/*
* 登录逻辑处理类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../../../../lib/common');

// 用户
const User = require('../../../../user/users').User;
const OnlineUserManager = require('../../../../user/online-users').OnlineUserManager;
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
        return await new Promise(async (resolve, reject) => {
            Common.log('im', 'info', '[' + ctx.socketId + ']-LoginHandler.handle');

            let user = null;

            if( !Common.isNull(reqData.req_data.userId) ) {
                let curTime = new Date();
                user = new User(ctx.socketId, ctx.websocket, reqData.req_data.userId, ctx.connectTtime, curTime.getTime());

                // 等待处理
                await OnlineUserManager.getInstance().login(user);
            }

            user = this.getBaseRespond(ctx, reqData);
            if( !Common.isNull(user) ) {
                // 登录成功
                this.respond.resData.data = {
                    socketId:user.socketId,
                    userId:user.userId,
                    notice:{
                        roomlist:[
                            {
                                roomId:'123',
                                anchor_id:'321'
                            }
                        ]
                    }
                }
            } else {
                // 登录失败
                this.respond.resData.errno = 10002;
                this.respond.resData.errmsg = 'login fail.';
            }

            resolve(this.respond);
        });
    }
}

