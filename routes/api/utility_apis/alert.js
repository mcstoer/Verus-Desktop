const { dialog } = require("../utils/dialog-shim");

module.exports = (api, mainWindow) => {
  api.alertMainWindow = (messageBoxParams, callback) => {
    return dialog.showMessageBox(mainWindow, messageBoxParams, callback)
  }

  return api;
};