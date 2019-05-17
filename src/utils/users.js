/**
 * --------------------------------------------
 *
 * Utility functions to deal with user data
 *
 * --------------------------------------------
 */

// List of active users
const users = [];

/**
 * Add a user to the list of users
 * with validation.
 *
 * @param {object} user - The user object
 * @param {int} user.id - The user id (The socket.io connection id)
 * @param {string} user.username - The username
 * @param {string} user.room - The room the user has joined
 *
 * @returns {object} A user object or error object if validation fails
 */
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data:
  if (!username || !room) {
    return {
      error: "Username and room are required."
    };
  }

  // Check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use"
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

/**
 * Remove a user from the users array
 *
 * @param {int} id - The socketio connection id
 * @returns {array} The updated users array
 */
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

/**
 * Find an active user by id
 *
 * @param {int} id - A user id (socket.io connection id)
 * @returns {object} The user object if found or undefined
 */
const getUser = id => {
  return users.find(user => user.id === id);
};

/**
 * Find all users in a room
 *
 * @param {string} room - The name of the room in which we search users
 */
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
