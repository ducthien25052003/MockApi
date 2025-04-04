const { Schema, default: mongoose } = require("mongoose");

const KiotVietWarehouseSchema = new Schema({
    clientId: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    retailerId: { type: String, required: true, default: "500370926" },
    name: { type: String, required: true}
    // them retailerId
}, { timestamps: true });

module.exports = mongoose.model('Retailer', KiotVietWarehouseSchema);
