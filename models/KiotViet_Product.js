const mongoose = require("mongoose");
const InventorySchema = new mongoose.Schema({
//   productId: { type: mongoose.Schema.Types.ObjectId, ref: "KiotViet_Product" },// ma hang
  branchId: { type: Number },
  branchName: { type: String },
  cost: { type: Number },// giá nhập
  onHand: { type: Number },// số lượng trong kho
  reserved: { type: Number },// 
  actualReserved: { type: Number },
  minQuantity: { type: Number },
  maxQuantity: { type: Number },
  isActive: { type: Boolean },
  onOrder: { type: Number }
});
const ProductSchema = new mongoose.Schema({
  createdDate: { type: Date },
  masterCode: { type: String },// chưa rõ
  // id: { type: Number},// mã hàng
  retailerId: { type: Number },// chưa rõ
  code: { type: String },//mã hàng(vạch)
  name: { type: String },// ten hang
  categoryId: { type: Number },// get từ bên model category 
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  categoryName: { type: String },// get từ bên model category 
  allowsSale: { type: Boolean },// mặc định true
  type: { type: Number },// chưa rõ
  hasVariants: { type: Boolean },// mặc định là false
  basePrice: { type: Number },//giá bán
  conversionValue: { type: Number }, //default: 1
  description: { type: String }, //có thể null
  modifiedDate: { type: Date },
  isActive: { type: Boolean },// true
  isRewardPoint: { type: Boolean },// false
  isLotSerialControl: { type: Boolean }, //false
  isBatchExpireControl: { type: Boolean },//false
  inventories: [InventorySchema],
  images: [{ type: String }] // null
});

module.exports = mongoose.model("Product", ProductSchema);

