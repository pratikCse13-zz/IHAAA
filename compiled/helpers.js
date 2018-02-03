'use strict';

/**
 * import npm packages
 */

//formats the time provided to this format - HH.MM.SS
//if time is not provided then it creates one and formats in this format and returns
exports.getFormattedTimeForRedisKey = function (input) {
  var inputDate = input ? new Date(input) : new Date();
  return inputDate.getHours() + '-' + inputDate.getMinutes() + '-' + inputDate.getSeconds();
};
//# sourceMappingURL=helpers.js.map