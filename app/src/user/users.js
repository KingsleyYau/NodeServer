/*
* 用户管理类
* Author: Max.Chiu
* */

// 项目公共库
const Common = require('../lib/common');
// App配置
const AppConfig = require('../config/app-config');
// Model的Keys
const DBModelKeys = require('../db/model-keys');

class User {
    constructor(socketId, websocket, userId, connectTime, loginTime) {
        this.noticeId = 0;
        this.userId = userId;
        this.socketId = socketId;
        this.websocket = websocket;
        this.connectTime = connectTime;
        this.loginTime = loginTime;

        this.serverHost = AppConfig.inApp.host;
        let inPort = AppConfig.inApp.port;
        if( !Common.isNull(process.env.INSTANCE_ID) ) {
            inPort += parseInt(process.env.INSTANCE_ID);
        }
        this.serverPort = inPort;
    }

    uniquePattern() {
        return DBModelKeys.RedisKey.OnlineKey + '-' + this.userId + '-' + this.socketId;
    }

    userIdPattern() {
        return DBModelKeys.RedisKey.OnlineKey + '-' + this.userId + '*';
    }
}

class UserManager {
    static getInstance() {
        if( Common.isNull(UserManager.instance) ) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    constructor() {
        this.userList = {};
    }

    addUser(user) {
        this.userList[user.socketId] = user;
    }

    delUser(socketId) {
        delete this.userList[socketId];
    }

    getUser(socketId) {
        return this.userList[socketId];
    }

    getUsers(cb) {
        Object.keys(this.userList).forEach((socketId) => {
            cb(socketId, this.userList[socketId]);
        });
    }
}
UserManager.instance = null;

module.exports = {
    User,
    UserManager
}