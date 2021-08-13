import './index.css';
import fs from 'fs';
import os from "os";
import {ipcRenderer} from "electron";

const systemType = os.type();
let file = "";
let oldBuffer:Buffer;
let newBuffer:Buffer;
const container:HTMLDivElement = document.querySelector(".container");
const textContainer:HTMLTextAreaElement = document.querySelector(".textContainer");
const textTitle = document.querySelector(".textTitle");

/**
 * 编辑文件
 * @param fileList
 * @param data
 */
function openFile(fileList: FileList, data: Buffer): void {
    oldBuffer = data;
    newBuffer = data;
    file = fileList[0].path;
    textContainer.value = `${data}`;
    console.log(data);
    textTitle.innerHTML = fileList[0].name;
}
/**
 * 保存文件
 * @param filePath
 * @param value
 */
function saveFile(filePath:string, value:string): boolean {
    let res = true;
    fs.writeFile(filePath, value, function (err) {
        if (err !== null) {
            console.error(err);
            res = false;
        }
    })
    return res;
}
ipcRenderer.on('save-option-request',(event, args) => {
    if (oldBuffer === newBuffer) {
        ipcRenderer.send('save-option-respond',false);
    }else {
        ipcRenderer.send('save-option-respond',true);
    }
})
ipcRenderer.on('exit-save-request',(event, args) => {
    const res:boolean = saveFile(file, textContainer.value);
    ipcRenderer.send('exit-save-respond',res);
})


container.addEventListener('drop',(evt:DragEvent) => {
    evt.preventDefault();// 取消默认事件
    evt.stopPropagation();// 阻止冒泡事件
    const fileList = evt.dataTransfer.files;
    if (fileList.length === 1) {
        fs.readFile(`${fileList[0].path}`,(err,data) => {
            if (err) return;
            if (oldBuffer === undefined){
                openFile(fileList,data);
            } else {
                if (oldBuffer !== newBuffer) {
                    ipcRenderer.send('save-request');
                    ipcRenderer.on('save-respond',(event, args) => {
                        if (args){
                            saveFile(file,textContainer.value);
                        }
                        openFile(fileList,data);
                    })
                } else {
                    openFile(fileList,data);
                }
            }
        })
    }else {
        alert("每次只能打开一个文件。")
    }
})
container.addEventListener('dragover', (evt)=>{
    evt.preventDefault();// 取消默认事件
    evt.stopPropagation();// 阻止冒泡事件
})

/**
 * 输入监听
 * @event input
 */
textContainer.addEventListener('input', evt => {
    newBuffer = new Buffer(textContainer.value);
})

/**
 * 保存
 * @event keydown
 */
document.addEventListener('keydown', (evt:KeyboardEvent) => {
    if ((systemType === "Darwin" && evt.metaKey === true && evt.code === "KeyS") ||
        (systemType === ("Linux" || "Window_NT") && evt.ctrlKey === true && evt.code === "KeyS")) {
        if (saveFile(file, textContainer.value)) {
            console.log("saved!");
        }else {
            alert("保存失败");
        }
    }
})

// console.log('👋 This message is being logged by "renderer.js", included via webpack');
