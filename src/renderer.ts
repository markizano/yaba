/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
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
import type { Configuration } from 'webpack';

//import './index.css';

// Import the styles and scripts from the assets folder.
// import './assets/css/reset.css';
// import './assets/css/main.css';

export const renderConfig: Configuration = {
    entry: {
        init: 'assets/js/init.js',
        controllers: 'assets/js/controllers.js',
        directives: 'assets/js/directives.js',
    }
};

console.log('👋 This message is being logged by "renderer.js", included via webpack');

// import './assets/css/reset.css';
// import './assets/css/main.css';
// import './yaba.ts';
