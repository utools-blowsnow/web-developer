const {ipcRenderer, remote, clipboard, shell, dialog} = require('electron')
// const { dialog } = remote
const fs = require('fs')
const path = require('path')
const process = require('process');


const dbname = "web-developer";
window.utils = {
    clipboard: {
        writeText: (text) => {
            clipboard.writeText(text)
        }
    },
    showDialog: (type, title, message, buttons, callback) => {
        dialog.showMessageBox({
            type: type,
            title: title,
            message: message,
            buttons: buttons
        }, callback);
    },
    showOpenDialog: () => {
        return dialog.showOpenDialog(remote.getCurrentWindow(), {
            filters: [{
                'name': '图片文件',
                extensions: ['jpg', 'png', 'gif', 'jpeg']
            }], properties: ['openFile']
        })
    },
    showMssage: (text, title = 'utools') => {
        notifier.notify(
            {
                title: title,
                subtitle: 'utools',
                message: text,
                sound: true,
                wait: true
            },
            function (err, response) {
                if (err) {
                    console.log(err)
                }
            }
        )
    },
    openExternal: shell.openExternal,
    readFile: (pathObj) => {
        var bitmap = fs.readFileSync(pathObj.path);
        var file = new File(bitmap, pathObj.name);
        console.log("readFile", bitmap, file)
        return file;
    },
    openDefaultBrowser: function (url) {
        var exec = require('child_process').exec;
        switch (process.platform) {
            case "darwin":
                exec('open ' + url);
                break;
            case "win32":
                exec('start ' + url);
                break;
            default:
                exec('xdg-open', [url]);
        }
    }
}

window.dbs = function (name, value = undefined) {
    let obj = utools.db.get(name);
    if (value !== undefined) {
        let putdata = {
            _id: name,
            data: value,
        }
        if (obj && obj._rev) {
            putdata._rev = obj._rev;
        }
        utools.db.put(putdata)
        return;
    }
    if (obj == null) return null;
    return obj.data;
}
window.db = {
    set: (name, data) => {
        window.dbs(name, data)
    },
    get: (name) => {
        return window.dbs(name);
    },
    push: (name, data) => {
        window.dbs(name, data);
    }
}

window.utils.task = class Task{
    constructor(callableEnd) {
        this.tasks = [];
        this.callableEnd = callableEnd || function () {};
    }

    push(taskFunc){
        this.tasks.push(taskFunc);
    }

    pop(){
        return this.tasks.pop();
    }

    start(pool=1000){
        for (let i = 0; i < pool; i++) {
            this.work();
        }
    }

    work(){
        let callable = this.pop();
        if(callable){
            callable();
        }else{
            this.callableEnd();
        }
        return callable;
    }

    next(){
       return this.work();
    }
}

window.utils.scan = (host, start = 1, end = 2000, timeout = 300, callback = () => {
}, callbackPort = () => {
}) => {
    var net = require('net');
    // 最大值
    if (start < 1) start = 1;
    if (end > 65535) end = 65535;
    var count = end - start;
    var result = [];
    console.log('port scan time');

    var task = new window.utils.task(function (){
        result.sort();
        callback(result);
    });

    var next = function (){
        task.next();
    }

    for (let i = start; i <= end; i++) {
        task.push(function (){
            console.log('port scan',i);

            var socket = net.connect({
                    host: host,
                    port: i
                },
                // 连接成功事件
                function () {
                    result.push(i);
                    callbackPort(i);
                    this.destroy();

                    // 继续任务
                    next();
                }
            );

            socket.setTimeout(timeout, function () {
                console.log('port scan timeout', i);
                this.destroy();
            });

            socket.on('error', function (err) {
                if (err.errno == 'ECONNREFUSED') {
                    this.destroy();
                }
            });

            socket.on('close', function (err) {
                next();
            });
        });
    }

    task.start(1000);
};

const command = require('./command/index.js');
const Traceroute = command.tracert;
const Ping = command.ping;
window.utils.tracert = new Traceroute();
window.utils.ping = new Ping();
window.utils.nslookup = new (command.nslookup)();
window.command = command;


