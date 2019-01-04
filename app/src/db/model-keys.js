/*
* 数据持久Keys
* Author: Max.Chiu
* */

const DBModelKeys = {
    RedisKey:{
        OnlineKey:'OnlineKey',
        UserKey:{
            SocketIdKey:'SocketIdKey',
            UserIdKey:'UserIdKey',
            ConnectTimeKey:'ConnectTimeKey',
            LoginTimeKey:'LoginTimeKey',
            ServerHostKey:'ServerHostKey',
            ServerPortKey:'ServerPortKey',
        },
        RoomKey:{
            RoomMaxIdKey:'RoomMaxIdKey',
            RoomIdKey:'RoomIdKey',
            RoomMemberKey:'RoomMemberKey',
        }
    }
}

module.exports = DBModelKeys;