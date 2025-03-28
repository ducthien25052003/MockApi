const { Schema, default: mongoose } = require("mongoose");

const KiotVietWarehouseSchema = new Schema({
    clientId: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    retailer: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('KiotVietWarehouseSchema', KiotVietWarehouseSchema);
