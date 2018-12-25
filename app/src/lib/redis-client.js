/*
* redis管理类
* Author: Max.Chiu
* */

// Reids库
const Redis = require("redis");

// 日志
const appLog = require('./app-log').AppLog.getInstance();
// 公共库
const Common = require('./common');

// 数据库配置
const DBConfig = require('../config/db-config');

class RedisClient {
    static getInstance() {
        if( Common.isNull(RedisClient.instance) ) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    constructor() {
        appLog.log('common', 'warn', 'Redis.start, ' + DBConfig.redis.host + ':' + DBConfig.redis.port);

        this.client = Redis.createClient(DBConfig.redis.port, DBConfig.redis.host);

        this.client.on("ready", () => {
            appLog.log('common', 'warn', 'Redis.ready');
        });

        this.client.on("connect", () => {
            appLog.log('common', 'warn', 'Redis.connect');
        });

        this.client.on("reconnecting", () => {
            appLog.log('common', 'warn', 'Redis.reconnecting');
        });

        this.client.on("error", (err) => {
            appLog.log('common', 'error', 'Redis.err, ' + err);
        });

        this.client.on("end", () => {
            appLog.log('common', 'warn', 'Redis.end');
        });

        this.client.on("warning", () => {
            appLog.log('common', 'warn', 'Redis.warning');
        });
    }
}

RedisClient.instance = null;

module.exports = {
    RedisClient
}