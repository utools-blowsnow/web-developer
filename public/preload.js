const { ipcRenderer, remote, clipboard, shell } = require('electron')
const { dialog } = remote
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
  showDialog: (type,title,message,buttons,callback) => {
    dialog.showMessageBox({
    type: type,
    title: title,
    message: message,
    buttons: buttons
	},callback);
  },
  showOpenDialog: () => {
    return dialog.showOpenDialog(remote.getCurrentWindow(), { filters: [{ 'name': '图片文件', extensions: ['jpg', 'png', 'gif', 'jpeg'] }], properties: ['openFile'] })
  },
  showMssage:(text,title='utools')=>{
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
  readFile:(pathObj)=>{
	  var bitmap = fs.readFileSync(pathObj.path);
	  var file = new File(bitmap,pathObj.name);
	  console.log("readFile",bitmap,file)
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

window.db = {
	set:(name,data)=>{
		var myName = dbname+"_"+name;
		utools.db.remove(myName)
		utools.db.put({
			_id: myName,
			data: data
		})
	},
	get:(name)=>{
		var myName = dbname+"_"+name;
		var datas = utools.db.get(myName);
		console.log("window.db.get", datas);
		if (datas === null || datas===undefined){
			datas = {data: null};
		}
		return datas.data;
	},
	push:(name,data)=>{
		var myName = dbname+"_"+name;
		var datas = window.db.get(name);
		datas.push(data);
		utools.db.remove(myName)
		utools.db.put({
			_id: myName,
			data: datas
		})
		console.log("window.db.put", datas);
	}
}


window.utils.scan = (host, start=1, end=2000, timeout = 3000, callback=()=>{},callbackPort=()=>{})=>{
  var net = require('net');
  var count = end - start;
  var result = [];
  console.time('port scan time');

  for (var i = start; i <= end; i++) {
    var item = net.connect({
          host: host,
          port: i
        },
        function(i) {
          return function() {
            result.push(i);
            callbackPort(i);
            this.destroy();
          };
        }(i)
    );
    item.setTimeout(timeout, function() {
      this.destroy();
    });

    item.on('error', function(err) {
      if (err.errno == 'ECONNREFUSED') {
        this.destroy();
      }
    });

    item.on('close', function() {
      if (!count--) {
        console.timeEnd('port scan time');
        callback(result);
      }
    });
  }
};

const command  = require('./command/index.js');
const Traceroute = command.tracert;
const Ping = command.ping;
console.log(Traceroute);
window.utils.tracert = new Traceroute();
window.utils.ping = new Ping();
window.utils.nslookup = new (command.nslookup)();


window.dbs = function(name,value=undefined){
    let obj = utools.db.get(name);
    if (value !== undefined){
        let putdata = {
            _id: name,
            data: value,
        }
        if (obj._rev){
            putdata._rev = obj._rev;
        }
        return;
    }
    return obj.data;
}
