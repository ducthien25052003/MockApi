const { default: mongoose, Schema, Types } = require("mongoose");

const SalesSchema = new Schema({
    Voucher_no: { type: String },
    Voucher_date: { type: Date },
    Posted_date: { type: Date },
    Customer: { type: Types.ObjectId, ref: 'Customers' },
    // Inventory_out: { type: Types.ObjectId, ref: 'InventoryOuts', default: null  },
    sale_items: [{ type: Types.ObjectId, ref: 'SaleItems' }],
     warehouse_id :{
         type: Types.ObjectId, ref: 'Warehouse' 
      }
  }, { timestamps: true });
  
module.exports = mongoose.model('Sales', SalesSchema);