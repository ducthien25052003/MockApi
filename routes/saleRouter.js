const express = require("express");
const mongoose = require("mongoose");
const Sales = require("../models/MiSa_SalesSchema");
const SaleItems = require("../models/MiSa_SaleItemsSchema");

const router = express.Router();

router.post("/", async (req, res) => {
    const session = await mongoose.startSession(); // Bắt đầu transaction
    session.startTransaction();

    try {
        // ✅ Bước 1: Tạo đơn hàng (Sales) trước
        const { sale_items, ...salesData } = req.body;
        const newSale = new Sales(salesData);
        const savedSale = await newSale.save({ session });

        // ✅ Bước 2: Tạo SaleItems, liên kết với Sales vừa tạo
        const saleItemsDocs = sale_items.map(item => ({
            ...item,
            Sale: savedSale._id // Gán Sale ID vào từng SaleItem
        }));
        const createdSaleItems = await SaleItems.insertMany(saleItemsDocs, { session });

        // ✅ Bước 3: Cập nhật lại danh sách sale_items trong Sales
        savedSale.sale_items = createdSaleItems.map(item => item._id);
        await savedSale.save({ session });

        await session.commitTransaction(); // Hoàn tất transaction
        session.endSession();

        res.status(201).json(savedSale);
    } catch (error) {
        await session.abortTransaction(); // Rollback nếu có lỗi
        session.endSession();
        res.status(400).json({ message: "Lỗi khi tạo đơn hàng", error });
    }
});

module.exports = router;
