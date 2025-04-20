const express = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/KiotViet_PurchaseOrder");
const KiotViet_Product = require("../models/KiotViet_Product");
const KiotViet_Branch = require("../models/KiotViet_Branch");
const KiotViet_Warehouse = require("../models/KiotViet_Warehouse");
const router = express.Router();

const KiotViet_ProductBranch = require("../models/KiotViet_ProductBranch");

const Customer = require("../models/Misa_CustomersSchema");

router.post("/", async (req, res) => {
  const retailerId = req.headers["retailerid"];
  const body = req.body;

  if (!retailerId) {
    return res.status(400).json({ message: "Thiếu retailerId trong headers" });
  }

  try {
    // Tìm warehouse theo retailerId
    const warehouse = await KiotViet_Warehouse.findOne({ retailerId });
    if (!warehouse) {
      return res.status(404).json({ message: "Không tìm thấy kho" });
    }

    // Tìm branch theo _id của warehouse
    const branch = await KiotViet_Branch.findOne({ retailerId: warehouse._id });
    if (!branch) {
      return res.status(404).json({ message: "Không tìm thấy chi nhánh" });
    }

    // Tính tổng tiền từ danh sách sản phẩm
    let total = 0;
    const details = body.purchaseOrderDetails || [];

    for (const detail of details) {
      const quantity = Number(detail.quantity) || 0;
      const price = Number(detail.price) || 0;
      total += quantity * price;
    }

    // Áp dụng chiết khấu nếu có
    const discountRatio = Number(body.discountRatio) || 0;
    const finalTotal = total * (1 - discountRatio / 100);

    // Tạo đơn hàng
    const purchaseOrder = new PurchaseOrder({
      branchId: branch._id,
      branchName: branch.branchName,
      purchaseDate: body.purchaseDate || new Date(),
      discountRatio: discountRatio,
      total: finalTotal,
      purchaseById: warehouse._id,
      purchaseName: warehouse.name,
      purchaseOrderDetails: details,
    });

    await purchaseOrder.save();

    // Cập nhật số lượng sản phẩm tồn kho tại chi nhánh
    for (const detail of details) {
      const { productCode, quantity } = detail;
      const product = await KiotViet_Product.findOne({ code: productCode });
      if (!product) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy Product với code này" });
      }
      const productBranch = await KiotViet_ProductBranch.findOne({
        productId: product._id,
        branchId: branch._id,
      });
      console.log(productBranch);
      // Cộng thêm vào tồn kho hiện tại
      productBranch.quantity += quantity;
      await productBranch.save();
      console.log(productBranch);
    }
    

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
      data: purchaseOrder,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra", error });
  }
});

module.exports = router;
