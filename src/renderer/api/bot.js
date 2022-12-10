
let webpack = require('./webpack.js')
var d = qiao(4);
var g = d.h.lookupType('WebRpcMessage'),
    x = d.h.lookupType('WebLoginPrepareInfoPB'),
    b = d.h.lookupType('WebLoginTokenInfoPB'),
    C = d.h.lookupType('WebLoginQrCodePB'),
    A = d.h.lookupType('WebLoginUserInfoPB');



var LoginObj = {
    '_MsgNtf': function (param) {
        var v = qiao(145);

        var msg = d.h.lookupType('WebNotifyPB'),
            C = d.h.lookupType('MessageNtfPB'),
            A = d.h.lookupType('DeleteMsgNtfPB');
        var t = msg.decode(param);
        //console.log(JSON.stringify(t))
        t.data = C.toObject(C.decode(t.data)),
            t.data = Object(v.a)(t.data),
            1003 === t.data.sessiontype && (t.data.data = A.toObject(A.decode(t.data.data)),
                t.data.data = Object(v.a)(t.data.data));

        //console.log(JSON.stringify(t.data))
        if (t.data.data.text) {
            console.log("msgData|" + JSON.stringify(t.data.data.text))
        }
        var obj = t.data
        if (t.notifyUuid) {
            obj = Object.assign(obj, {
                notifyUuid: t.notifyUuid
            })
        }
        return obj
    },
    '_loginKey': function (param) {
        return x.decode(param)
    },
    '_LoginUserNtf': function (param) {
        return A.decode(param)
    },
    '_LoginTokenNtf': function (param) {
        return b.decode(param)
    }
};

function decodeSession(session) {
    var g = d.h.lookupType('WebP2pSessionInfoPB')
        , f = d.h.lookupType('WebGroupSessionInfoPB');
    var obj = {
        P2P: [],
        GROUP: []
    }
    session = session.map(function (e) {
        if (e.type === 1) {
            var t = g.decode(e.sessionInfo);
            e.sessionInfo = g.toObject(t)
            obj.P2P.push(e.sessionInfo)
        } else if (e.type === 2) {
            var i = f.decode(e.sessionInfo);
            e.sessionInfo = f.toObject(i)
            obj.GROUP.push(e.sessionInfo)
        }

        //console.log(JSON.stringify(e.sessionInfo))
        //arr.push(e.sessionInfo)
        return e
    })

    return obj
}
function decodeNotify(notify) {
    var g = d.h.lookupType('MessageNtfPB');
    var p = qiao(145);
    var arr = []
    notify = notify.map(function (e) {
        var t = g.toObject(g.decode(e.data));
        e.data = Object(p.a)(t)
        arr.push({
            notifyUuid: e.notifyUuid,
            data: e.data
        })
        return e
    })
    return arr
}
function decodeData(arr, bool) {
    var dec, i;
    var a = new Uint8Array(arr);
    var ret = g.decode(a);
    if (bool) {
        return JSON.stringify(ret)
    }
    var m = ret.method;
    if (m == 'LoginFinishNtf') {
        return m + "|" + JSON.stringify(ret)
    }
    console.log("Decode|" + JSON.stringify(ret))
    var t = '_' + m;
    if ('_pong' == t) {
        return JSON.stringify(ret)
    }
    else if (LoginObj[t]) {
        ret = LoginObj[t](ret.param)
    }
    else {
        //console.log(ret.method);
        type = m.split('.')[1]
        type = type.slice(0, 1).toUpperCase() + type.slice(1)
        console.log(type);
        if (type == 'SendP2P') {
            type = 'SendP2PMessage'
        }
        if (type == 'AckReceiveds') {
            type = 'AckReceivedsP2POffMessage'
        }
        if (ret.seq == 0) {
            i = type + 'Request'
        } else {
            i = type + 'Response'
        }
        //console.log(i);
        dec = d.h.lookupType(i);
        ret = dec.decode(ret.param)

        if (m == 'websession.getWebSessionList') {
            //console.log(JSON.stringify(ret.session))
            ret = decodeSession(ret.session)
        }
        else if (m == 'webnotifyproxy.syncWebNotify') {
            ret = decodeNotify(ret.notify)
        }
    }
    return m + "|" + JSON.stringify(ret)

}

