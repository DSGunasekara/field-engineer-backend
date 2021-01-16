const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemName:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    qty:{
        type: Number,
        required: true
    },
    allocatedQty:{
        type: Number,
        required: true,
        default: 0
    },
    inventoryLocation:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Item", ItemSchema);