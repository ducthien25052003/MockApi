const mongoose = require("mongoose");
const CounterSchema = require("./CounterSchema");

const PurchaseOrderDetailSchema = new mongoose.Schema({
  productCode: { type: String },//bar code, BE truyền
  productName: { type: String },// Be truyền 
  quantity: { type: Number }, // double -> Number
  price: { type: Number }, // decimal -> Number
  discount: { type: String },// BE truyền
});

const PurchaseOrderSchema = new mongoose.Schema({
  code: { type: String },// tự động Pn...
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  branchName: { type: String },
  purchaseDate: { type: Date },// BE truyền
  discountRatio: { type: Number }, // long -> Number (0)
  total: { type: Number }, // tự tính từ detail
  purchaseById: { type: mongoose.Schema.Types.ObjectId, ref: "Retailer", required: true },
  purchaseName: { type: String },// tên của retailer
  purchaseOrderDetails: [PurchaseOrderDetailSchema],
});
PurchaseOrderSchema.pre("save", async function (next) {
  const doc = this;

  // Nếu không phải mới hoặc đã có mã thì bỏ qua
  if (!doc.isNew || doc.code) return next();

  try {
    // Lấy mã đơn tăng dần
    const counter = await CounterSchema.findByIdAndUpdate(
      { _id: "purchase_order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Gán mã ví dụ: Pn0001
    doc.code = `PN${counter.seq.toString().padStart(4, "0")}`;

    // Tính total nếu chưa có
    // if (!doc.total) {
    //   let total = 0;
    //   for (const detail of doc.purchaseOrderDetails) {
    //     const quantity = detail.quantity || 0;
    //     const price = detail.price || 0;
    //     total += quantity * price;
    //   }

    //   // Áp dụng discountRatio nếu có
    //   const discount = doc.discountRatio || 0;
    //   doc.total = total * (1 - discount / 100);
    // }

    next();
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);

