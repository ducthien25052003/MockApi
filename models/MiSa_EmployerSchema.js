const { default: mongoose, Schema, Types } = require("mongoose");

const EmployerSchema = new Schema({
    name: { type: String },
    phone: { type: String },
    warehouse_id :{
        type: Types.ObjectId, ref: 'Warehouse' 
     }
  }, { timestamps: true });
  
module.exports = mongoose.model('Employer', EmployerSchema);