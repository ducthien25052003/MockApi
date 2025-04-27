const express = require("express");
const mongoose = require("mongoose");
const Sales = require("../models/MiSa_SalesSchema");
const SaleItems = require("../models/MiSa_SaleItemsSchema");
const MiSa_GoodsSchema = require("../models/MiSa_GoodsSchema");
const MiSa_Warehouse = require("../models/MiSa_Warehouse");
const MiSa_SalesSchema = require("../models/MiSa_SalesSchema");

const router = express.Router();

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
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Không tìm thấy warehouse tương ứng với clientSecret" });
        }

        const { sale_items, ...salesData } = req.body;

        // ✅ Gán warehouse_id vào đơn hàng
        salesData.warehouse_id = warehouse._id;

        // ✅ Tạo đơn hàng (Sales)
        const newSale = new Sales(salesData);
        const savedSale = await newSale.save({ session });

        const saleItemsDocs = [];

        for (const item of sale_items) {
            // ✅ Tìm sản phẩm theo Code
            const good = await MiSa_GoodsSchema.findOne({ Code: item.Code });
            if (!good) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Không tìm thấy sản phẩm với mã Code: ${item.Code}` });
            }

            saleItemsDocs.push({
                Good: good._id,
                Quantity: item.Quantity,
                Sale: savedSale._id
            });
        }
        console.log(saleItemsDocs);
        const createdSaleItems = await SaleItems.insertMany(saleItemsDocs, { session });

        savedSale.sale_items = createdSaleItems.map(item => item._id);
        await savedSale.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Tạo đơn hàng thành công!",
            sale: savedSale,
            sale_items: createdSaleItems
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
    }
});

// PUT /sales/:id/status
router.put("/:id/status", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const sale = await MiSa_SalesSchema.findById(id).session(session);

        if (!sale) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // Đảo ngược trạng thái hiện tại của `status`
        sale.status = !sale.status;
        await sale.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ 
            message: "Đã cập nhật trạng thái thành công", 
            newStatus: sale.status,
            sale 
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
    }
});

module.exports = router;
