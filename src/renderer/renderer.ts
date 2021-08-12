/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docsmainWindow/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import './index.css';
import fs from 'fs';
import os from "os";
import {ipcRenderer} from "electron";

const systemType = os.type();
let file = "";
const textContainer:HTMLTextAreaElement = document.querySelector(".textContainer");
const textTitle = document.querySelector(".textTitle");

textContainer.addEventListener('drop',(ev:DragEvent) => {
    ev.preventDefault();// 取消默认事件
    ev.stopPropagation();// 阻止冒泡事件
    const fileList = ev.dataTransfer.files;
    if (fileList.length === 1) {
        fs.readFile(`${fileList[0].path}`,(err,data) => {
            if (err) {
                console.log(err);
            } else {
                file = fileList[0].path;
                textTitle.innerHTML = fileList[0].name;
                textContainer.innerHTML = "";
                textContainer.innerHTML = `${data}`;
            }
        })
    }else {
        alert("每次只能打开一个文件。")
    }
})
textContainer.addEventListener('dragover', (ev)=>{
    ev.preventDefault();// 取消默认事件
    ev.stopPropagation();// 阻止冒泡事件
})

document.addEventListener('keydown', (ev:KeyboardEvent) => {
    if ((systemType === "Darwin" && ev.metaKey === true && ev.code === "KeyS") || (systemType === ("Linux" || "Window_NT") && ev.ctrlKey === true && ev.code === "KeyS")) {
        fs.writeFile(file, textContainer.value, function (err) {
            if (err) return console.error(err);
        })
    }
})

// console.log('👋 This message is being logged by "renderer.js", included via webpack');
