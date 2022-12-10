const request = require('request')
const fs = require('fs')
const fsp = require('fs').promises
const md5 = require('md5')
import { app, dialog } from 'electron'

export default {
    quit() {
        dialog.showErrorBox(
            '错误',
            '使用过期3秒后关闭软件'
        );
        setTimeout(() => {
            app.quit();
        }, 3000);
    },
    requestget(url, params, token = '') {
        let h = {
            "Content-Type": "application/json",
            "authorization": token
        }
        return new Promise((rel, rej) => {
            request({
                url: url,
                method: "GET",
                headers: h,
                params: params
            }, function (error, response, body) {
                console.log(error, body);
                body = JSON.parse(body);
                if (!error && body.statusCode == 200) {
                    if (body.message == '请求成功') {
                        rej(body.data)
                    } else {
                        rel('请求失败')
                    }

                } else {
                    console.log('失败主体', body);
                    rej(body)
                }
            });
        }).then(rel => {
            return rel
        }, rej => {
            return rej
        })
    },
    requestpost(url, data, token = '') {
        let h = {
            "Content-Type": "application/json",
            "authorization": token
        }
        return new Promise((rel, rej) => {
            console.log(url, data);
            request({
                url,
                method: "POST",
                headers: h,
                body: data
            }, function (error, response, body) {
                console.log(error);
                console.log(response);
                console.log(body);
                body = JSON.parse(body);
                if (!error && body.statusCode == 200) {
                    if (body.message == '请求成功') {
                        rej(body.data)
                    } else {
                        rel('请求失败')
                    }

                } else {
                    console.log('失败主体', body);
                    rej(body)
                }
            });
        }).then(rel => {
            return rel
        }, rej => {
            return rej
        })
    },
    deleteFolderRecursive(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    utils.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },
    /**
     * 
     * @param {*} path 判断指定路径文件或者文件夹是否存在
     */
    fileExist(path) {
        return new Promise((resolve, reject) => {
            fs.access(path, err => {
                if (err) {
                    // console.log('不存在'); //出错则不存在
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })
    },
    umd5(data) {
        return md5(data)
    },
    /**
     * 检查软件使用是否超时
     * @param {*} path 判断指定路径文件或者文件夹是否存在
     */
    checkOutTime() {
        app.quit()
    },
    hasUrl(urlList, url) {
        if (url.indexOf('?') > 0) {
            url = url.split('?')[0];
        }
        let flag = false;
        if (urlList.indexOf(url) >= 0) {
            flag = true;
        }
        return flag;
    },
    getPcMsg() {
        let interfaces = require('os').networkInterfaces()
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
        return pcMessage[0]
    }
}