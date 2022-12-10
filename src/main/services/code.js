var crypto = require('crypto');
import { spawn, fork } from 'child_process'
const interfaces = require('os').networkInterfaces()
const encryptkey = '12345678',
  encryptiv = 'abcdefg'
export default {

  encrypt(plainText) {
    var cipher = crypto.createCipheriv('des-cbc', encryptkey, encryptiv);
    cipher.setAutoPadding(true);
    var encryptedText = cipher.update(plainText, 'utf8', 'base64');
    encryptedText += cipher.final('base64');
    return encryptedText;
  },
  decrypt(encryptedText) {
    var decipher = crypto.createDecipheriv('des-cbc', encryptkey, encryptiv);
    decipher.setAutoPadding(true);
    var plainText = decipher.update(encryptedText, 'base64', 'utf8');
    plainText += decipher.final('utf8');
    return plainText;
  },
  async getdieviceid() {
    let pcObj = {}
    let pcMessage = []
    for (let key in interfaces) {
      if (key.indexOf('WLAN') !== -1 || key.indexOf('无线网络连接') !== -1) {
        pcObj = interfaces[key]
        break
      } else if (key.indexOf('以太网') !== -1 || key.indexOf('本地连接') !== -1) {
        pcObj = interfaces[key]
      } else if (Object.keys(pcObj).length < 1) {
        pcObj = interfaces[key]
      }
    }
    pcMessage = pcObj.filter(item => {
      if (item.family === 'IPv4') {
        return item
      }
    })
    let mac = pcMessage[0].mac
    console.log(mac);
    return await new Promise((resolve, reject) => {
      spawn('wmic', ['csproduct', 'get', 'UUID']).stdout.on('data', (data) => {
        let uuid = data.toString().split('\n')[1].trim()
        resolve(uuid + '-' + mac)
      })
    })
  },
}