const {Schema} = require("mongoose");
const PositionsSchema = new Schema({
    product : String,
    name : String,
    qty: Number,
    price: Number,
    net: String,
    day:String,
    isLosss: Boolean,
})
module.exports = {PositionsSchema};