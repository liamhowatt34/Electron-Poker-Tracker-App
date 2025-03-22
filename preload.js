const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    /** SESSION HANDLING **/
    saveSession: (session) => {
        ipcRenderer.send("save-session", session);
    },
    onSessionSaved: (callback) => {
        ipcRenderer.on("session-saved", (_, data) => {
            callback(data);
        });
    },

    /** FETCHING SESSIONS **/
    getSessions: () => {
        ipcRenderer.send("get-sessions");
    },
    onSessionsReceived: (callback) => {
        ipcRenderer.on("sessions-data", (_, data) => {
            callback(data);
        });
    },

    /** FETCHING AGGREGATE DATA **/
    getAggregateData: () => {
        ipcRenderer.send("get-aggregate");
    },
    onAggregateReceived: (callback) => {
        ipcRenderer.on("aggregate-data", (_, data) => {
            callback(data);
        });
    },

    deleteSession: (id) => ipcRenderer.send("delete-session", id),
    onSessionDeleted: (callback) => ipcRenderer.on("session-deleted", (_, data) => callback(data))

});
