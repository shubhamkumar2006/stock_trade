const mongoose = require("mongoose");
const { OrdersSchema } = require("../schemas/OrdersSchema");

const OrdersModel = mongoose.models.order || mongoose.model("order", OrdersSchema);
module.exports = {OrdersModel};