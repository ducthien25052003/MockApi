const mongoose = require('mongoose');
const Counter = require('./CounterSchema'); // Đường dẫn đến model Counter

const { Schema } = mongoose;

const InventoryInsSchema = new Schema({
  Voucher_no: { type: String },
  Posted_date: { type: Date },
  Voucher_date: { type: Date },
  warehouse_id: { type: Schema.Types.ObjectId, ref: "Warehouse", default: null },
});

// Middleware chạy trước khi save:
InventoryInsSchema.pre("save", async function (next) {
  const doc = this;
  if (!doc.isNew || doc.Voucher_no) return next(); // Nếu đã có hoặc không phải bản ghi mới thì bỏ qua

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "inventory_ins" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Format mã phiếu tùy ý, ví dụ: OUT0001, OUT0002,...
    doc.Voucher_no = `IN${counter.seq.toString().padStart(4, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('InventoryIns', InventoryInsSchema);
