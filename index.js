const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
const Customers = require('./models/Misa_CustomersSchema');
const Receipts = require('./models/MiSa_ReceiptsSchema');
const Sales = require('./models/MiSa_SalesSchema');
const Banks = require('./models/MiSa_BanksSchema');
const InventoryOuts = require('./models/MiSa_InventoryOutsSchema');
const InventoryIns = require('./models/MiSa_InventoryInsSchema');

const SaleItems = require('./models/MiSa_SaleItemsSchema');
const Goods = require('./models/MiSa_GoodsSchema');


const cors = require("cors");
app.use(cors());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

var bodyParser = require("body-parser");
const BaseResponse = require("./base.response");

app.use("/", express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const mongoose = require("mongoose");
const { console } = require("inspector");
const KiotViet_Customer = require("./models/KiotViet_Customer");
const KiotViet_Branch = require("./models/KiotViet_Branch");
const KiotViet_Product = require("./models/KiotViet_Product");
const KiotViet_PurchaseOrder = require("./models/KiotViet_PurchaseOrder");
const KiotViet_Category = require("./models/KiotViet_Category");
const MiSa_Warehouse = require("./models/MiSa_Warehouse");
const KiotViet_SupplierSchema = require("./models/KiotViet_SupplierSchema");
const MiSa_WarehouseGoods = require("./models/MiSa_WarehouseGoods");
const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";
const KiotVietWarehouseSchema = require("./models/KiotViet_Warehouse");
const Employer = require("./models/MiSa_EmployerSchema");
// Kết nối MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
}).catch(err => {
    console.error("❌ Lỗi kết nối MongoDB: ", err);
});
// API CRUD chung
// const createCrudRoutes = (model, route, populateFields = []) => {
//   app.get(`/${route}`, async (req, res) => {
//     try {
//       let query = model.find();
//       if (populateFields.length) {
//         populateFields.forEach(field => query = query.populate(field));
//       }
//       const items = await query;
//       res.json(items);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.get(`/${route}/:id`, async (req, res) => {
//     try {
//       let query = model.findById(req.params.id);
//       console.log(populateFields);

