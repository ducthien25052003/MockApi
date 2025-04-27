const express = require("express");
const mongoose = require("mongoose");
const MiSa_SalesSchema = require("../models/MiSa_SalesSchema");
const MiSa_InventoryOutsSchema = require("../models/MiSa_InventoryOutsSchema");
const MiSa_Warehouse = require("../models/MiSa_Warehouse");
const Misa_CustomersSchema = require("../models/Misa_CustomersSchema");
const MiSa_WarehouseGoods = require("../models/MiSa_WarehouseGoods");
const MiSa_GoodsSchema = require("../models/MiSa_GoodsSchema");
const MiSa_InventoryOutItemsSchema = require("../models/MiSa_InventoryOutItemsSchema");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let filter = {};
    const model = MiSa_SalesSchema;
    populateFields = [];
    let { pageSize, currentItem, orderBy, orderDirection, ...query } =
      req.query;
    const clientSecret = req.headers["clientsecret"];
    // Nếu có clientSecret thì tìm warehouseId tương ứng
    if (clientSecret) {
      const warehouse = await MiSa_Warehouse.findOne({ clientSecret });
      if (!warehouse) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy warehouse với clientSecret này" });
      }

      // Gán điều kiện lọc theo warehouse
      filter.warehouse_id = warehouse._id;
    }
    // Chuyển đổi kiểu dữ liệu
    Object.keys(query).forEach((key) => {
      if (query[key] === "true") filter[key] = true;
      else if (query[key] === "false") filter[key] = false;
      //   else if (!isNaN(query[key])) filter[key] = Number(query[key]);
      else filter[key] = query[key];
    });

    // Xác định số lượng bản ghi
    const total = await model.countDocuments(filter);
    console.log(filter);

    // Phân trang
    pageSize = Math.min(parseInt(pageSize) || 20, 100); // Giới hạn tối đa 100 items
    currentItem = parseInt(currentItem) || 0;

    let queryBuilder = model.find(filter);
    queryBuilder = queryBuilder.populate("sale_items");
    // Populate nếu có
    if (populateFields.length) {
      populateFields.forEach((field) => {
        queryBuilder = queryBuilder.populate(field);
      });
    }

    // Sắp xếp dữ liệu
    if (orderBy) {
      let sortDirection = orderDirection === "desc" ? -1 : 1;
      queryBuilder = queryBuilder.sort({ [orderBy]: sortDirection });
    }

    // Áp dụng phân trang
    queryBuilder = queryBuilder.skip(currentItem).limit(pageSize);

    // Thực thi truy vấn
    const data = await queryBuilder;
    //Tạo inventtory_out----------------------------------
     const { clientsecret } = req.headers;
        const session = await mongoose.startSession();
    
            if (!clientsecret) {
                return res.status(400).json({ message: "Thiếu clientSecret trong header" });
            }
    
            const warehouse = await MiSa_Warehouse.findOne({ clientSecret: clientsecret });
            if (!warehouse) {
                return res.status(404).json({ message: "Không tìm thấy warehouse tương ứng với clientSecret" });
            }
            const Customer_id =  data.Customer;
            const customer = await Misa_CustomersSchema.findOne({
                _id: data[0].Customer
            }).session(session);

            const { sale_items, ...inventoryOutData } =data[0];
            inventoryOutData.warehouse_id = warehouse._id;
            inventoryOutData.Customer_id = customer._id;

            const inventoryItemsDocs = [];
            console.log(sale_items);

            for (const item of sale_items) {
                const good = await MiSa_GoodsSchema.findOne({ _id : item.Good });
                if (!good) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).json({ message: `Không tìm thấy sản phẩm với mã Code: ${item.Code}` });
                }

                inventoryItemsDocs.push({
                    Good_id: good._id,
                    Quantity: item.Quantity,
                    Price: good.Price, // cần có trường này
                    Status: null,
                    Inventory_out: null
                });
            }
            const newInventoryOut = new MiSa_InventoryOutsSchema(inventoryOutData);
            const savedInventoryOut = await newInventoryOut.save({ session });
    
            inventoryItemsDocs.forEach(item => item.Inventory_out = savedInventoryOut._id);
    
            const createdItems = await MiSa_InventoryOutItemsSchema.insertMany(inventoryItemsDocs, { session });
            // console.log(1);
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
    
            // ✅ Cộng vào liability của customer
            // if (!inventoryOutData.Customer_id) {
            //     await session.abortTransaction();
            //     session.endSession();
            //     return res.status(400).json({ message: "Thiếu customer_id trong dữ liệu phiếu xuất" });
            // }
            // const customer1 = await Misa_CustomersSchema.findById( inventoryOutData.Customer_id ).session(session);
            // if (!customer1) {
            //     await session.abortTransaction();
            //     session.endSession();
            //     return res.status(404).json({ message: "Không tìm thấy khách hàng" });
            // }
            // customer1.Liabilities = (Number(customer1.Liabilities) || 0) + totalAmount;
            // await customer1.save({ session });
            console.log(1);

    
            // await session.commitTransaction();
            // session.endSession();
    // Trả về response------------------
    res.json({
      total, // Tổng số bản ghi
      pageSize, // Số bản ghi trên 1 trang
      data, // Dữ liệu
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách phiếu xuất kho",
        error: error.message,
      });
  }
});

module.exports = router;
