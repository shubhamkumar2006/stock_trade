const {Schema} = require("mongoose");

const OrdersSchema = new Schema({
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    Price: { type: Number, min: 0 },
    model: { type: String, trim: true },
}, { timestamps: true });

module.exports = { OrdersSchema };