const { Schema, default: mongoose } = require("mongoose");

const WarehouseSchema = new Schema({
    clientId: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    // retailer: { type: String, required: true },
    warehouse_name: { type: String, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
