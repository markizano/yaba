// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge } = require('electron');
import JSZip from 'jszip';
const FileSaver = require('jszip/vendor/FileSaver');

contextBridge.exposeInMainWorld('JSZip', JSZip);
contextBridge.exposeInMainWorld('FileSaver', FileSaver);
