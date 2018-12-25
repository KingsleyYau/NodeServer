/*
* 用户管理类
* Author: Max.Chiu
* */

// 公共库
const Common = require('./common');
// 日志
const appLog = require('./app-log').AppLog.getInstance();
// Model的Keys
const DBModelKeys = require('../model/model-keys');

class User {
    constructor(socketId, websocket, userId) {
        this.noticeId = 0;
        this.userId = userId;
        this.socketId = socketId;
        this.websocket = websocket;
    }

    key() {
        return DBModelKeys.RedisKey.OnlineKey + '-' + this.userId;
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