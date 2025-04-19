const mongoose = require('mongoose');
const Counter = require('./CounterSchema'); // Đường dẫn đến model Counter

const { Schema } = mongoose;

const InventoryOutsSchema = new Schema({
  Customer_id: { type: Schema.Types.ObjectId, ref: "Customers", required: true },
  Voucher_no: { type: String },
  Posted_date: { type: Date },
  Voucher_date: { type: Date },
  sale_id: { type: Schema.Types.ObjectId, ref: "Sales", default: null },
  warehouse_id: { type: Schema.Types.ObjectId, ref: "Warehouse", default: null },
});

// Middleware chạy trước khi save:
InventoryOutsSchema.pre("save", async function (next) {
  const doc = this;
  if (!doc.isNew || doc.Voucher_no) return next(); // Nếu đã có hoặc không phải bản ghi mới thì bỏ qua

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "inventory_outs" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Format mã phiếu tùy ý, ví dụ: OUT0001, OUT0002,...
    doc.Voucher_no = `XK${counter.seq.toString().padStart(4, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('InventoryOuts', InventoryOutsSchema);
