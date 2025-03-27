const { Schema, default: mongoose } = require("mongoose");

const MiSa_Warehouse = new Schema({
    clientId: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    retailer: { type: String, required: true },
    goods: [{
      goodsId: { type: Schema.Types.ObjectId, ref: "Goods" },
      quantity: { type: String }
    }]
  }, { timestamps: true });
module.exports = mongoose.model('Warehouse', MiSa_Warehouse);