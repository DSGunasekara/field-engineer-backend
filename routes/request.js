const router = require("express").Router();
const Job = require("../models/Job");
const User = require("../models/User");
const Item = require("../models/Item");
const RequestItem = require('../models/Request')
const verify = require("../middleware/verify");
const { findById } = require("../models/Request");

router.get('/', async(req, res)=>{
    try {
        await RequestItem.find().populate({path: "item",}
          ).populate({
                path: "requestedUser",
                select: "-password"
          })
          .exec()
          .then((requests, error) => {
            if (error) return res.status(400).send(error);
            return res.status(200).send(requests);
          });
    } catch (error) {
        return res.status(500).send(error)
    }
});

router.get('/:id', async(req, res)=>{
    try {
        await RequestItem.findById(req.params.id).populate({path: "item",}
        ).populate({
              path: "requestedUser",
              select: "-password"
        })
        .exec()
        .then((requests, error) => {
          if (error) return res.status(400).send(error);
          return res.status(200).send(requests);
        });
    } catch (error) {
        return res.status(500).send(error)
    }
});

router.post('/', async(req, res)=>{
    try {
        const user = await User.findById(req.body.requestedUser)
        if(!user) {
            console.log('no user');
            return res.status(404).send("No user found")
        }

        const item = await Item.findById(req.body.item);
        if(!item) {
            console.log('no item');
            return res.status(404).send("No item found");
        }

        const requestItem = new RequestItem({...req.body});

        if((item.qty - item.allocatedQty) < requestItem.qty){
            return res.status(400).send("Not enough items")
        }

        // item.allocatedQty += requestItem.qty;
        await item.save()

        await requestItem.save()
        return res.status(200).send(requestItem)
    } catch (error) {
        return res.status(500).send(error)
    }
});

router.patch('/:id', async(req, res)=>{
    try {
        const requestItem = await RequestItem.findById(req.params.id)
        if(!requestItem) return res.status(404).send("No request found")
        await RequestItem.updateOne({ _id: req.params.id }, {...req.body});
        return res.status(200).send("Item Updated")
    } catch (error) {
        return res.status(500).send(error)
    }
});

router.delete('/:id', async(req, res)=>{
    try {
        const requestItem = await RequestItem.findById(req.params.id)
        if(!requestItem) return res.status(404).send("No request found")
        const item = await Item.findById(requestItem.item)
        if(!item) return res.status(404).send("Item not found")
        item.allocatedQty -= requestItem.qty
        await item.save()
        await requestItem.remove()
        return res.status(200).send("Request deleted")
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router;