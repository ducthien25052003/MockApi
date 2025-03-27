const mongoose = require("mongoose");

const SaleItemsSchema = new mongoose.Schema({
    Good: { type: mongoose.Schema.Types.ObjectId, ref: 'Goods' },
    Quantity: { type: Number },
    Sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sales' }
}, { timestamps: true });

module.exports = mongoose.model('SaleItems', SaleItemsSchema);
