// models/User.ts
import sequelize from '@/utils/sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

interface UserAttributes {
    user_id: string;
    email: string;
    password: string;
    firstName?: string,
    lastName?: string,
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public user_id!: string;
    public email!: string;
    public firstName?: string;
    public lastName?: string;
    public password!: string;
}

User.init({
    user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'user',
    tableName: 'users',
    timestamps: true,
});



export default User;