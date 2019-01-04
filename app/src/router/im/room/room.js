/*
* 房间管理类
* Author: Max.Chiu
* */

// 公共库
const Common = require('../../../lib/common');
// 用户
const Users = require('../../../user/users');
// Redis
const redisClient = require('../../../lib/redis-connector').RedisConnector.getInstance();
// Model的Keys
const DBModelKeys = require('../../../db/model-keys');

// 直播间推送类
const NoticeSender = require('../client/notice-sender/notice-sender');
const RoomInNotice = require('../client/notice/roomin-notice');
const RoomOutNotice = require('../client/notice/roomout-notice');

class Room {
    constructor(roomId) {
        this.roomId = roomId;
    }

    /*
    * 用户进入直播间
    * */
    addUser(userId) {
        // 增加直播间用户

        // 通知其他用户，有人进入
        let notice = new RoomInNotice(user);
        this.broadcast(notice);
    }

    /*
    * 用户退出直播间
    * */
    delUser(userId) {
        // 删除直播间用户

        // 通知其他用户，有人退出
        let notice = new RoomOutNotice(user);
        this.broadcast(notice);
    }

    /*
    * 直播间广播
    * */
    broadcast(notice) {
        // this.userManager.getUsers( (socketId, toUser) => {
        //     notice.send(toUser);
        // });
    }

    static roomIdPattern() {
        return DBModelKeys.RedisKey.RoomKey.RoomIdKey + '-*';
    }

    uniquePattern() {
        return DBModelKeys.RedisKey.RoomKey.RoomIdKey + '-' + this.roomId;
    }

    memberPattern() {
        return DBModelKeys.RedisKey.RoomKey.RoomMemberKey + '-' + this.roomId;
    }

    /*
    * 获取房间结构体
    * */
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

    /*
    * 增加直播间
    * */
    async addRoom(user) {
        return new Promise( async (resolve, reject) => {
            redisClient.client.incr(DBModelKeys.RedisKey.RoomKey.RoomMaxIdKey, async (err, res) => {
                Common.log('im', 'info', '[' + user.userId + ']-RoomManager.addRoom, Incr RoomMaxIdKey, err: ' + err + ', res: ' + res);

                let room = null;
                if( err == null ) {
                    let roomId = 0;
                    if( res != null ) {
                        roomId = parseInt(res, 10);
                    }
                    room = new Room(roomId);

                    redisClient.client.hmset(room.uniquePattern(),
                        DBModelKeys.RedisKey.RoomKey.RoomIdKey, roomId,
                        async (err, res) => {
                        Common.log('im', 'warn', '[' + user.userId + ']-RoomManager.addRoom, ' + roomId + ', err: ' + err + ', res: ' + res);

                        resolve(room, err);
                    });

                } else {
                    // 出错
                    resolve(room, err);
                }
            });
        });
    }

    /*
    * 删除直播间
    * @param roomId 直播间Id
    * */
    async delRoom(roomId) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);
            redisClient.client.del(room.uniquePattern(), async (err, res) => {
                Common.log('im', 'warn', 'RoomManager.delRoom, ' + roomId + ', err: ' + err + ', res: ' + res);
                resolve(room, err);
            });
        });
    }

    /*
    * 获取直播间
    * @param roomId 直播间Id
    * */
    async getRoom(user, roomId) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);
            redisClient.client.hget(room.uniquePattern(), async (err, res) => {
                Common.log('im', 'info', '[' + user.userId  + ']-RoomManager.getRoom, ' + roomId + ', err: ' + err + ', res: ' + res);
                resolve({room:room, err:err});
            });
        });
    }

    /*
    * 增加直播间用户
    * */
    async addRoomUser(user, roomId) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);

            // 判断是否存在直播间
            redisClient.client.keys(room.uniquePattern(), async (err, res) => {
                if( !err ) {
                    if( res.length > 0 ) {
                        redisClient.client.smembers(room.memberPattern(), async (err, res) => {
                            Common.log('im', 'info', '[' + user.userId + ']-RoomManager.addRoomUser, ' + roomId + ', err: ' + err + ', res: ' + res);

                            if (!err) {
                                // 通知其他用户, 有用户进入直播间
                                for (let i = 0; i < res.length; i++) {
                                    let toUserId = res[i];
                                    if (toUserId != user.userId) {
                                        let sender = new NoticeSender();
                                        let notice = new RoomInNotice(user.userId);
                                        sender.send(toUserId, notice);
                                    }
                                }
                            }

                            redisClient.client.sadd(room.memberPattern(), user.userId, async (err, res) => {
                                Common.log('im', 'warn', '[' + user.userId  + ']-RoomManager.addRoomUser, ' + roomId + ', err: ' + err + ', res: ' + res);
                                resolve({room:room, err:err});
                            });
                        });

                    } else {
                        resolve({room:room, err:'live room is not exist.'});
                    }
                } else {
                    resolve({room:room, err:err});
                }
            });
        });
    }

    /*
    * 删除直播间用户
    * */
    async delRoomUser(user, roomId) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);
            redisClient.client.smembers(room.memberPattern(), async (err, res) => {
                Common.log('im', 'info', '[' + user.userId  + ']-RoomManager.delRoomUser, ' + roomId + ', err: ' + err + ', res: ' + res);

                if( !err ) {
                    // 通知其他用户, 有用户退出直播间
                    for(let i = 0; i < res.length; i++) {
                        let toUserId = res[i];
                        if( toUserId != user.userId ) {
                            let sender = new NoticeSender();
                            let notice = new RoomOutNotice(user.userId);
                            sender.send(toUserId, notice);
                        }
                    }
                }

                // 真正删除直播间用户
                redisClient.client.srem(room.memberPattern(), user.userId, async (err, res) => {
                    Common.log('im', 'warn', '[' + user.userId  + ']-RoomManager.delRoomUser, ' + roomId + ', err: ' + err + ', res: ' + res);
                    resolve({room:room, err:err});
                });

            });
        });
    }
}
RoomManager.instance = null;

module.exports = {
    Room,
    RoomManager
}