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
const RoomCloseNotice = require('../client/notice/roomclose-notice');
const SendMsgNotice = require('../client/notice/sendmsg-notice');

class Room {
    constructor(roomId) {
        this.roomId = roomId;
    }

    static roomListPattern() {
        return DBModelKeys.RedisKey.RoomKey.RoomIdKey + '-*';
    }

    uniquePattern() {
        return DBModelKeys.RedisKey.RoomKey.RoomIdKey + '-' + this.roomId;
    }

    memberPattern() {
        return DBModelKeys.RedisKey.RoomKey.RoomMemberKey + '-' + this.roomId;
    }

    descData() {
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
    * @param user 用户
    * */
    async addRoom(user) {
        return new Promise( async (resolve, reject) => {
            let room = null;
            let roomId = 0;

            redisClient.client.incr(DBModelKeys.RedisKey.RoomKey.RoomMaxIdKey, async (err, res) => {
                Common.log('im', 'info', '[' + user.userId + ']-RoomManager.addRoom, Incr RoomMaxIdKey, err: ' + err + ', res: ' + res);

                if( err == null ) {
                    if( res != null ) {
                        roomId = parseInt(res, 10);
                    }
                    room = new Room(roomId);

                    redisClient.client.hmset(room.uniquePattern(),
                        DBModelKeys.RedisKey.RoomKey.RoomIdKey, roomId,
                        async (err, res) => {
                        Common.log('im', 'warn', '[' + user.userId + ']-RoomManager.addRoom, [创建直播间], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);

                        resolve({room:room, err:err});
                    });

                } else {
                    // 出错
                    resolve({room:room, err:err});
                }
            });
        });
    }

    /*
    * 关闭直播间
    * @param user 用户
    * @param roomId 直播间Id
    * */
    async delRoom(user, roomId) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);

            // 判断是否存在直播间
            redisClient.client.keys(room.uniquePattern(), async (err, res) => {
                Common.log('im', 'info', '[' + user.userId + ']-RoomManager.delRoom, [查找直播间], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
                if( !err && res.length > 0 )  {
                    let multi = redisClient.client.multi();

                    // 通知直播间成员直播间关闭
                    multi.smembers(room.memberPattern(), async (err, res) => {
                        Common.log('im', 'debug', '[' + user.userId + ']-RoomManager.delRoom, [通知直播间成员直播间关闭], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);

                        if (!err) {
                            // 通知其他用户, 有用户进入直播间
                            for (let i = 0; i < res.length; i++) {
                                let toUserId = res[i];
                                let sender = new NoticeSender();
                                let notice = new RoomCloseNotice(roomId);
                                sender.send(toUserId, notice);
                            }
                        }
                    });

                    // 删除直播间成员
                    multi.del(room.memberPattern(), async (err, res) => {
                        Common.log('im', 'debug', '[' + user.userId + ']-RoomManager.delRoom, [删除直播间成员], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
                    });

                    // 删除直播间
                    multi.del(room.uniquePattern(), async (err, res) => {
                        Common.log('im', 'debug', '[' + user.userId + ']-RoomManager.delRoom, [删除直播间Key], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
                    });

                    multi.exec( async (err, res) => {
                        Common.log('im', 'warn', '[' + user.userId + ']-RoomManager.delRoom, [关闭直播间], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
                        resolve({room:room, err:err});
                    });
                } else {
                    Common.log('im', 'warn', '[' + user.userId + ']-RoomManager.delRoom, [直播间不存在], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
                    resolve({room:room, err:'live room is not exist.'});
                }
            });
        });
    }

    // /*
    // * 获取直播间
    // * @param roomId 直播间Id
    // * */
    // async getRoom(user, roomId) {
    //     return new Promise( async (resolve, reject) => {
    //         let room = new Room(roomId);
    //         redisClient.client.hgetall(room.uniquePattern(), async (err, res) => {
    //             Common.log('im', 'info', '[' + user.userId  + ']-RoomManager.getRoom, ' + roomId + ', err: ' + err + ', res: ' + res);
    //             resolve({room:room, err:err});
    //         });
    //     });
    // }

    /*
    * 直播间广播
    * @param user 用户
    * @param roomId 直播间Id
    * @param msg 消息内容
    * */
    async broadcast(user, roomId, msg) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);

            redisClient.client.keys(room.uniquePattern(), async (err, res) => {
                if ( !err && res.length > 0 ) {
                    redisClient.client.smembers(room.memberPattern(), async (err, res) => {
                        Common.log('im', 'warn', '[' + user.userId + ']-RoomManager.broadcast, [直播间广播], roomId: ' + roomId + ', msg: ' + msg + ', err: ' + err + ', res: ' + res);

                        if (!err) {
                            // 通知其他用户, 有用户进入直播间
                            for (let i = 0; i < res.length; i++) {
                                let toUserId = res[i];
                                let sender = new NoticeSender();
                                let notice = new SendMsgNotice(user.userId, toUserId.userId, msg);
                                sender.send(toUserId, notice);
                            }
                        }

                        resolve({room:room, err:err});
                    });
                } else {
                    Common.log('im', 'warn', '[' + user.userId + ']-RoomManager.addRoomUser, [直播间不存在], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
                    resolve({room:room, err:'live room is not exist.'});
                }
            });
        });
    }

    /*
    * 获取直播间列表
    * @param user 用户
    * */
    async getRoomList(user) {
        return new Promise( async (resolve, reject) => {
            redisClient.client.keys(Room.roomListPattern(), async (err, res) => {
                Common.log('im', 'info', '[' + user.userId  + ']-RoomManager.getRoomList, [获取直播间列表], err: ' + err + ', res: ' + res);

                let roomList = [];
                for (let i = 0; i < res.length; i++) {
                    let roomIdKey = res[i];
                    await new Promise(async (resolve, reject) => {
                        redisClient.client.hget(roomIdKey, DBModelKeys.RedisKey.RoomKey.RoomIdKey, async (err, res) => {
                            if( !err && !Common.isNull(res) ) {
                                let room = new Room(res);
                                roomList.push(res);
                                resolve(room);
                            }
                        });
                    });
                }
                resolve({roomList:roomList, err:err});
            });
        });
    }

    /*
    * 增加直播间用户
    * @param user 用户
    * @param roomId 直播间Id
    * */
    async addRoomUser(user, roomId) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);

            // 判断是否存在直播间
            redisClient.client.keys(room.uniquePattern(), async (err, res) => {
                Common.log('im', 'info', '[' + user.userId + ']-RoomManager.addRoomUser, [查找直播间], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);

                if( !err ) {
                    if( res.length > 0 ) {
                        redisClient.client.smembers(room.memberPattern(), async (err, res) => {
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
                                Common.log('im', 'warn', '[' + user.userId  + ']-RoomManager.addRoomUser, [用户进入直播间], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
                                resolve({room:room, err:err});
                            });
                        });

                    } else {
                        Common.log('im', 'warn', '[' + user.userId + ']-RoomManager.addRoomUser, [直播间不存在], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
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
    * @param user 用户
    * @param roomId 直播间Id
    * */
    async delRoomUser(user, roomId) {
        return new Promise( async (resolve, reject) => {
            let room = new Room(roomId);
            redisClient.client.smembers(room.memberPattern(), async (err, res) => {
                Common.log('im', 'info', '[' + user.userId  + ']-RoomManager.delRoomUser, roomId: ' + roomId + ', err: ' + err + ', res: ' + res);

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
                    Common.log('im', 'warn', '[' + user.userId  + ']-RoomManager.delRoomUser, [用户退出直播间], roomId: ' + roomId + ', err: ' + err + ', res: ' + res);
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