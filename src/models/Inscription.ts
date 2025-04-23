// models/Inscription.ts
import sequelize from "@/utils/sequelize";
import { DataTypes, Model, type Optional } from "sequelize";
import User from "./User";

interface InscriptionAttributes {
    id: string;
    user_id: string;
    name: string;
    lastname: string;
    email: string;
    validated: boolean;
    bearer_token: string | null;
    validation_date: Date | null;
}

interface InscriptionCreationAttributes extends Optional<InscriptionAttributes, "id"> { }

class Inscription extends Model<InscriptionAttributes, InscriptionCreationAttributes>
    implements InscriptionAttributes {
    public id!: string;
    public user_id!: string;
    public name!: string;
    public lastname!: string;
    public email!: string;
    public validated!: boolean;
    public bearer_token!: string | null;
    public validation_date!: Date | null;

    // Association type
    public readonly user?: User;
}

Inscription.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'user_id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            },
        },
        validated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        bearer_token: {
            type: DataTypes.TEXT, // Changed from STRING to TEXT for JWT tokens
            allowNull: true,
        },
        validation_date: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: "inscription",
        tableName: "inscriptions",
        timestamps: true,
    }
);

// Define associations
Inscription.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'user_id', // Make sure this matches User's primary key
    as: 'user'
});

export default Inscription;