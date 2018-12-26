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
        }
    }
}

module.exports = DBModelKeys;