const mongoose = require("mongoose");
const { Schema } = mongoose;

const InventoryInItemsSchema = new Schema({
  // Good_id: { type: String },
  Good_id: { type: Schema.Types.ObjectId, ref: "Goods"},
  // Inventory_out: { type: String },
  Inventory_in: { type: Schema.Types.ObjectId, ref: "InventoryIns"},

  Quantity: { type: String },
  Status: { type: String, enum: ['Xuất 1 phần', 'Xuất đủ'] },
});

// ✅ Chỉ gọi model 1 lần và export
module.exports = mongoose.model('InventoryInItems', InventoryInItemsSchema);