function decodeData_bs64(base64, bool) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    var dec, i;
    var a = bytes;
    var ret = g.decode(a);
    if (bool) {
        return JSON.stringify(ret)
    }
    var m = ret.method;
    if (m == 'LoginFinishNtf') {
        return m + "|" + JSON.stringify(ret)
    }
    console.log("Decode|" + JSON.stringify(ret))
    var t = '_' + m;
    if ('_pong' == t) {
        return JSON.stringify(ret)
    }
    else if (LoginObj[t]) {
        ret = LoginObj[t](ret.param)
    }
    else {
        //console.log(ret.method);
        type = m.split('.')[1]
        type = type.slice(0, 1).toUpperCase() + type.slice(1)
        console.log(type);
        if (type == 'SendP2P') {
            type = 'SendP2PMessage'
        }
        if (type == 'AckReceiveds') {
            type = 'AckReceivedsP2POffMessage'
        }
        if (ret.seq == 0) {
            i = type + 'Request'
        } else {
            i = type + 'Response'
        }
        //console.log(i);
        dec = d.h.lookupType(i);
        ret = dec.decode(ret.param)
        if (m == 'websession.getWebSessionList') {
            //window.sss = JSON.stringify(ret)
            //console.log(JSON.stringify(ret.session))
            ret = decodeSession(ret.session)
        }
        else if (m == 'webnotifyproxy.syncWebNotify') {
            ret = decodeNotify(ret.notify)
        }
    }
    return m + "|" + JSON.stringify(ret)

}

function GetUserInfo(uid) {
    var enc = d.h.lookupType('WebGetUserInfoRequest')
    var uni = g.encode(g.create({
        method: "weblogin.webGetUserInfo",
        type: 0,
        seq: 1,
        param: enc.encode(enc.create({
            uid: new String(uid)
        })).finish()
    })).finish();
    var arr = [];
    for (var index = 0; index < uni.length; index++) {
        arr.push(uni[index])
    };
    return JSON.stringify(arr)
}


function getUid(touid) {
    var enc = d.h.lookupType('SendP2PMessageRequest');
    var data = enc.encode(enc.create({
        touid: touid
    })).finish()
    data = enc.decode(data)
    return data.touid
}

function decodeMsg(msg) {
    var enc = d.h.lookupType('SendP2PMessageRequest');
    var data = enc.encode(enc.create(msg)).finish()
    data = enc.decode(data)
    return JSON.stringify(data)
}


function Pack(type, method, seq, param) {
    var enc = d.h.lookupType(type)
    var uni = g.encode(g.create({
        method: method,
        type: 0,
        seq: seq,
        param: enc.encode(enc.create(param)).finish()
    })).finish();
    var arr = [];
    for (var index = 0; index < uni.length; index++) {
        arr.push(uni[index])
    };
    return JSON.stringify(arr)
}

function Pack_Send_text(type, method, seq, uid, touid, text) {
    var enc = d.h.lookupType(type);
    var data = d.i.newBuffer(d.i.utf8.length(text));
    d.i.utf8.write(text, data, 0);
    if (type == 'SendP2PMessageRequest') {
        var uni = g.encode(g.create({
            method: method,
            type: 0,
            seq: seq,
            param: enc.encode(enc.create({
                uid: uid,
                touid: touid,
                type: 2,
                msgid: new Date().getTime(),
                data: data
            })).finish()
        })).finish();
    }
    if (type == 'SendGroupMessageRequest') {
        var uni = g.encode(g.create({
            method: method,
            type: 0,
            seq: seq,
            param: enc.encode(enc.create({
                uid: uid,
                gid: touid,
                type: 2,
                msgid: new Date().getTime(),
                data: data
            })).finish()
        })).finish();
    }

    var arr = [];
    for (var index = 0; index < uni.length; index++) {
        arr.push(uni[index])
    };
    return JSON.stringify(arr)
}

