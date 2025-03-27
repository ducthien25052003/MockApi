const mongoose = require("mongoose");
const Customer = require("./models/CustomersSchema"); // Import Schema
const fs = require("fs");


const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";

// Kết nối MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
}).catch(err => {
    console.error("❌ Lỗi kết nối MongoDB: ", err);
});

// Dữ liệu JSON
const rawData = fs.readFileSync("data.json"); // Đọc file JSON
    jsonData = JSON.parse(rawData); // Chuyển thành object
// Chuyển đổi dữ liệu cho đúng key của schema
const formattedData = jsonData.map(item => ({
    // stt: item["Danh sách khách hàng"],
    Customer_id: item["__EMPTY"],
    Customer_name: item["__EMPTY_1"],
    Address: item["__EMPTY_2"],
    Liabilities: item["__EMPTY_3"],
    Customer_group: item["__EMPTY_4"],
    Tax_code: item["__EMPTY_5"],
    Phone_number: item["__EMPTY_6"],
    Website: item["__EMPTY_7"],
    Accounts_receivable: item["__EMPTY_8"]?.trim() || "131",
    Storeperson : item["__EMPTY_9"],
    // tenNhanVien: item["__EMPTY_10"],
    // dtDiDongNLH: item["__EMPTY_11"],
    Is_supplier: item["__EMPTY_12"]?.trim() === "✓",
    Is_local_object: item["__EMPTY_13"]?.trim() === "✓",
}));

// Hàm import dữ liệu vào MongoDB
async function importData() {
    try {
        await Customer.insertMany(formattedData);
        console.log(formattedData);
        console.log("Thêm dữ liệu thành công!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu:", error);
        mongoose.connection.close();
    }
}

importData();
