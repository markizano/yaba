import { app, BrowserWindow, net, protocol } from 'electron';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import { pathToFileURL } from 'url'
import * as path from 'path';
import * as fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      preload: path.resolve(MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  protocol.handle('file', (request): Response|Promise<Response> => {
    const filename = path.normalize(request.url.substring(7));    /* all urls start with 'file://' */
    console.error(`Request filename: ${filename}`);
    return net.fetch(pathToFileURL(path.join(__dirname, filename)).toString());
  });
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//handle crashes and kill events
process.on('uncaughtException', function(err) {
  //log the message and stack trace
  const errlog = `${new Date().toISOString()}: ${err}\n${err.stack}`;

  fs.appendFileSync('crash.log', errlog ); // dt + err + "\n" + err.stack);
  console.error(errlog);

  //do any cleanup like shutting down servers, etc

  //relaunch the app (if you want)
  // app.relaunch({args: []});
  app.exit(0);
});

process.on('SIGTERM', function() {
  // const fs = require('fs');
  console.error('Received SIGTERM -- quitting...');
  fs.writeFileSync('shutdown.log', "Received SIGTERM signal");

  //do any cleanup like shutting down servers, etc

  //relaunch the app (if you want)
  // app.relaunch({args: []});
  app.exit(254);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
