// 日志管理类
log4js = require('log4js');
log4js.configure({
    appenders: {
        dateFile: { type: 'dateFile', filename: 'log/server', pattern: '-yyyy-MM-dd.log', alwaysIncludePattern: true },
        console: { type: 'console' }
    },
    categories: { default: { appenders: ['dateFile', 'console'], level: 'debug' } },
    replaceConsole: true
});

exports.getLogger = function(category) {
    return log4js.getLogger(category);
}
