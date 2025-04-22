const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const SalesSchema = new Schema({
  Voucher_no: { type: String },
  Voucher_date: { type: Date },
  Posted_date: { type: Date },
  Customer: { type: Types.ObjectId, ref: 'Customers' },
  sale_items: [{ type: Types.ObjectId, ref: 'SaleItems' }],
  warehouse_id: { type: Types.ObjectId, ref: 'Warehouse' },
  status: { type: Boolean, default: true }
}, { timestamps: true });

// Middleware tạo mã Voucher_no tự động
SalesSchema.pre('save', async function (next) {
  if (this.isNew && !this.Voucher_no) {
    const Sales = mongoose.model('Sales');

    const lastSale = await Sales.findOne({ Voucher_no: /^BH\d+$/ })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;

    if (lastSale && lastSale.Voucher_no) {
      const lastNumber = parseInt(lastSale.Voucher_no.replace("BH", ""), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    this.Voucher_no = "BH" + nextNumber.toString().padStart(4, "0");
  }

  next();
});

module.exports = mongoose.model('Sales', SalesSchema);
