const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    parentId: { type: Number, default: null },
    categoryName: { type: String, required: true },
    retailerId: { type: Number, required: true },
    modifiedDate: { type: Date, required: true },
    createdDate: { type: Date, required: true },
    rank: { type: Number, default: 0 }
});

module.exports = mongoose.model("Category", CategorySchema);


/*
{
    "total": 31,
    "pageSize": 20,
    "data": [
        {
            "categoryId": 546661,
            "parentId": 553478,
            "categoryName": "SỮA TRẺ EM",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T15:24:09.8200000",
            "createdDate": "2023-11-22T09:03:32.2800000",
            "rank": 0
        },
        {
            "categoryId": 546719,
            "parentId": 553478,
            "categoryName": "SỮA NGƯỜI LỚN",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T15:10:23.8900000",
            "createdDate": "2023-11-22T10:52:10.9330000",
            "rank": 0
        },
        {
            "categoryId": 546835,
            "parentId": 553478,
            "categoryName": "BỘT ĂN DẶM",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T16:44:59.3230000",
            "createdDate": "2023-11-22T14:35:33.1700000",
            "rank": 0
        },
        {
            "categoryId": 546843,
            "parentId": 553510,
            "categoryName": "TRÀ",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T17:12:45.0670000",
            "createdDate": "2023-11-22T14:47:00.8970000",
            "rank": 0
        },
        {
            "categoryId": 546848,
            "categoryName": "THỰC PHẨM CHỨC NĂNG",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-11-22T14:52:39.0070000",
            "rank": 1
        },
        {
            "categoryId": 547134,
            "parentId": 553479,
            "categoryName": "SỮA NGOẠI",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T15:11:57.4530000",
            "createdDate": "2023-11-23T08:34:49.5870000",
            "rank": 0
        },
        {
            "categoryId": 548352,
            "categoryName": "MEN SỐNG",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-11-25T09:26:21.5630000",
            "rank": 0
        },
        {
            "categoryId": 548381,
            "categoryName": "TÃ & BỈM",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-11-25T10:15:04.0200000",
            "rank": 0
        },
        {
            "categoryId": 549410,
            "categoryName": "HÀNG NGA",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-11-27T23:23:22.2770000",
            "rank": 6
        },
        {
            "categoryId": 549420,
            "parentId": 553479,
            "categoryName": "SỮA NƯỚC",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T15:12:05.0300000",
            "createdDate": "2023-11-28T07:08:24.3670000",
            "rank": 0
        },
        {
            "categoryId": 551061,
            "parentId": 553478,
            "categoryName": "NƯỚC",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T16:46:23.7000000",
            "createdDate": "2023-12-01T17:47:36.6870000",
            "rank": 0
        },
        {
            "categoryId": 553086,
            "parentId": 553510,
            "categoryName": "KEM ĐÁNH RĂNG",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T16:53:30.4000000",
            "createdDate": "2023-12-07T21:16:38.0870000",
            "rank": 0
        },
        {
            "categoryId": 553087,
            "categoryName": "MỸ PHẨM",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-12-07T21:24:02.9270000",
            "rank": 0
        },
        {
            "categoryId": 553260,
            "categoryName": "GIẤY",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-12-08T17:50:39.9500000",
            "rank": 0
        },
        {
            "categoryId": 553478,
            "parentId": 553479,
            "categoryName": "NATRUMAX",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T15:11:48.6130000",
            "createdDate": "2023-12-09T15:09:54.6330000",
            "rank": 0
        },
        {
            "categoryId": 553479,
            "categoryName": "SỮA",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-12-09T15:11:41.5600000",
            "rank": 0
        },
        {
            "categoryId": 553510,
            "categoryName": "HÀNG HÀN QUỐC",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-12-09T16:53:12.3330000",
            "rank": 7
        },
        {
            "categoryId": 553511,
            "parentId": 553510,
            "categoryName": "NƯỚC HỒNG SÂM",
            "retailerId": 500370926,
            "modifiedDate": "2023-12-09T17:01:32.0530000",
            "createdDate": "2023-12-09T17:01:22.2500000",
            "rank": 0
        },
        {
            "categoryId": 555503,
            "categoryName": "ngu coc",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-12-18T09:31:21.0700000",
            "rank": 0
        },
        {
            "categoryId": 558589,
            "categoryName": "hàng tết",
            "retailerId": 500370926,
            "modifiedDate": "2025-03-12T22:11:46.7600000",
            "createdDate": "2023-12-30T17:47:49.2130000",
            "rank": 5
        }
    ],
    "timestamp": "2025-03-23T16:20:57.6524797+07:00"
}
 */