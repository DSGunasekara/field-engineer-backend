const router = require("express").Router();
const Job = require("../models/Job");
const User = require("../models/User");
const Item = require("../models/Item");
const verify = require("../middleware/verify");

//get items 
router.get('/' ,async(req, res)=>{
    try {
        const items = await Item.find({})
        return res.status(200).send(items)
    } catch (error) {
        return res.status(500).send(error)
    }
});

router.get('/:id', async(req, res)=>{
    try {
        const item = await Item.findById(req.params.id)
        if(!item) return res.status(404).send("Item not found")
        return res.status(200).send(item)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post('/', async(req, res)=>{
    try {
        const item = new Item({...req.body})
        await item.save()
 
        return res.status(200).send(item)
    } catch (error) {
        return res.status(500).send(error)
    }
});

router.patch('/:id', async(req, res)=>{
    try {
        const item = await Item.findById(req.params.id)
        if(!item) return res.status(404).send("Item not found")
        await Item.updateOne({ _id: req.params.id }, {...req.body});
        return res.status(200).send("Item Updated")
    } catch (error) {
        return res.status(500).send(error)
    }
});

router.delete('/:id', async(req, res)=>{
    try {
        const item = await Item.findById(req.params.id)
        if(!item) return res.status(404).send("Item not available")
        await item.remove()
        return res.status(200).send("Item deleted")
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router;