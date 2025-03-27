const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  contactNumber: { type: String },
  email: { type: String },
  address: { type: String },
  locationName: { type: String },
  wardName: { type: String },
  organization: { type: String },
  taxCode: { type: String },
  comments: { type: String },
  groups: { type: String },
  
  isActive: { type: Boolean, default: true }, // Mặc định là active
  modifiedDate: { type: Date, default: Date.now },
  createdDate: { type: Date, default: Date.now },

  retailerId: { type: Number }, // Nếu muốn lưu retailerId từ response
  branchId: { type: Number, required: true },
  createdBy: { type: String },

  debt: { type: Number, default: 0 },
  totalInvoiced: { type: Number, default: 0 },
  totalInvoicedWithoutReturn: { type: Number, default: 0 },
});

module.exports = mongoose.model("Supplier", SupplierSchema);

/*
{
    "total": 1,
    "pageSize": 20,
    "data": [
        {
            "id": 1000039283,
            "code": "NCC000001",
            "name": "Kho Hải Dương",
            "email": "natrumax@gmail.com",
            "organization": "Công ty Cổ phần Xuất Nhập Khẩu Sữa và Dinh Dưỡng Quốc Tế Natrumax",
            "groups": "",
            "isActive": true,
            "modifiedDate": "2025-03-09T22:41:03.1530000",
            "createdDate": "2025-03-09T22:21:57.3833333",
            "retailerId": 500370926,
            "branchId": 146868,
            "createdBy": "Bùi Thị Hải Yến ",
            "debt": 0.0000,
            "totalInvoiced": 0,
            "totalInvoicedWithoutReturn": 0
        }
    ],
    "timestamp": "2025-03-23T16:37:04.0733800+07:00"
}
 */