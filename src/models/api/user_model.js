const Sequelize = require("sequelize");
import sq from "../../db";

class cari_user_view extends Sequelize.Model { }

cari_user_view.init({
  username: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  kode_grup: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nama_grup: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  aktif: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  }
}, {
  sequelize: sq,
  modelName: "cari_user",
  tableName: "cari_user",
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeFind: (options) => {
      options.attributes = ["username", "password", "kode_grup", "nama_grup", "aktif"];
    }
  }
});

export default cari_user_view;