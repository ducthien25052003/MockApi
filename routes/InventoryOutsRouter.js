const express = require("express");
const mongoose = require("mongoose");
const InventoryOuts = require("../models/MiSa_InventoryOutsSchema");
const InventoryOutItems = require("../models/MiSa_InventoryOutItemsSchema");

const router = express.Router();

/** 
 * ✅ Thêm mới phiếu xuất kho + mặt hàng xuất kho 
 * URL: POST /inventory-outs
 */
router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction(); // Bắt đầu transaction

    try {
        const { inventory_out_items, ...inventoryOutData } = req.body;

        // ✅ Bước 1: Tạo phiếu xuất kho trước
        const newInventoryOut = new InventoryOuts(inventoryOutData);
        const savedInventoryOut = await newInventoryOut.save({ session });
        // ✅ Bước 2: Tạo danh sách InventoryOutItems liên kết với InventoryOut vừa tạo
        console.log(inventory_out_items);
        const inventoryItemsDocs = inventory_out_items.map(item => ({
            ...item,
            Inventory_out: savedInventoryOut._id // Gán ID của InventoryOut
        }));

        const createdItems = await InventoryOutItems.insertMany(inventoryItemsDocs, { session });

        // ✅ Bước 3: Hoàn tất transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Tạo phiếu xuất kho thành công!",
            inventory_out: savedInventoryOut,
            inventory_out_items: createdItems
        });
    } catch (error) {
        await session.abortTransaction(); // Rollback nếu có lỗi
        session.endSession();
        res.status(400).json({ message: "Lỗi khi tạo phiếu xuất kho", error });
    }
});

module.exports = router;
