const { DataTypes } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define("pokemon", {
    id: {
      type: DataTypes.UUID, //IDENTIFICADOR UNICO, EVITA COLICIONES
      defaultValue: DataTypes.UUIDV4, //generador de UUID basado en la versión 4 del estándar UUID.
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING, //tiene un limite
      allowNull: false,
      unique: true, // evito que haya dos nombres iguales de pokemon
    },
    img: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hp: {
      type: DataTypes.INTEGER,
      defaultValue: '50' //corregir para que no sea string
    },
    attack: {
      type: DataTypes.INTEGER,
      defaultValue: '50'
    },
    defense: {
      type: DataTypes.INTEGER,
      defaultValue: '50'
    },
    speed: {
      type: DataTypes.INTEGER,
      defaultValue: '50'
    },
    height: {
      type: DataTypes.INTEGER,
      defaultValue: '50'
    },
    weight: {
      type: DataTypes.INTEGER,
      defaultValue: '50'
    },
    createdInDb: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: false, 
    freezeTableName: true,
  }
  );
};
