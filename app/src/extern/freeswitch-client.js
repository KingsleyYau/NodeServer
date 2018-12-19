// 日志
Log = require('../lib/log');
// 路由
const Server = require('freeswitch-esl').Server;

// 创建日志
let logger = Log.getLogger('Freeswitch');

let fsClient = function() {
    let client = new Server();

    let opts = {
        myevents : ['CUSTOM']
    };

    client.initialize(opts, () => {
        a = 1;
    });
}

module.exports = fsClient;