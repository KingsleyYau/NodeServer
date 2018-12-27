/*
* 项目公共库
* */

// 日志
const appLog = require('./app-log').AppLog.getInstance();

isNull = function(obj) {
    if( typeof(obj)!="undefined" && obj!=null ) {
        return false;
    }

    return true;
}

log = function(category, level, msg) {
    appLog.log(category, level, msg);
}

module.exports = {
    isNull,
    log
}