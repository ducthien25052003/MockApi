const { Schema, default: mongoose, Types } = require("mongoose");


const CustomersSchema = new Schema({
  Address: { type: String },// dia chi
  Liabilities: { type: String }, // Đổi từ Decimal128 sang String
  Customer_id: { type: String, required: true, unique: false, default: () => new mongoose.Types.ObjectId().toString() },// Ma khach hang
  Tax_code: { type: String },//ma so thue
  Accounts_receivable: { type: String},//Tk cong no phai thu 
  Customer_name: { type: String },// ten nhan vien
  Phone_number: { type: String },// so dien thoai
  Customer_group: { type: String },// Nhom Khach hang
  Website: { type: String },//website
  Role: { type: String, enum: ['organization', 'individual'], default: 'organization' },
  Is_supplier: { type: Boolean },
  Storeperson: { type: String },
  Is_local_object: { type: Boolean },
  receipts: [{ type: Types.ObjectId, ref: 'Receipts' }],
  sales: [{ type: Types.ObjectId, ref: 'Sales' }]
}, { timestamps: true });

module.exports = mongoose.model('Customers', CustomersSchema);