//       if (populateFields.length) {
//         populateFields.forEach(field => query = query.populate(field));
//         console.log(populateFields);
//       }
//       const item = await query;
//       if (!item) return res.status(404).json({ error: 'Not found' });
//       res.json(item);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.post(`/${route}`, async (req, res) => {
//     try {
//       const newItem = new model(req.body);
//       await newItem.save();
//       res.status(201).json(newItem);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.put(`/${route}/:id`, async (req, res) => {
//     try {
//       const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
//       if (!updatedItem) return res.status(404).json({ error: 'Not found' });
//       res.json(updatedItem);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.delete(`/${route}/:id`, async (req, res) => {
//     try {
//       const deletedItem = await model.findByIdAndDelete(req.params.id);
//       if (!deletedItem) return res.status(404).json({ error: 'Not found' });
//       res.json({ message: 'Deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
// };
const createCrudRoutes = (model, route, populateFields = []) => {
  app.get(`/${route}`, async (req, res) => {
      try {
          let filter = {};
          let { pageSize, currentItem, orderBy, orderDirection, ...query } = req.query;
          const clientSecret = req.headers["clientsecret"];
          // Nếu có clientSecret thì tìm warehouseId tương ứng
          if (clientSecret) {
            const warehouse = await MiSa_Warehouse.findOne({ clientSecret });
            if (!warehouse) {
                return res.status(404).json({ message: "Không tìm thấy warehouse với clientSecret này" });
            }

            // Gán điều kiện lọc theo warehouse
            filter.warehouse = warehouse._id;
        }
          // Chuyển đổi kiểu dữ liệu
          Object.keys(query).forEach(key => {
              if (query[key] === "true") filter[key] = true;
              else if (query[key] === "false") filter[key] = false;
            //   else if (!isNaN(query[key])) filter[key] = Number(query[key]);
              else filter[key] = query[key];
          });

          // Xác định số lượng bản ghi
          const total = await model.countDocuments(filter);

          // Phân trang
          pageSize = Math.min(parseInt(pageSize) || 20, 100); // Giới hạn tối đa 100 items
          currentItem = parseInt(currentItem) || 0;

          let queryBuilder = model.find(filter);

          // Populate nếu có
          if (populateFields.length) {
              populateFields.forEach(field => {
                  queryBuilder = queryBuilder.populate(field);
              });
          }

          // Sắp xếp dữ liệu
          if (orderBy) {
              let sortDirection = orderDirection === "desc" ? -1 : 1;
              queryBuilder = queryBuilder.sort({ [orderBy]: sortDirection });
          }

          // Áp dụng phân trang
          queryBuilder = queryBuilder.skip(currentItem).limit(pageSize);

          // Thực thi truy vấn
          const data = await queryBuilder;

          // Trả về response
          res.json({
              total,          // Tổng số bản ghi
              pageSize,       // Số bản ghi trên 1 trang
              data            // Dữ liệu
          });
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  });
     // === [POST] ===
     app.post(`/${route}`, async (req, res) => {
        try {
            const clientSecret = req.headers["clientsecret"];
            let data = req.body;

            if (clientSecret) {
                const warehouse = await MiSa_Warehouse.findOne({ clientSecret });
                if (!warehouse) {
                    return res.status(404).json({ message: "Không tìm thấy warehouse với clientSecret này" });
                }
                data.warehouse = warehouse._id;
            }

            const newItem = new model(data);
            const savedItem = await newItem.save();

            res.status(201).json(savedItem);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // === [PUT] ===
    app.put(`/${route}/:id`, async (req, res) => {
        try {
            const updated = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updated) return res.status(404).json({ message: "Không tìm thấy bản ghi" });

            res.json(updated);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // === [DELETE] ===
    app.delete(`/${route}/:id`, async (req, res) => {
        try {
            const deleted = await model.findByIdAndDelete(req.params.id);
            if (!deleted) return res.status(404).json({ message: "Không tìm thấy bản ghi" });

            res.json({ message: "Xóa thành công", deleted });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
};

// Tạo API với populate cho WarehouseGoods
const misaWarehouseGoodsRoutes = require("./routes/misaWarehouseGoodsRouter");
const kiotVietProductBranchesRouter = require("./routes/kiotVietProductBranchesRouter");
const purchaseOrderRouter = require("./routes/purchaseOrderRouter");
const GetSaleInventoryOutbyVoucherNoRouter = require("./routes/GetSaleInventoryOutbyVoucherNoRouter");

const saleRoutes = require("./routes/saleRouter");
const inventoryOutsRoutes = require("./routes/InventoryOutsRouter");
const inventoryInsRoutes = require("./routes/InventoryInsRouter");

const MiSaWarehouseRoutes = require("./routes/MiSaWarehouseRouter");
const receiptsRouter = require("./routes/receiptsRouter");

const KiotViet_ProductBranch = require("./models/KiotViet_ProductBranch");

app.use("/misa-warehouse-goods", misaWarehouseGoodsRoutes);
app.use("/kiotviet-products-branches", kiotVietProductBranchesRouter);
app.use("/kiotViet-purchase-order", purchaseOrderRouter);
app.use("/getSaleByVoucher",GetSaleInventoryOutbyVoucherNoRouter);
app.use("/misa-sales", saleRoutes);
app.use("/misa-inventory-outs", inventoryOutsRoutes);
app.use("/misa-inventory-ins", inventoryInsRoutes);

app.use("/misa-warehouses", MiSaWarehouseRoutes);
app.use("/misa-receipts", receiptsRouter);

  
// Tạo API cho từng schema
  createCrudRoutes(Customers, 'misa-customers');
  createCrudRoutes(Receipts, 'misa-receipts');
  createCrudRoutes(Sales, 'misa-sales',['sale_items']);
  createCrudRoutes(Banks, 'misa-banks');
  createCrudRoutes(InventoryOuts, 'misa-inventory-outs');
//   createCrudRoutes(InventoryIns, 'misa-inventory-ins');
  createCrudRoutes(SaleItems, 'misa-sale-items');
  createCrudRoutes(Goods, 'misa-goods');
  createCrudRoutes(MiSa_Warehouse, 'misa-warehouses');
  createCrudRoutes(Employer, 'misa-employers');

  // createCrudRoutes(MiSa_WarehouseGoods, 'misa-warehouse-goods', ['goods']);

  
  createCrudRoutes(KiotViet_Customer, 'kiotviet-customers');
  createCrudRoutes(KiotViet_Category, 'kiotviet-categories');
  createCrudRoutes(KiotViet_Branch, 'kiotviet-branchs');
  createCrudRoutes(KiotViet_Product, 'kiotviet-products');
  createCrudRoutes(KiotViet_SupplierSchema, 'kiotviet-suppliers');
  createCrudRoutes(KiotViet_PurchaseOrder, 'kiotViet-purchase-order');
  createCrudRoutes(KiotVietWarehouseSchema, 'kiotViet-warehouse');




server.listen(PORT, () => {
    console.log("listening on *: " + PORT);
});
