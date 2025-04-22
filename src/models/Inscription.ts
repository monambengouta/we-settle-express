// models/Inscription.ts
import sequelize from '@/utils/sequelize';
import { DataTypes, Model } from 'sequelize';
import User from './User';

class Inscription extends Model {
    public id!: string;
    public user_id!: string;
    public name!: string;
    public lastname!: string;
    public email!: string;
    public validated!: boolean;
    public bearer_token!: string | null;
    public validation_date!: Date | null;
}

Inscription.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    validated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    bearer_token: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    validation_date: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'inscription',
    tableName: 'inscriptions',
    timestamps: true
});

export default Inscription;