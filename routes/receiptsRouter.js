const express = require("express");
const { default: mongoose } = require("mongoose");
const Misa_CustomersSchema = require("../models/Misa_CustomersSchema");
const MiSa_ReceiptsSchema = require("../models/MiSa_ReceiptsSchema");
const router = express.Router();
router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { Customer, Cash_deposit, ...rest } = req.body;

        if (!Customer || !Cash_deposit) {
            return res.status(400).json({ message: "Thiếu thông tin khách hàng hoặc số tiền nộp" });
        }
        const customer = await Misa_CustomersSchema.findOne({
                    Customer_id: Customer
                }).session(session);
                

        // Tự tạo mã phiếu thu
        const Voucher_no = `PT-${Date.now()}`;

        // Tạo phiếu thu
        const receipt = new MiSa_ReceiptsSchema({
            customer: Customer,
            Cash_deposit,
            Voucher_no,
            ...rest
        });

        const savedReceipt = await receipt.save({ session });

        // Tìm khách hàng

        if (!customer) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }

        // Trừ công nợ
        customer.Liabilities = (Number(customer.Liabilities) || 0) - Number(Cash_deposit);
        await customer.save({ session });

        await session.commitTransaction();
        res.status(201).json({ message: "Tạo phiếu thu thành công", receipt: savedReceipt });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: "Lỗi khi tạo phiếu thu", error: error.message });
    } finally {
        session.endSession();
    }
});
module.exports = router;
