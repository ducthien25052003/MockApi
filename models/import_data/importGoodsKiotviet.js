const mongoose = require("mongoose");
const Customer = require("../Misa_CustomersSchema"); // Import Schema
const fs = require("fs");
const BanksSchema = require("../MiSa_BanksSchema");
const GoodsSchema = require("../MiSa_GoodsSchema");
const KiotViet_Product = require("../KiotViet_Product");

const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";

// Kết nối MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
}).catch(err => {
    console.error("❌ Lỗi kết nối MongoDB: ", err);
});

// Dữ liệu JSON
const rawData = fs.readFileSync("data3.json"); // Đọc file JSON
    jsonData = JSON.parse(rawData); // Chuyển thành object
// Chuyển đổi dữ liệu cho đúng key của schema
const formattedData = jsonData.map(item => {
    const productId = new mongoose.Types.ObjectId(); // Tạo ObjectId hợp lệ

    return {
        // _id: productId,
        code: item["Mã hàng"],
        name: item["Tên hàng"],
        categoryId: null,
        categoryName: null,
        allowsSale: true,
        hasVariants: false,
        basePrice: item["Giá bán"],
        conversionValue: 1,
        description: null,
        isActive: true,
        isRewardPoint: false,
        isLotSerialControl: false,
        isBatchExpireControl: false,
        images: null, // null
        inventories: [
            {
                // productId: productId,
                branchId: null,
                branchName: null,
                cost: item["Giá vốn"],
                onHand: item["Tồn kho"],
                reserved: 0,
                actualReserved: 0,
                minQuantity: 0,
                maxQuantity: 0,
                isActive: true,
                onOrder: 0
            }
        ]
    };
});

// Hàm import dữ liệu vào MongoDB
async function importData() {
    try {
        await KiotViet_Product.insertMany(formattedData);
        console.log(formattedData);
        console.log("Thêm dữ liệu thành công!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu:", error);
        mongoose.connection.close();
    }
}

importData();
