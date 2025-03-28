const { Schema, default: mongoose } = require("mongoose");

const WarehouseGoodsSchema = new Schema({
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    goods: { type: Schema.Types.ObjectId, ref: "Goods", required: true },
    quantity: { type: Number, required: true } // Số lượng hàng hóa trong kho
}, { timestamps: true });

module.exports = mongoose.model('WarehouseGoods', WarehouseGoodsSchema);
