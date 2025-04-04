const express = require("express");
const router = express.Router();
const MiSa_WarehouseGoods = require("../models/MiSa_WarehouseGoods");
const MiSa_Warehouse = require("../models/MiSa_Warehouse");
const MiSa_GoodsSchema = require("../models/MiSa_GoodsSchema");

// Lấy danh sách hàng hóa theo warehouseId
router.get("/", async (req, res) => {
    try {
        const clientSecret = req.headers["clientsecret"]; // ✅ lấy từ query: ?clientSecret=abc123
        console.log(clientSecret);
        let filter = {};

        // Nếu có clientSecret thì tìm warehouse_id tương ứng
        if (clientSecret) {
            const warehouse = await MiSa_Warehouse.findOne({ clientSecret });

            if (!warehouse) {
                return res.status(404).json({ message: "Không tìm thấy warehouse với clientSecret này" });
            }

            filter.warehouse = warehouse._id;
        }

        const items = await MiSa_WarehouseGoods.find(filter).populate("goods");
        res.json(items); // ✅ Trả về danh sách hàng hóa
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/detail", async (req, res) => {
    try {
        const {  goodCode } = req.query; // Lấy clientSecret và goodCode từ query: ?clientSecret=abc123&goodCode=XYZ123
        const clientSecret = req.headers["clientsecret"];
        // Tìm warehouse theo clientSecret
        const warehouse = await MiSa_Warehouse.findOne({ clientSecret });

        if (!warehouse) {
            return res.status(404).json({ message: "Không tìm thấy warehouse với clientSecret này" });
        }
         // Tìm warehouse theo clientSecret
         const good = await MiSa_GoodsSchema.findOne({ Code:goodCode });

         if (!good) {
             return res.status(404).json({ message: "Không tìm thấy Good với code này" });
         }
        // Tìm warehouse goods theo warehouseId và code của good
        const item = await MiSa_WarehouseGoods.findOne({
            warehouse: warehouse._id,
            goods: good._id
        }).populate("goods");

        if (!item) {
            return res.status(404).json({ message: "Không tìm thấy hàng hóa với mã này trong kho" });
        }

        res.json(item); // Trả về chi tiết hàng hóa
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Thêm hàng hóa vào kho
router.post("/", async (req, res) => {
    try {
        const { warehouse, goods, quantity } = req.body;

        // Kiểm tra warehouse & goods có hợp lệ không
        if (!warehouse || !mongoose.Types.ObjectId.isValid(warehouse)) {
            return res.status(400).json({ error: "warehouseId không hợp lệ" });
        }
        if (!goods || !mongoose.Types.ObjectId.isValid(goods)) {
            return res.status(400).json({ error: "goodsId không hợp lệ" });
        }
        if (!quantity || quantity < 0) {
            return res.status(400).json({ error: "Số lượng không hợp lệ" });
        }

        const newItem = new MiSa_WarehouseGoods({ warehouse, goods, quantity });
        await newItem.save();

        res.status(201).json({ message: "Thêm hàng hóa thành công", data: newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cập nhật số lượng hàng hóa theo id
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID không hợp lệ" });
        }

        const updatedItem = await MiSa_WarehouseGoods.findByIdAndUpdate(
            id,
            { quantity },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: "Không tìm thấy hàng hóa để cập nhật" });
        }

        res.json({ message: "Cập nhật thành công", data: updatedItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Xóa hàng hóa theo id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID không hợp lệ" });
        }

        const deletedItem = await MiSa_WarehouseGoods.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ error: "Không tìm thấy hàng hóa để xóa" });
        }

        res.json({ message: "Xóa thành công", data: deletedItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
