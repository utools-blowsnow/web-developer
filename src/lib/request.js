import axios from 'axios'
import Qs from 'qs'

const request = async function (url,params= false,action=''){
    let res = {};

    if (action === ""){
        if (params===false) action = "get";
        else action = "post";
    }

    if (action === 'get'){
        res = await axios.get(url)
    }else{
        res = await axios.post(url,Qs.stringify(params));
    }
    return res.data;
}
export default request
