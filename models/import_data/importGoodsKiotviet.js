const mongoose = require("mongoose");
const fs = require("fs");
const Customer = require("../Misa_CustomersSchema"); 
const BanksSchema = require("../MiSa_BanksSchema");
const GoodsSchema = require("../MiSa_GoodsSchema");
const KiotViet_Product = require("../KiotViet_Product");
const KiotViet_Category = require("../KiotViet_Category");

const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";

// ✅ Kết nối MongoDB trước khi chạy truy vấn
async function connectDB() {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("✅ Đã kết nối MongoDB.");
            return;
        }
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Kết nối MongoDB thành công!");
    } catch (error) {
        console.error("❌ Lỗi kết nối MongoDB: ", error);
        process.exit(1);
    }
}

// ✅ Hàm lấy ObjectId của category từ MongoDB
async function getObjectIdById(model, id) {
    try {
        const result = await model.findById(id.trim()).select("_id");
        return result ? result._id : null;
    } catch (error) {
        console.error(`❌ Lỗi khi lấy ObjectId: ${error}`);
        return null;
    }
}

// ✅ Hàm chuyển đổi dữ liệu
async function formatData() {
    const rawData = fs.readFileSync("data3.json");
    const jsonData = JSON.parse(rawData);

    // Dùng Promise.all để chờ tất cả dữ liệu xử lý xong
    const formattedData = await Promise.all(jsonData.map(async (item) => {
        const categoryId = await getObjectIdById(KiotViet_Category, "67ed108435f7747ac25db418");

        return {
            code: item["Mã hàng"],
            name: item["Tên hàng"],
            categoryId: categoryId,
            categoryName: "NATRUMAX",
            allowsSale: true,
            hasVariants: false,
            basePrice: item["Giá bán"],
            conversionValue: 1,
            description: null,
            isActive: true,
            isRewardPoint: false,
            isLotSerialControl: false,
            isBatchExpireControl: false,
            images: null,
            inventories: [
                {
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
    }));

    return formattedData;
}

// ✅ Hàm import dữ liệu vào MongoDB
async function importData() {
    try {
        await connectDB(); // Đảm bảo MongoDB đã kết nối
        const formattedData = await formatData(); // Chờ dữ liệu chuyển đổi xong
        await KiotViet_Product.insertMany(formattedData); // Lưu vào DB

        console.log("✅ Thêm dữ liệu thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi thêm dữ liệu:", error);
    } finally {
        mongoose.connection.close(); // Đóng kết nối sau khi hoàn thành
    }
}

// 🔥 Chạy script import
importData();
