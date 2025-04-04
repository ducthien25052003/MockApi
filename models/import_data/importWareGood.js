const mongoose = require("mongoose");
const fs = require("fs");
const MiSa_Warehouse = require("../MiSa_Warehouse");
const MiSa_GoodsSchema = require("../MiSa_GoodsSchema");
const MiSa_GoodsSchemaGoods = require("../MiSa_WarehouseGoods");

const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Kết nối MongoDB thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB: ", err));

// Hàm lấy ObjectId từ tên
async function getObjectIdById(model, id) {
    // const result = await model.findById(id).select("_id");
    const result = await model.findById(id.trim()).select("_id");

    return result ? result._id : null;
}

// Hàm import dữ liệu vào MongoDB
async function importData() {
    try {
        // Đọc file JSON
        const rawData = fs.readFileSync("data4.json");
        const jsonData = JSON.parse(rawData);

        // Chuyển đổi dữ liệu
        const formattedData = await Promise.all(jsonData.map(async (item) => {
            const goodsId  = await getObjectIdById( MiSa_GoodsSchema, item["__EMPTY"]);
            const warehouseId = await getObjectIdById(MiSa_Warehouse, item["__EMPTY_1"]);
             // Kiểm tra nếu không tìm thấy ObjectId
             if (!warehouseId) {
                console.error(`❌ Không tìm thấy warehouseId cho: ${item["__EMPTY_1"]}`);
            }
            if (!goodsId) {
                console.error(`❌ Không tìm thấy goodsId cho: ${item["__EMPTY"]}`);
            }
            return {
                warehouse: warehouseId, // Chuyển thành ObjectId
                goods: goodsId, // Chuyển thành ObjectId
                quantity: 100
            };
        }));

        // Thêm dữ liệu vào MongoDB
        await MiSa_GoodsSchemaGoods.insertMany(formattedData);
        console.log("Thêm dữ liệu thành công!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu:", error);
        mongoose.connection.close();
    }
}

// Chạy hàm import
importData();
