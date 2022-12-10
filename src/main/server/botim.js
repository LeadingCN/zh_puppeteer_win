

const REQ = require('request-promise-native')
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process'

//import { machineId, machineIdSync } from 'node-machine-id';
import path from 'path';

const fsp = require('fs').promises;
export default {

  async init(req, res) {

    //下面不能加'echo-protocol'，否则会报Can`t connect due to "Sec-WebSocket-Protocol header"的错。因为服务器没有返回对应协议规定的信息
    console.log('init', req.body);
    try {
      let result = {}
      return res.json(result)
    } catch (error) {
      return res.json(error.error)
    }
  },
}
async function decodeData(fun, binaryData, args) {
  return new Promise((resolve, reject) => {
    console.log(fun);
    let d = JSON.parse(JSON.stringify(binaryData)).data;
    let processargs = ['C:\\Users\\Administrator\\Documents\\test\\webpack.js', fun, JSON.stringify(d)]
    args.forEach(element => {
      processargs.push(element)
    });

    let subchild = spawn("node",
      processargs,
      { stdio: [null, null, null, "ipc"] }
    )
    subchild.stdout.on("data", async (data) => {
      resolve(data.toString());
    });

  }).catch((e) => {
    reject('error')
  });
}
