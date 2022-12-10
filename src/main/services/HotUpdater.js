/**
 * power by biuuu
 */

import { emptyDir, createWriteStream, readFile, copy, remove, mkdir } from 'fs-extra'
import { join, resolve } from 'path'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { app } from 'electron'
import { gt } from 'semver'
import { createHmac } from 'crypto'
import extract from 'extract-zip'
import { version, name } from '../../../package.json'
import { hotPublishConfig } from '../config/hotPublish'
import axios from 'axios'

const streamPipeline = promisify(pipeline)
const appPath = app.getAppPath()
console.log(appPath);
const updatePath = resolve(appPath, '..', '..', 'update')
const request = axios.create()

/**
 * @param data 文件流
 * @param type 类型，默认sha256
 * @param key 密钥，用于匹配计算结果
 * @returns {string} 计算结果
 * @author umbrella22
 * @date 2021-03-05
 */
function hash(data, type = 'sha256', key = 'Sky') {
    const hmac = createHmac(type, key)
    hmac.update(data)
    return hmac.digest('hex')
}


/**
 * @param url 下载地址
 * @param filePath 文件存放地址
 * @returns {void}
 * @author umbrella22
 * @date 2021-03-05
 */
async function download(url, filePath) {
    const res = await request({ url, responseType: "stream" })
    await streamPipeline(res.data, createWriteStream(filePath))
}

const updateInfo = {
    status: 'init',
    message: ''
}

/**
 * @param windows 指主窗口
 * @returns {void}
 * @author umbrella22
 * @date 2021-03-05
 */
export const updater = async (windows) => {
    try {
        console.log({ url: `${hotPublishConfig.url}/${hotPublishConfig.configName}?time=${new Date().getTime()}&appname=botim`, });
        const res = await request({ url: `${hotPublishConfig.url}/${hotPublishConfig.configName}?time=${new Date().getTime()}&appname=${name}`, })
        console.log(res.data.data, version);
        if (gt(res.data.data.version, version)) {
            await emptyDir(updatePath)
            const filePath = join(updatePath, res.data.data.name)
            updateInfo.status = 'downloading'
            if (windows) windows.webContents.send('hot-update-status', updateInfo);
            console.log(`开始下载, 本地路径 : ${filePath}, 下载地址 : ${hotPublishConfig.url}/${res.data.data.path}`);
            await download(`${hotPublishConfig.url}/${res.data.data.path}`, filePath);
            //const buffer = await readFile(filePath)
            //const sha256 = hash(buffer)
            //if (sha256 !== res.data.data.hash) throw new Error('sha256 error')
            //删除原文件
            updateInfo.status = 'remove'
            if (windows) windows.webContents.send('hot-update-status', updateInfo);
            await remove(join(`${appPath}`, 'dist'));
            await mkdir(join(`${appPath}`, 'dist'));
            // await remove(join(`${appPath}`, 'node_modules'));//不删除node_modules
            await remove(join(`${appPath}`, 'package.json'));
            const appPathTemp = join(updatePath, 'temp')
            updateInfo.status = 'extracting'
            if (windows) windows.webContents.send('hot-update-status', updateInfo);
            //fs.createReadStream(filePath).pipe(unzip.Extract({ path: appPath }));
            await extract(filePath, { dir: appPathTemp })//解压
            updateInfo.status = 'moving'
            if (windows) windows.webContents.send('hot-update-status', updateInfo);
            console.log("copying", appPathTemp, appPath);
            //await copy(appPathTemp, appPath)//复制
            await copy(join(appPathTemp, 'dist'), join(appPath, 'dist'))//复制dist
            await copy(join(appPathTemp, 'package.json'), join(appPath, 'package.json'))//复制package.json
            updateInfo.status = 'finished'
            if (windows) windows.webContents.send('hot-update-status', updateInfo);
        }


    } catch (error) {
        console.log('抛出', error);
        updateInfo.status = 'failed'
        updateInfo.message = error
        if (windows) windows.webContents.send('hot-update-status', updateInfo)
    }
}

export const getUpdateInfo = () => updateInfo