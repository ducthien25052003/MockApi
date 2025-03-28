const { Schema, default: mongoose } = require("mongoose");

const GoodsSchema = new Schema({
    Name: { type: String },
    Code: { type: String },
    Group: { type: String },
    Description: { type: String },
    Unit: { type: String },
    Price: { type: String },
    Inventory_account: { type: String },
    Sales_account: { type: String },
    Characteristic: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Goods', GoodsSchema);
