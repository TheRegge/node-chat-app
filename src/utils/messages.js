/**
 * Generate a well-formatted message object.
 * 
 * @param {string} username - The username of the client message issuer
 * @param {string} text - The message string
 * @return {object} message - a well formated message object
 * @return {string} message.username - The message issuer username
 * @return {string} message.text - The body of the message
 * @return {int} message.createdAt - Timestamp at time of message generation
 */
const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  };
};

/**
 * Generate a well-formatted location message object.
 * 
 * @param {string} username The username of the client message issuer
 * @param {object} coords - The geo coordinates
 * @param {int} coords.latitude - The latitude
 * @param {int} coords.longitude - The longitude
 */
const generateLocationMessage = (username, coords) => {
  return {
    username,
    url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};
