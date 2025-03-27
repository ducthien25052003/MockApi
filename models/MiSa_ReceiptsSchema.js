const { default: mongoose, Schema, Types } = require("mongoose");

const ReceiptsSchema = new Schema({
    Customer: { type: Types.ObjectId, ref: 'Customers' },
    Voucher_date: { type: Date },
    Voucher_no: { type: String },
    Posted_date: { type: Date },
    Debit_account: { type: String, enum: ['1121'] },
    Cash_deposit: { type: String },
    Reason: { type: String },
    Item_name: { type: String },
    Amount: { type: Schema.Types.Decimal128 },
    Bank: { type: Types.ObjectId, ref: 'Banks' }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Receipts', ReceiptsSchema);