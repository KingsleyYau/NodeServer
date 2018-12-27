/*
* 在线用户管理类
* Author: Max.Chiu
* */

const io = require('socket.io-client');
const jsonParser = require('socket.io-json-parser');

// 项目公共库
const Common = require('../lib/common');
// 用户管理器
const Users = require('./users');
// Redis
const redisClient = require('../lib/redis-client').RedisClient.getInstance();
// Model的Keys
const DBModelKeys = require('../db/model-keys');
// 消息推送类
const KickNotice = require('../router/im/client/notice/kick-notice');

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

    /*
    * 增加用户
    * 如果已经登录, 则通知其他进程踢出, 再登录
    *
    * */
    async login(user) {
        return await new Promise(function (resolve, reject) {
            redisClient.client.keys(user.userIdPattern(), (err, res) => {
                Common.log('im', 'info', '[' + user.userId  + ']OnlineUserManager.login, keys: ' + res + ', err: ' + err);

                if( !Common.isNull(res) && res.length > 0 ) {
                    for(let i = 0; i < res.length; i++){
                        // 如果用户已经登录
                        redisClient.client.hgetall(res[i], (err, res) => {
                            if( res != null ) {
                                // 获取用户登录信息成功
                                let json = JSON.stringify(res);
                                Common.log('im', 'debug', '[' + user.userId  + ']OnlineUserManager.login, hgetall:' + json + ', err: ' + err);

                                // 已经在本地登录, 踢掉
                                if( res.ServerHostKey == user.serverHost && res.ServerPortKey == user.serverPort ) {
                                    let oldUser = this.getUser(res.SocketIdKey);
                                    if( !Common.isNull(oldUser) ) {
                                        Common.log('im', 'warn', '[' + user.userId  + ']OnlineUserManager.login, Kick Local User: ' + json);
                                        let notice = new KickNotice();
                                        notice.send(oldUser);
                                    }
                                } else {
                                    // 在其他地方登录, 通知踢下线
                                    let url = res.ServerHostKey + ':' + res.ServerPortKey;
                                    Common.log('im', 'warn', '[' + user.userId  + ']OnlineUserManager.login, Kick Remote User: ' + json);

                                    let client = io(url, {
                                        parser:jsonParser
                                    });

                                    client.emit('kick', {
                                        id:0,
                                        req_data:res
                                    });
                                }
                            }
                        });
                    }

                    // 更新登录信息
                    this.loginLocal(user, resolve);

                } else {
                    // 更新登录信息
                    this.loginLocal(user, resolve);
                }

            });
        }.bind(this));
    }

    /*
    * 删除用户
    * */
    logout(user) {
        // 本地删除
        if( !Common.isNull(user) ) {
            this.userManager.delUser(user.socketId);

            // redis删除
            redisClient.client.del(user.uniquePattern(), (err, res) => {
                Common.log('im', 'warn', '[' + user.userId  + ']OnlineUserManager.logout, delete: ' + res + ', err: ' + err);
            });
        } else {
            Common.log('im', 'warn', '[null]OnlineUserManager.logout, No Such User');
        }
    }

    /*
    * 根据SocketId获取本地用户
    * @param socketId 连接唯一Id
    * */
    getUser(socketId) {
        return this.userManager.getUser(socketId);
    }

    /*
    * 清空本地所有用户
    * */
    logoutAllLocalUsers() {
        Common.log('im', 'warn', '[null]OnlineUserManager.logoutAllLocalUsers');

        this.userManager.getUsers((userId, user) => {
            // redis删除
            redisClient.client.del(user.uniquePattern(), null);
        });
    }

    /*
    * 增加本地用户
    * */
    loginLocal(user, resolve) {
        // 增加到redis
        redisClient.client.hmset(user.uniquePattern(),
            DBModelKeys.RedisKey.UserKey.SocketIdKey, user.socketId,
            DBModelKeys.RedisKey.UserKey.UserIdKey, user.userId,
            DBModelKeys.RedisKey.UserKey.ConnectTimeKey, user.connectTime,
            DBModelKeys.RedisKey.UserKey.LoginTimeKey, user.loginTime,
            DBModelKeys.RedisKey.UserKey.ServerHostKey, user.serverHost,
            DBModelKeys.RedisKey.UserKey.ServerPortKey, user.serverPort,
            (err, res) => {
                Common.log('im', 'info', '[' + user.userId  + ']OnlineUserManager.loginLocal, ' + res + ', err:' + err);

                // 增加本地用户
                this.userManager.addUser(user);

                // 登录处理完成
                resolve();
            });
    }
}
OnlineUserManager.instance = null;

module.exports = {
    OnlineUserManager
}