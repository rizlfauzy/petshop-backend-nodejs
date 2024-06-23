const sidebar = {
  index: async (req, res) => {
    try {
      return res.status(200).json({
        message: "dapat data sidebar",
        error: false,
        data: {
          myusername: req.user.myusername,
          mygrup: req.user.mygrup,
          mycabang: req.user.mycabang,
          tglawal_periode: req.user.tglawal_periode,
          tglakhir_periode: req.user.tglakhir_periode,
          oto_menu: req.user.oto_menu,
          oto_report: req.user.oto_report,
          cek_menu: req.user.cek_menu,
          grup_menu: req.user.grup_menu,
        },
      });
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  }
}

export default sidebar;