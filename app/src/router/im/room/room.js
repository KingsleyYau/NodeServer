/*
* 房间管理类
* Author: Max.Chiu
* */

// 公共库
const Common = require('../../../lib/common');
const Users = require('../../../lib/users');

// 直播间推送类
const RoomInNotice = require('../notice/roomin-notice');
const RoomOutNotice = require('../notice/roomout-notice');

class Room {
    constructor(roomId) {
        this.roomId = roomId;
        this.userManager = new Users.UserManager();
    }

    addUser(user) {
        this.userManager.addUser(user);

        // 通知其他用户，有人进入
        let notice = new RoomInNotice(user);
        this.broadcast(notice);
    }

    delUser(user) {
        // 删除直播间用户
        this.userManager.delUser(user.socketId);

        // 通知其他用户，有人退出
        let notice = new RoomOutNotice(user);
        this.broadcast(notice);
    }

    broadcast(notice) {
        this.userManager.getUsers( (socketId, toUser) => {
            notice.send(toUser);
        });
    }

    getData() {
        let data = {
            roomId:this.roomId
        }
        return data;
    }

}

class RoomManager {
    static getInstance() {
        if( Common.isNull(RoomManager.instance) ) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    constructor() {
        this.roomList = {};
        this.roomId = 0;
    }

    addRoom() {
        let room = new Room(this.roomId++);
        this.roomList[room.roomId] = room;
        return room;
    }

    delRoom(roomId) {
        delete this.roomList[roomId];
    }

    getRoom(roomId) {
        return this.roomList[roomId];
    }

    delUser(user) {
        Object.keys(this.roomList).forEach((roomId) => {
            let room = this.roomList[roomId];
            room.delUser(user);
        });
    }
}
RoomManager.instance = null;

module.exports = {
    Room,
    RoomManager
}