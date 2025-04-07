const express = require("express");
const router = express.Router();
const MiSa_Warehouse = require("../models/MiSa_Warehouse");
router.get("/detail", async (req, res) => {
    try {
        // const clientSecret = req.headers["clientsecret"];
        const {clientSecret} = req.query;
        console.log(clientSecret);
        // Tìm warehouse theo clientSecret
        const warehouse = await MiSa_Warehouse.findOne({ clientSecret });

        if (!warehouse) {
            return res.status(404).json({ message: "Không tìm thấy warehouse với clientSecret này" });
        }
        
        const item = warehouse;

        res.json(item); // Trả về chi tiết hàng hóa
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
