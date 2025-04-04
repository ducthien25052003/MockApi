const mongoose = require('mongoose');

const { Schema } = mongoose;

const InventoryOutsSchema = new Schema({
  // Customer_id: { type: String },
  Customer_id: { type: Schema.Types.ObjectId, ref: "Customers", required: true },
  Voucher_no: { type: String },
  Posted_date: { type: Date },
  Voucher_date: { type: Date },
});

module.exports = mongoose.model('InventoryOuts', InventoryOutsSchema);
