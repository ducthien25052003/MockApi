const mongoose = require("mongoose");
// const ProductBatchExpireSchema = new mongoose.Schema({
//   id: { type: Number },
//   productId: { type: Number },
//   batchName: { type: String },
//   fullNameVirgule: { type: String },
//   createdDate: { type: Date },
//   expireDate: { type: Date },
// });
const PurchaseOrderDetailSchema = new mongoose.Schema({
  productCode: { type: String },
  productName: { type: String },
  quantity: { type: Number }, // double -> Number
  price: { type: Number }, // decimal -> Number
  discount: { type: String },
  serialNumbers: { type: String, default: "" },
//   productBatchExpire: ProductBatchExpireSchema,
});
const PaymentSchema = new mongoose.Schema({
  id: { type: Number },
  code: { type: String },
  method: { type: String },
  status: { type: Number },
  statusValue: { type: String },
  transDate: { type: Date },
});
const PurchaseOrderSchema = new mongoose.Schema({
  code: { type: String },
  branchId: { type: Number },
  branchName: { type: String },
  purchaseDate: { type: Date },
  discountRatio: { type: Number }, // long -> Number
  total: { type: Number },
  supplierId: { type: Number },
  supplierName: { type: String },
  supplierCode: { type: String },
  partnerType: { type: String },
  purchaseById: { type: Number },
  purchaseName: { type: String },
  purchaseOrderDetails: [PurchaseOrderDetailSchema],
  payments: [PaymentSchema],
});

module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);

