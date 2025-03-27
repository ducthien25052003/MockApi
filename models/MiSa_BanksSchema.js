const { Schema, default: mongoose } = require("mongoose");

// models/Banks.js
const BanksSchema = new Schema({
    Number: { type: String },
    Bank_name: { type: String },
    Branch: { type: String },
    Holder: { type: String },
    Status: { type: Boolean }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Banks', BanksSchema);