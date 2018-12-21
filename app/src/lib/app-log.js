const io = require('socket.io-client');
const jsonParser = require('socket.io-json-parser');

// 公共库
const Common = require('./common');

class AppLog {
    static getInstance() {
        if( Common.isNull(AppLog.instance) ) {
            AppLog.instance = new AppLog();
        }
        return AppLog.instance;
    }

    constructor() {
        this.client = io('ws://127.0.0.1:9875', {
            parser:jsonParser
        });
    }

    log(category, level, msg) {
        try {
            this.client.emit('log', {
                pid:process.pid,
                category:category,
                level:level,
                msg:msg
            });
        } catch (e) {
            console.log("AppLog-client err: " + e);
        }

    }
}

AppLog.instance = null;

module.exports = {
    AppLog
}