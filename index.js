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
const MONGO_URI = "mongodb+srv://thienduc2552003:Ag1RjZY8IHBomCD3@mockdata.hacn2.mongodb.net/MockData?retryWrites=true&w=majority";

// Kết nối MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
}).catch(err => {
    console.error("❌ Lỗi kết nối MongoDB: ", err);
});
// API CRUD chung
const createCrudRoutes = (model, route) => {
    app.get(`/${route}`, async (req, res) => {
      try {
        const items = await model.find();
        res.json(items);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    app.get(`/${route}/:id`, async (req, res) => {
      try {
        const item = await model.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    app.post(`/${route}`, async (req, res) => {
      try {
        console.log(newItem);
        const newItem = new model(req.body);
        await newItem.save();
        res.status(201).json(newItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    app.put(`/${route}/:id`, async (req, res) => {
      try {
        const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ error: 'Not found' });
        res.json(updatedItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    app.delete(`/${route}/:id`, async (req, res) => {
      try {
        const deletedItem = await model.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  };
  
  // Tạo API cho từng schema
  createCrudRoutes(Customers, 'misa-customers');
  createCrudRoutes(Receipts, 'misa-receipts');
  createCrudRoutes(Sales, 'misa-sales');
  createCrudRoutes(Banks, 'misa-banks');
  createCrudRoutes(InventoryOuts, 'misa-inventory-outs');
  createCrudRoutes(SaleItems, 'misa-sale-items');
  createCrudRoutes(Goods, 'misa-goods');
  createCrudRoutes(MiSa_Warehouse, 'misa-warehouse');

  createCrudRoutes(KiotViet_Customer, 'kiotviet-customers');
  createCrudRoutes(KiotViet_Category, 'kiotviet-categories');
  createCrudRoutes(KiotViet_Branch, 'kiotviet-branchs');
  createCrudRoutes(KiotViet_Product, 'kiotviet-products');
  createCrudRoutes(KiotViet_SupplierSchema, 'kiotviet-suppliers');
  createCrudRoutes(KiotViet_PurchaseOrder, 'kiotViet-purchase-order');




server.listen(PORT, () => {
    console.log("listening on *: " + PORT);
});
