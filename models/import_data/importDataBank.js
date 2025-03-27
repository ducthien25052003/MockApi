const mongoose = require("mongoose");
const Customer = require("./models/CustomersSchema"); // Import Schema
const fs = require("fs");
const BanksSchema = require("./models/BanksSchema");


const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";

// Kết nối MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
}).catch(err => {
    console.error("❌ Lỗi kết nối MongoDB: ", err);
});

// Dữ liệu JSON
const rawData = fs.readFileSync("data1.json"); // Đọc file JSON
    jsonData = JSON.parse(rawData); // Chuyển thành object
// Chuyển đổi dữ liệu cho đúng key của schema
const formattedData = jsonData.map(item => ({
    // stt: item["Danh sách khách hàng"],
    Number: item["__EMPTY"],
    Bank_name: item["__EMPTY_1"],
    Branch: item["__EMPTY_2"],
    Holder: item["__EMPTY_3"],
    Status: item["__EMPTY_4"]?.trim() === "Đang sử dụng"
    
}));

// Hàm import dữ liệu vào MongoDB
async function importData() {
    try {
        await BanksSchema.insertMany(formattedData);
        console.log(formattedData);
        console.log("Thêm dữ liệu thành công!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu:", error);
        mongoose.connection.close();
    }
}

importData();
