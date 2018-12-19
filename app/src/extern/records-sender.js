const http = require('http');
const querystring = require('querystring');
const Log = require('../lib/log');

// 创建日志
let logger = Log.getLogger('recordsSender');

module.exports = class RecordSender {
    constructor() {
    }

    async sendRecord(url, filepath) {
        return await new Promise(function (resolve, reject) {
            let postData = querystring.stringify({
                userId:'',
                startTime:'',
                endTime:'',
                fileName:'',
            });

            let options = {
                hostname:'www.baidu.com',
                port:80,
                path:'/',
                method:'GET',
                auth:'test:5179'
            }

            var req = http.request(options, function(res) {
                res.setEncoding('utf-8');

                let data = [];
                res.on('data', (chunk) => {
                    data.push(Buffer.from(chunk));
                });
                res.on('end', () => {
                    let buf = Buffer.concat(data);
                    let body = buf.toString();
                    resolve(body);
                });
            });

            req.on('error', function(err) {
                logger.error(err);
                reject(err);
            });

            req.end();
        });
    }
}