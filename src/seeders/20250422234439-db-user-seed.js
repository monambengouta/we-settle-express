'use strict';
const { email } = require('envalid');
//
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      user_id: uuidv4(),
      password: 'password123',
      email: "john@mail.com",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
