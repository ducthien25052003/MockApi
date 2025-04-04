const mongoose = require("mongoose");
const fs = require("fs");
const Customer = require("../Misa_CustomersSchema"); // Import Schema
const MiSa_Warehouse = require("../MiSa_Warehouse"); // Import Schema

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

// ✅ Hàm lấy ObjectId của warehouse từ MongoDB
async function getObjectIdById(model, id) {
    try {
        const result = await model.findById(id.trim()).select("_id");
        return result ? result._id : null;
    } catch (error) {
        console.error(`❌ Lỗi khi lấy ObjectId: ${error}`);
        return null;
    }
}

// ✅ Chuyển đổi dữ liệu JSON sang object hợp lệ
async function formatData() {
    const rawData = fs.readFileSync("data1.json");
    const jsonData = JSON.parse(rawData);

    // 🔥 Sử dụng `Promise.all()` để đợi tất cả dữ liệu được xử lý xong
    const formattedData = await Promise.all(jsonData.map(async (item) => {
        const warehouseId = await getObjectIdById(MiSa_Warehouse, item["__EMPTY_14"]);

        return {
            Customer_id: item["__EMPTY"],
            Customer_name: item["__EMPTY_1"],
            Address: item["__EMPTY_2"],
            Liabilities: item["__EMPTY_3"],
            Customer_group: item["__EMPTY_4"],
            Tax_code: item["__EMPTY_5"],
            Phone_number: item["__EMPTY_6"],
            Website: item["__EMPTY_7"],
            Accounts_receivable: item["__EMPTY_8"]?.trim() || "131",
            Storeperson: item["__EMPTY_9"],
            Is_supplier: item["__EMPTY_12"]?.trim() === "✓",
            Is_local_object: item["__EMPTY_13"]?.trim() === "✓",
            warehouse_id: warehouseId,
        };
    }));

    return formattedData;
}

// ✅ Hàm import dữ liệu vào MongoDB
async function importData() {
    try {
        await connectDB(); // Đảm bảo MongoDB đã kết nối
        const formattedData = await formatData(); // Chờ dữ liệu chuyển đổi xong
        await Customer.insertMany(formattedData); // Lưu vào DB

        console.log("✅ Thêm dữ liệu thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi thêm dữ liệu:", error);
    } finally {
        mongoose.connection.close(); // Đóng kết nối sau khi hoàn thành
    }
}

// 🔥 Chạy script import
importData();
