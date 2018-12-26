/*
* 内部逻辑处理基类
* Author: Max.Chiu
* */

// 日志
const appLog = require('../../../../lib/app-log').AppLog.getInstance();
// 公共库
const Common = require('../../../../lib/common');

module.exports = class BaseHandler {
    constructor() {
        this.respond = {
            isKick:false,
            resData:{
                id:0,
                errno:0,
                errmsg:'',
                data:{}
            }
        }
    }

    static getRoute() {
        return '';
    }

    sendRespond(socket, reqData) {
        this.respond.resData.id = reqData.req_data.id;
        let json = JSON.stringify(this.respond.resData);
        appLog.log('im-server', 'error', '[' + socket.id + ']-BaseHandler.sendRespond, ' + json);
        socket.emit(this.constructor.getRoute(), this.respond.resData);
    }

    async handle(socket, reqData) {
        return await new Promise(function (resolve, reject) {
            appLog.log('im-server', 'info', '[' + socket.id + ']-BaseHandler.handle');
            reject('');
        }.bind(this));
    }
}