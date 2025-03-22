const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { insertSession, getSessions, getAggregateData, deleteSession } = require("./database");

let mainWindow;

app.whenReady().then(() => {

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'assets', 'poker-chips.ico'),
    webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        sandbox: false,
        nodeIntegration: false,  
        contextIsolation: true, 
        enableRemoteModule: false
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => {
      mainWindow = null;
  });
});

ipcMain.on("save-session", (event, session) => {
  insertSession(session.date, session.stakes, session.buyIn, session.cashOut, session.hours, (err, result) => {
      if (err) {
          console.error("[Database] Error saving session:", err);
          event.reply("session-saved", { success: false, error: err.message });
      } else {
          event.reply("session-saved", { success: true, session: result });
      }
  });
});

ipcMain.on("get-sessions", (event) => {
  getSessions((err, sessions) => {
      if (err) {
          console.error("[Database] Error fetching sessions:", err);
          event.reply("sessions-data", { success: false, error: err.message });
      } else {
          event.reply("sessions-data", { success: true, sessions });
      }
  });
});

ipcMain.on("get-aggregate", (event) => {
  getAggregateData((err, data) => {
      if (err) {
          console.error("[Database] Error fetching aggregate data:", err);
          event.reply("aggregate-data", { success: false, error: err.message });
      } else {
          event.reply("aggregate-data", { success: true, data });
      }
  });
});

ipcMain.on("delete-session", (event, sessionId) => {

    deleteSession(sessionId, (err) => {
        if (err) {
            console.error("[Main] Error deleting session:", err.message);
            event.reply("session-deleted", { success: false, error: err.message });
        } else {
            console.log("[Main] Session deleted successfully.");
            event.reply("session-deleted", { success: true });
        }
    });
});
