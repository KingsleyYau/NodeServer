/*
* 房间管理类
* Author: Max.Chiu
* */

// 公共库
const Common = require('../../../lib/common');
const Users = require('../../../lib/users');

class Room {
    constructor(roomId) {
        this.roomId = roomId;
        this.userManager = new Users.UserManager();
    }

    addUser(user) {
        this.userManager.addUser(user);
    }

    delUser(socketId) {
        this.userManager.delUser(socketId);
    }

    getData() {
        let data = {
            roomid:this.roomId
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
        this.roomList[roomId] = null;
    }

    getRoom(roomId) {
        return this.roomList[roomId];
    }
}
RoomManager.instance = null;

module.exports = {
    Room,
    RoomManager
}