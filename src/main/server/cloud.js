
var apihost = 'http://bt.leading.ren:3000/'
const REQ = require('request-promise-native')
const md5 = require('md5')
import u from './utils'
//import { machineId, machineIdSync } from 'node-machine-id';
import path from 'path';
const fsp = require('fs').promises;
export default {

  async login(req, res) {
    console.log('login', req.body, apihost + req.url);
    try {
      let body = req.body
      body.password = md5(body.password)
      console.log(body);
      let result = await REQ.post(apihost + req.url, { body: body, json: true })
      console.log(result);
      return res.json(result)
    } catch (error) {
      return res.json(error.error)
    }
  },
}