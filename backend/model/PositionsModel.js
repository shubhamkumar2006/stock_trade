const mongoose = require("mongoose");
const { PositionsSchema } = require("../schemas/PositionsSchema");

const PositionsModel = mongoose.models.position || mongoose.model("position", PositionsSchema);

module.exports = {PositionsModel};