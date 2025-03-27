const { Schema, default: mongoose, Types } = require("mongoose");

const InventoryOutsSchema = new Schema({
    Customer: { type: Types.ObjectId, ref: 'Customers' },
    Voucher_no: { type: String },
    Posted_date: { type: Date },
    Voucher_date: { type: Date }
  }, { timestamps: true });
  
  module.exports = mongoose.model('InventoryOuts', InventoryOutsSchema);