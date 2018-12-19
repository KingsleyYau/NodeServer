/*
* 在线用户管理类
* Author: Max.Chiu
* */

const Common = require('./common');
const Users = require('./users');

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

    addUser(user) {
        this.userManager.addUser(user);
    }

    delUser(socketId) {
        this.userManager.delUser(socketId);
    }

    getUser(socketId) {
        return this.userManager.getUser(socketId);
    }
}
OnlineUserManager.instance = null;

module.exports = {
    OnlineUserManager
}