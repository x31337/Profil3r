const attach = require('../lib/attach.js');

const filters = {
  messaging: [require('./user_init.js')],

  postback: [require('./postback.js')],

  message: [require('./type_cast.js'), require('./quick_reply.js')]
};

module.exports = attach.bind(null, filters);
