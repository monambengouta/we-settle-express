'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Process users table
    await this.processTable(queryInterface, Sequelize, 'users', now);

    // Process inscriptions table
    await this.processTable(queryInterface, Sequelize, 'inscriptions', now);
  },

  async down(queryInterface, Sequelize) {
    // Revert users table
    await this.revertTable(queryInterface, Sequelize, 'users');

    // Revert inscriptions table
    await this.revertTable(queryInterface, Sequelize, 'inscriptions');
  },

  // Helper method to process each table
  async processTable(queryInterface, Sequelize, tableName, now) {
    // Add new columns allowing NULL temporarily
    await queryInterface.addColumn(tableName, 'createdAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn(tableName, 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Set default values for existing records
    await queryInterface.sequelize.query(
      `UPDATE "${tableName}" SET "createdAt" = :now, "updatedAt" = :now`,
      { replacements: { now } }
    );

    // Change columns to NOT NULL
    await queryInterface.changeColumn(tableName, 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn(tableName, 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Remove old timestamp columns if they exist
    const tableDescription = await queryInterface.describeTable(tableName);
    if (tableDescription.createdAt) {
      await queryInterface.removeColumn(tableName, 'createdAt');
    }
    if (tableDescription.updatedAt) {
      await queryInterface.removeColumn(tableName, 'updatedAt');
    }
  },

  // Helper method to revert each table
  async revertTable(queryInterface, Sequelize, tableName) {
    // Add back old columns allowing NULL temporarily
    await queryInterface.addColumn(tableName, 'createdAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn(tableName, 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Copy values from new columns to old ones
    await queryInterface.sequelize.query(`
      UPDATE "${tableName}" 
      SET "createdAt" = "createdAt", 
          "updatedAt" = "updatedAt"
    `);

    // Change old columns to NOT NULL
    await queryInterface.changeColumn(tableName, 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn(tableName, 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Remove the new columns
    await queryInterface.removeColumn(tableName, 'createdAt');
    await queryInterface.removeColumn(tableName, 'updatedAt');
  }
};