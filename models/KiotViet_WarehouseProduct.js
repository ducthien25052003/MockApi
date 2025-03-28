const { Schema, default: mongoose } = require("mongoose");

const KiotViet_WarehouseProductSchema = new Schema({
    warehouse: { type: Schema.Types.ObjectId, ref: "KiotVietWarehouseSchema", required: true },
    goods: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true } // Số lượng hàng hóa trong kho
}, { timestamps: true });

module.exports = mongoose.model('KiotVietWarehouseProducts', KiotViet_WarehouseProductSchema);
