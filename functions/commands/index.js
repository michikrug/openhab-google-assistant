/// <reference path="../../typedefs.js" />
const glob = require('glob');

const Commands = {};

glob.sync('./!(index).js', { cwd: __dirname }).forEach((file) => {
  const command = require(file);
  Commands[command.name.toLowerCase()] = command;
});

module.exports = {
  /**
   * @param {string} command
   * @param {ExecuteIntentCommandExecutionParams} params
   */
  getCommandType: (command, params) => {
    const commandName = command.split('.')[3].toLowerCase();
    if (commandName in Commands) {
      const commandType = new Commands[commandName](params);
      if (commandType.hasValidParams) {
        return Commands[commandName];
      }
    }
  }
};
