const mongoose = require("mongoose");
const Customer = require("../Misa_CustomersSchema"); // Import Schema
const fs = require("fs");
const BanksSchema = require("../MiSa_BanksSchema");
const GoodsSchema = require("../MiSa_GoodsSchema");


const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";

// Kết nối MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
}).catch(err => {
    console.error("❌ Lỗi kết nối MongoDB: ", err);
});

// Dữ liệu JSON
const rawData = fs.readFileSync("data2.json"); // Đọc file JSON
    jsonData = JSON.parse(rawData); // Chuyển thành object
// Chuyển đổi dữ liệu cho đúng key của schema
const formattedData = jsonData.map(item => ({
    // stt: item["Danh sách khách hàng"],
    Name: item["__EMPTY_1"],
    Code: item["__EMPTY"],
    Group: item["__EMPTY_3"],
    Description: null  ,
    Unit: item["__EMPTY_4"],
    Price: item["__EMPTY_14"],
    Inventory_account:null,
    Sales_account: null,
    Characteristic: item["__EMPTY_2"],


}));

// Hàm import dữ liệu vào MongoDB
async function importData() {
    try {
        await GoodsSchema.insertMany(formattedData);
        console.log(formattedData);
        console.log("Thêm dữ liệu thành công!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu:", error);
        mongoose.connection.close();
    }
}

importData();
