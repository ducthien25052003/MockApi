const express = require("express");
const router = express.Router();
const KiotViet_ProductBranch = require("../models/KiotViet_ProductBranch");
const KiotViet_Product = require("../models/KiotViet_Product");
const KiotViet_Branch = require("../models/KiotViet_Branch");
const KiotViet_Warehouse = require("../models/KiotViet_Warehouse");

// Lấy danh sách hàng hóa theo warehouseId
router.get("/", async (req, res) => {
    try {
        const retailerId = req.headers["retailerid"]; // ✅ lấy từ query: ?clientSecret=abc123
        console.log(retailerId);
        let filter = {};

        // Nếu có clientSecret thì tìm warehouse_id tương ứng
        if (retailerId) {
            const branch = await KiotViet_Branch.findOne({ retailerId });

            if (!branch) {
                return res.status(404).json({ message: "Không tìm thấy branch với retailerId này" });
            }

            filter.branchId = branch._id;
        }

        const items = await KiotViet_ProductBranch.find(filter).populate("productId");
        res.json(items); // ✅ Trả về danh sách hàng hóa
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/detail", async (req, res) => {
    try {
        const {  productCode } = req.query; // Lấy clientSecret và goodCode từ query: ?clientSecret=abc123&goodCode=XYZ123
        const retailerId = req.headers["retailerid"];
        // Tìm warehouse theo clientSecret
        const branch = await KiotViet_Branch.findOne({ retailerId });

        if (!branch) {
            return res.status(404).json({ message: "Không tìm thấy branch với retailerId này" });
        }
         // Tìm warehouse theo clientSecret
         const product = await KiotViet_Product.findOne({ code:productCode });

         if (!product) {
             return res.status(404).json({ message: "Không tìm thấy Product với code này" });
         }
        // Tìm warehouse goods theo warehouseId và code của good
        const item = await KiotViet_ProductBranch.findOne({
            branchId: branch._id,
            productId: product._id
        }).populate("productId");

        if (!item) {
            return res.status(404).json({ message: "Không tìm thấy hàng hóa với mã này trong kho" });
        }

        res.json(item); // Trả về chi tiết hàng hóa
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Thêm hàng hóa vào kho
// router.post("/", async (req, res) => {
//     try {
//         const { productId, branchId, quantity } = req.body;

//         // Kiểm tra warehouse & goods có hợp lệ không
//         if (!product || !mongoose.Types.ObjectId.isValid(product)) {
//             return res.status(400).json({ error: "product không hợp lệ" });
//         }
//         if (!branch || !mongoose.Types.ObjectId.isValid(branch)) {
//             return res.status(400).json({ error: "branch không hợp lệ" });
//         }
//         if (!quantity || quantity < 0) {
//             return res.status(400).json({ error: "Số lượng không hợp lệ" });
//         }

//         const newItem = new KiotViet_ProductBranch({ productId, branchId, quantity });
//         await newItem.save();

//         res.status(201).json({ message: "Thêm hàng hóa thành công", data: newItem });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Cập nhật số lượng hàng hóa theo id
// router.put("/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { quantity } = req.body;

//         // Kiểm tra ID có hợp lệ không
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ error: "ID không hợp lệ" });
//         }

//         const updatedItem = await MiSa_WarehouseGoods.findByIdAndUpdate(
//             id,
//             { quantity },
//             { new: true, runValidators: true }
//         );

//         if (!updatedItem) {
//             return res.status(404).json({ error: "Không tìm thấy hàng hóa để cập nhật" });
//         }

//         res.json({ message: "Cập nhật thành công", data: updatedItem });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Xóa hàng hóa theo id
// router.delete("/:id", async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Kiểm tra ID có hợp lệ không
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ error: "ID không hợp lệ" });
//         }

//         const deletedItem = await MiSa_WarehouseGoods.findByIdAndDelete(id);

//         if (!deletedItem) {
//             return res.status(404).json({ error: "Không tìm thấy hàng hóa để xóa" });
//         }

//         res.json({ message: "Xóa thành công", data: deletedItem });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
module.exports = router;
