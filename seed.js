const mongoose = require('mongoose');
const Customers = require('./models/CustomersSchema');
const Receipts = require('./models/ReceiptsSchema');
const Sales = require('./models/SalesSchema');
const Banks = require('./models/BanksSchema');
const InventoryOuts = require('./models/InventoryOutsSchema');
const SaleItems = require('./models/SaleItemsSchema');
const Goods = require('./models/GoodsSchema');

mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedData = async () => {
  try {
    await mongoose.connection.dropDatabase();

    // Thêm dữ liệu mẫu vào từng collection

    const customers = await Customers.insertMany([
      { name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0987654321' },
      { name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0971234567' }
    ]);

    const receipts = await Receipts.insertMany([
      { amount: 1000000, customer: customers[0]._id, date: new Date() },
      { amount: 500000, customer: customers[1]._id, date: new Date() }
    ]);

    const banks = await Banks.insertMany([
      { Number: '123456789', Bank_name: 'Vietcombank', Branch: 'Hà Nội', Holder: 'Nguyễn Văn A', Status: true },
      { Number: '987654321', Bank_name: 'Techcombank', Branch: 'TP HCM', Holder: 'Trần Thị B', Status: true }
    ]);

    const goods = await Goods.insertMany([
      { name: 'Áo thun nam', price: 200000, stock: 50 },
      { name: 'Quần jean nữ', price: 350000, stock: 30 }
    ]);

    const sales = await Sales.insertMany([
      { customer: customers[0]._id, totalAmount: 500000, date: new Date() },
      { customer: customers[1]._id, totalAmount: 700000, date: new Date() }
    ]);

    const saleItems = await SaleItems.insertMany([
      { Good: goods[0]._id, Quantity: 2, Sale: sales[0]._id },
      { Good: goods[1]._id, Quantity: 1, Sale: sales[1]._id }
    ]);

    const inventoryOuts = await InventoryOuts.insertMany([
      { Good: goods[0]._id, Quantity: 10, date: new Date() },
      { Good: goods[1]._id, Quantity: 5, date: new Date() }
    ]);

    console.log('✅ Dữ liệu đã được chèn thành công!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Lỗi khi chèn dữ liệu:', error);
    mongoose.connection.close();
  }
};

// Gọi function để chạy seed dữ liệu
seedData();
