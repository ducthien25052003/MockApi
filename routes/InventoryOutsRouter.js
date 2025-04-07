const express = require("express");
const mongoose = require("mongoose");
const InventoryOuts = require("../models/MiSa_InventoryOutsSchema");
const InventoryOutItems = require("../models/MiSa_InventoryOutItemsSchema");
const MiSa_Warehouse = require("../models/MiSa_Warehouse");
const MiSa_GoodsSchema = require("../models/MiSa_GoodsSchema");
const MiSa_WarehouseGoods = require("../models/MiSa_WarehouseGoods");

const router = express.Router();

/** 
 * ✅ Thêm mới phiếu xuất kho + mặt hàng xuất kho 
 * URL: POST /inventory-outs
 */
router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { clientsecret } = req.headers;

        if (!clientsecret) {
            return res.status(400).json({ message: "Thiếu clientSecret trong header" });
        }

        // ✅ Tìm warehouse theo clientSecret
        const warehouse = await MiSa_Warehouse.findOne({ clientSecret: clientsecret });
        if (!warehouse) {
            return res.status(404).json({ message: "Không tìm thấy warehouse tương ứng với clientSecret" });
        }

        const { inventory_out_items, ...inventoryOutData } = req.body;

        // ✅ Gán warehouse_id vào inventoryOut
        inventoryOutData.warehouse_id = warehouse._id;

        const inventoryItemsDocs = [];

        for (const item of inventory_out_items) {
            // ✅ Tìm goods theo Code và warehouse_id
            const good = await MiSa_GoodsSchema.findOne({ Code: item.Code });

            if (!good) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Không tìm thấy sản phẩm với mã Code: ${item.Code}` });
            }            
            inventoryItemsDocs.push({
                Good_id: good._id,
                Quantity: item.Quantity,
                Status: item.Status,
                Inventory_out: null // gán sau
            });
        }

        // ✅ Tạo InventoryOut
        const newInventoryOut = new InventoryOuts(inventoryOutData);
        const savedInventoryOut = await newInventoryOut.save({ session });

        // ✅ Gán Inventory_out cho từng item
        inventoryItemsDocs.forEach(item => item.Inventory_out = savedInventoryOut._id);

        // ✅ Lưu danh sách mặt hàng
        const createdItems = await InventoryOutItems.insertMany(inventoryItemsDocs, { session });
        // ✅ Trừ hàng tồn kho trong bảng WarehouseGoods
        for (const item of inventoryItemsDocs) {
            const { Good_id, Quantity } = item;

            const warehouseGood = await MiSa_WarehouseGoods.findOne({
                warehouse: warehouse._id,
                goods: Good_id
            }).session(session);
            console.log(warehouseGood);
            if (!warehouseGood) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Không tìm thấy hàng tồn trong kho với sản phẩm: ${Good_id}` });
            }

            // Trừ số lượng tồn kho
            if (warehouseGood.quantity < Quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Không đủ số lượng trong kho cho sản phẩm: ${Good_id}` });
            }

            warehouseGood.quantity -= Quantity;

            await warehouseGood.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Tạo phiếu xuất kho thành công!",
            inventory_out: savedInventoryOut,
            inventory_out_items: createdItems
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Lỗi khi tạo phiếu xuất kho", error: error.message });
    }
});

module.exports = router;
