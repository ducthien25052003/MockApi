const mongoose = require("mongoose");
const { Schema } = mongoose;

const InventoryOutItemsSchema = new Schema({
  Good_id: { type: String },
  Inventory_out: { type: String },
  Quantity: { type: String },
  Status: { type: String, enum: ['Xuất 1 phần', 'Xuất đủ'] },
});

// ✅ Chỉ gọi model 1 lần và export
module.exports = mongoose.model('InventoryOutItems', InventoryOutItemsSchema);
