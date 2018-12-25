/*
* 在线用户管理类
* Author: Max.Chiu
* */

const Common = require('./common');
// 日志
const appLog = require('./app-log').AppLog.getInstance();
// 用户管理器
const Users = require('./users');
// Redis
const redisClient = require('./redis-client').RedisClient.getInstance();
// Model的Keys
const DBModelKeys = require('../model/model-keys');

class OnlineUserManager {
    static getInstance() {
        if( Common.isNull(OnlineUserManager.instance) ) {
            OnlineUserManager.instance = new OnlineUserManager();
        }
        return OnlineUserManager.instance;
    }

    constructor() {
        this.userManager = new Users.UserManager();
    }

    async addUser(user) {
        return await new Promise(function (resolve, reject) {
            redisClient.client.exists(user.key(), (err, res) => {
                appLog.log('im', 'info', '[' + user.userId  + ']OnlineUserManager.addUser, exists:' + res + ', err:' + err);

                if( res ) {
                    // 如果用户已经登录, 踢下线
                }

                // 更新登录信息
                redisClient.client.hmset(user.key(),
                    DBModelKeys.RedisKey.UserKey.SocketIdKey, user.socketId,
                    DBModelKeys.RedisKey.UserKey.UserIdKey, user.userId,
                    (err, res) => {
                    appLog.log('im', 'info', '[' + user.userId  + ']OnlineUserManager.addUser, add:' + res + ', err:' + err);

                    // 增加到本地内存
                    this.userManager.addUser(user);

                    // 登录处理完成
                    resolve();
                });
            });
        }.bind(this));
    }

    delUser(user) {
        this.userManager.delUser(user.socketId);

        redisClient.client.del(user.key(), (err, res) => {
            appLog.log('im', 'info', '[' + user.userId  + ']OnlineUserManager.delUser, delete:' + res + ', err:' + err);
        });
    }

    getUser(socketId) {
        return this.userManager.getUser(socketId);
    }
}
OnlineUserManager.instance = null;

module.exports = {
    OnlineUserManager
}