const express = require("express");
const mongoose = require("mongoose");
const InventoryOuts = require("../models/MiSa_InventoryOutsSchema");
const InventoryOutItems = require("../models/MiSa_InventoryOutItemsSchema");
const MiSa_Warehouse = require("../models/MiSa_Warehouse");
const MiSa_GoodsSchema = require("../models/MiSa_GoodsSchema");
const Misa_CustomersSchema = require("../models/Misa_CustomersSchema");
const MiSa_WarehouseGoods = require("../models/MiSa_WarehouseGoods");

const router = express.Router();

/** 
 * ✅ Thêm mới phiếu xuất kho + mặt hàng xuất kho 
 * URL: POST /inventory-outs
 */
router.get("/", async (req, res) => {
  try {
    const { clientsecret } = req.headers;

    if (!clientsecret) {
      return res.status(400).json({ message: "Thiếu clientSecret trong header" });
    }

    const warehouse = await MiSa_Warehouse.findOne({ clientSecret: clientsecret });
    if (!warehouse) {
      return res.status(404).json({ message: "Không tìm thấy warehouse tương ứng với clientSecret" });
    }

    // Tạo filter động
    const filter = { warehouse_id: warehouse._id };

    for (const [key, value] of Object.entries(req.query)) {
      if (!value) continue;

      if (key === "posted_date") {
        const date = new Date(value);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        filter.Posted_date = {
          $gte: date,
          $lt: nextDate
        };
      } else if (key === "voucher_no") {
        filter.Voucher_no = { $regex: value, $options: "i" }; // tìm gần đúng
      } else if (key === "sale_id" || key === "Customer_id") {
        // ép kiểu sang ObjectId
        filter[key] = new mongoose.Types.ObjectId(value);
      } else {
        filter[key] = value;
      }
    }

    // Lấy danh sách phiếu xuất kho
    const inventoryOuts = await InventoryOuts.find(filter)
      .populate("Customer_id")
      // .populate("sale_id")
      .lean();

    // Gán danh sách mặt hàng
    const result = await Promise.all(
      inventoryOuts.map(async (inv) => {
        const items = await InventoryOutItems.find({ Inventory_out: inv._id }).lean();
        return {
          ...inv,
          items
        };
      })
    );

    res.status(200).json({
      message: "Lấy danh sách phiếu xuất kho thành công",
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách phiếu xuất kho", error: error.message });
  }
});


  router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { clientsecret } = req.headers;

        if (!clientsecret) {
            return res.status(400).json({ message: "Thiếu clientSecret trong header" });
        }

        const warehouse = await MiSa_Warehouse.findOne({ clientSecret: clientsecret });
        if (!warehouse) {
            return res.status(404).json({ message: "Không tìm thấy warehouse tương ứng với clientSecret" });
        }
        const {Customer_id} =  req.body;
        const customer = await Misa_CustomersSchema.findOne({
            Customer_id: Customer_id
        }).session(session);
        
        const { inventory_out_items, ...inventoryOutData } = req.body;
        inventoryOutData.warehouse_id = warehouse._id;
        inventoryOutData.Customer_id = customer._id;

        const inventoryItemsDocs = [];

        for (const item of inventory_out_items) {
            const good = await MiSa_GoodsSchema.findOne({ _id: item.Code });
            if (!good) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Không tìm thấy sản phẩm với mã Code: ${item.Code}` });
            }

            inventoryItemsDocs.push({
                Good_id: good._id,
                Quantity: item.Quantity,
                Price: good.Price, // cần có trường này
                Status: item.Status,
                Inventory_out: null
            });
        }

        const newInventoryOut = new InventoryOuts(inventoryOutData);
        const savedInventoryOut = await newInventoryOut.save({ session });

        inventoryItemsDocs.forEach(item => item.Inventory_out = savedInventoryOut._id);

        const createdItems = await InventoryOutItems.insertMany(inventoryItemsDocs, { session });

        for (const item of inventoryItemsDocs) {
            const { Good_id, Quantity } = item;

            const warehouseGood = await MiSa_WarehouseGoods.findOne({
                warehouse: warehouse._id,
                goods: Good_id
            }).session(session);

            if (!warehouseGood) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Không tìm thấy hàng tồn trong kho với sản phẩm: ${Good_id}` });
            }

            if (warehouseGood.quantity < Quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Không đủ số lượng trong kho cho sản phẩm: ${Good_id}` });
            }

            warehouseGood.quantity -= Quantity;
            await warehouseGood.save({ session });
        }

        // ✅ Tính tổng tiền
        const totalAmount = inventoryItemsDocs.reduce((sum, item) => {
            return sum + item.Quantity * item.Price;
        }, 0);
        console.log(totalAmount);

        // ✅ Cộng vào liability của customer
        if (!inventoryOutData.Customer_id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Thiếu customer_id trong dữ liệu phiếu xuất" });
        }
        const customer1 = await Misa_CustomersSchema.findById( inventoryOutData.Customer_id ).session(session);
        if (!customer1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }
        console.log(customer1);
        customer1.Liabilities = (Number(customer1.Liabilities) || 0) + totalAmount;
        await customer1.save({ session });


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