function Pack_Send_pic(type, method, seq, uid, touid, picObj) {
    var enc = d.h.lookupType(type);
    var p = qiao(254);
    var i = Object(p.a)(3)
    var data = i.encode(i.create(picObj)).finish();
    if (type == 'SendP2PMessageRequest') {
        var uni = g.encode(g.create({
            method: method,
            type: 0,
            seq: seq,
            param: enc.encode(enc.create({
                uid: uid,
                touid: touid,
                type: 3,
                msgid: new Date().getTime(),
                data: data,
                msgsrvtime: new Date().getTime()
            })).finish()
        })).finish();
    }
    if (type == 'SendGroupMessageRequest') {
        var uni = g.encode(g.create({
            method: method,
            type: 0,
            seq: seq,
            param: enc.encode(enc.create({
                uid: uid,
                gid: touid,
                type: 3,
                msgid: new Date().getTime(),
                data: data
            })).finish()
        })).finish();
    }

    var arr = [];
    for (var index = 0; index < uni.length; index++) {
        arr.push(uni[index])
    };
    return JSON.stringify(arr)
}


function dePack_Send_test(arr) {
    var a = new Uint8Array(arr);
    var dec = d.h.lookupType('SendP2PMessageRequest')
    var data = dec.decode(a)
    return JSON.stringify(data)
}

function dePack(arr) {
    var ret = decodeData(arr, true);
    ret = JSON.parse(ret);
    var type = ret.method;
    type = type.split('.')[1]
    type = type.slice(0, 1).toUpperCase() + type.slice(1)
    if (type == 'AckReceiveds') {
        type = 'AckReceivedsP2POffMessage'
    }
    if (type == 'SendP2P') {
        type = 'SendP2PMessage'
    }
    type = type + 'Request'
    var base64 = ret.param;
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    var dec = d.h.lookupType(type);
    var data = dec.decode(bytes)
    ret = Object.assign(ret, {
        param: data
    })
    return JSON.stringify(ret)
}

function dePack_bs64(base64) {
    var ret = decodeData_bs64(base64, true);
    ret = JSON.parse(ret);
    var type = ret.method;
    type = type.split('.')[1]
    type = type.slice(0, 1).toUpperCase() + type.slice(1)
    if (type == 'AckReceiveds') {
        type = 'AckReceivedsP2POffMessage'
    }
    if (type == 'SendP2P') {
        type = 'SendP2PMessage'
    }
    type = type + 'Request'
    base64 = ret.param;
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    var dec = d.h.lookupType(type);
    var data = dec.decode(bytes)
    ret = Object.assign(ret, {
        param: data
    })
    return JSON.stringify(ret)
}





function getQrcode(loginKey) {
    var r = C.encode(C.create({
        loginKey: loginKey
    })).finish();
    return d.i.base64.encode(r, 0, r.length)
}


function getPing() {
    var uni = g.encode(g.create({
        type: 0,
        seq: new Date().getTime(),
        method: 'ping'
    })).finish();
    var arr = [];
    for (var index = 0; index < uni.length; index++) {
        arr.push(uni[index])
    };
    return JSON.stringify(arr)
}


function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
    var arr = new Array(bytes)
    return arr;
}

function _base64ToArr(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    var arr = new Array(bytes)
    return arr;
}


function hexStringToArray(str) {
    var pos = 0;
    var len = str.length;
    if (len % 2 != 0) {
        return null;
    }
    len /= 2;
    var arrBytes = new Array();
    for (var i = 0; i < len; i++) {
        var s = str.substr(pos, 2);
        s = parseInt(s, 16)
        arrBytes.push(s);
        pos += 2;
    }
    return arrBytes;
}

function ArrayTohexString(arr) {
    var hex_arr = []
    var tmp = '';
    for (let i = 0; i < arr.length; i++) {
        tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = '0' + tmp
        }
        hex_arr.push(tmp)
    }
    return hex_arr.join('')
}