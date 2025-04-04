const { Schema, default: mongoose } = require("mongoose");

const KiotViet_ProductBranchSchema = new Schema({
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true } // Số lượng hàng hóa trong kho
}, { timestamps: true });

module.exports = mongoose.model('KiotVietProductBranch', KiotViet_ProductBranchSchema);
