import pagination from "../../utils/pagination";

const main = {
  index: async (req, res) => {
    try {
      const { body } = req;
      const where = JSON.parse(body.where) || body.where;
      const data = await pagination.findPage({ name: body.name, select: JSON.parse(body.select), page: parseInt(body.page), limit: parseInt(body.limit), order: JSON.parse(body.order), where, likes: JSON.parse(body.likes), keyword: body.keyword });

      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default main;
