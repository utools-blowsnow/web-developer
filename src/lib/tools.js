const paths = [
  '@/network-tools','@/tools'
];

const files = [];
files.push(require.context('@/network-tools',true,/\.vue$/));
files.push(require.context('@/tools',true,/\.vue$/));
const path = require("path");

const modules = {};
for(let file of files){
    file.keys().forEach(key => {
        const name = path.basename(key, ".vue");
        modules[name] = file(key).default || file(key);
    });
}

export default modules
