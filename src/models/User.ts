// models/User.ts
import sequelize from '@/utils/sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

interface UserAttributes {
    user_id: string;
    password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public user_id!: string;
    public password!: string;

    // Timestamps (if you want them)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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