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
    price:{
        type: String,
        required: true
    },
    inventoryLocation:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Item", ItemSchema);