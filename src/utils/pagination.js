import model from "../models/modular_model";
import { Op } from "sequelize";
const Sequelize = require("sequelize");

const pagination = {
  findPage: ({ name, select, page, limit, order, where, likes, keyword }) => new Promise(async (resolve, reject) => {
    try {
      const where_clause = typeof where == "string" ? Sequelize.literal(where) : where;
      const queries = {
        attributes: select,
        where: where_clause,
        order,
        offset: (page - 1) * limit,
        limit,
      };
      if (likes.length > 0) {
        queries.where = {
          [Op.and]: [
            where_clause,
            {
              [Op.or]: likes.map((item) => ({
                [item]: {
                  [Op.iLike]: `%${keyword}%`,
                },
              })),
            },
          ],
        };
      }
      const data = await model[name].findAndCountAll({
        ...queries
      })

      const totalPage = Math.ceil(data.count / limit);
      resolve({ list: data.rows, totalPage, totalItem: data.count, currentPage: page });
    } catch (e) {
      reject(e);
    }
  })
}

export default pagination;