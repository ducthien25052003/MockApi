const express = require("express");
const mongoose = require("mongoose");
const InventoryIns = require("../models/MiSa_InventoryInsSchema");
const InventoryInItems = require("../models/MiSa_InventoryInItemsSchema");
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
  
      // Lấy danh sách phiếu xuất kho
      const inventoryIns = await InventoryIns.find({ warehouse_id: warehouse._id })
        .populate("Customer_id", "Name phone address")
        .populate("sale_id", "name")
        .lean(); // ⚡ chuyển về object thường để dễ thêm item
  
      // Lấy tất cả item theo từng inventory_out
      const result = await Promise.all(
        inventoryIns.map(async (inv) => {
          const items = await InventoryInItems.find({ Inventory_In: inv._id }).lean();
          return {
            ...inv,
            items // gán danh sách mặt hàng vào
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
       
        
        const { inventory_in_items, ...inventoryInData } = req.body;
        inventoryInData.warehouse_id = warehouse._id;
        // inventoryInData.Customer_id = customer._id;

        const inventoryItemsDocs = [];

        for (const item of inventory_in_items) {
            const good = await MiSa_GoodsSchema.findOne({ Code: item.Code });
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
                Inventory_in: null
            });
        }

        const newInventoryIn = new InventoryIns(inventoryInData);
        const savedInventoryIn = await newInventoryIn.save({ session });

        inventoryItemsDocs.forEach(item => item.Inventory_in = savedInventoryIn._id);

        const createdItems = await InventoryInItems.insertMany(inventoryItemsDocs, { session });

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

            warehouseGood.quantity += Quantity;
            await warehouseGood.save({ session });
        }
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Tạo phiếu xuất kho thành công!",
            inventory_in: savedInventoryIn,
            inventory_in_items: createdItems
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Lỗi khi tạo phiếu xuất kho", error: error.message });
    }
});


module.exports = router;
