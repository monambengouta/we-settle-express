'use strict';
//
const { v4: uuidv4 } = require('uuid');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get the first user
      const [users] = await queryInterface.sequelize.query(
        'SELECT user_id FROM users LIMIT 1'
      );

      if (!users || users.length === 0) {
        throw new Error('No users found in database');
      }

      const userId = users[0].user_id;

      await queryInterface.bulkInsert('inscriptions', [
        {
          id: uuidv4(),
          user_id: userId,
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          validated: false,
          bearer_token: null,
          validation_date: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          user_id: userId,
          name: 'Jane',
          lastname: 'Smith',
          email: 'jane.smith@example.com',
          validated: false,
          bearer_token: null,
          validation_date: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
    } catch (error) {
      console.error('Error in inscription seed:', error);
      throw error;

    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('inscriptions', null, {});
  }
};
