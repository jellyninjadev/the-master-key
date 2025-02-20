const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 1024
    })

    mainWindow.loadFile('The Master Key.html')
}

app.whenReady().then(() => {
    createWindow()
})


