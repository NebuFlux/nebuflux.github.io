const mongoose = require('mongoose');
const Alert = require('../models/alert');
const Model = mongoose.model('alert');

//GET: /alerts/:skip - lists all the alerts
// Response forces HTML status code and JSON 
// message to the requiresting client
const alertsList = async(req, res) => {

    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const sort = req.query.sort || 'reported';
        const order = req.query.order == 'asc' ? 1 : -1;
        const category = req.query.category;
        const search = req.query.search;
        const from = req.query.from;
        const to = req.query.to;

        const pipeline = [];
        
        const match = {};
        if (category) match.category = category;
        if (search) {
            match.$or = [
                { source: {$regex: search, $options: 'i'}},
                { destination: { $regex: search, $options: 'i'}}
            ];
        }
        if (from || to) {
            if (from) match.reported.$get = new Date(from);
            if (to) match.reported.$lte = new Date(to);
        }

        if (Object.keys(match).length > 0){
            pipeline.push({$match: match});
        }

        pipeline.push({
            $facet: {
                metadata: [{$count: 'total' }],
                alerts: [
                    { $sort: { [sort]: order}},
                    { $skip: (page-1) * limit },
                    { $limit: limit }
                ]
            }
        });

        const [result] = await Model.aggregate(pipeline);
        const total = result.metadata[0]?.total || 0;
        
        // Uncomment to show query results on console
        // console.log(result);

        return res.status(200).json({
            alerts: result.alerts,
            total,
            page,
            limit,
            pages: Math.ceil(total/limit)
        });
    } catch (err){
        return res.status(err.status || 400)
                .json({message: err.message});
    }
};

const heartBeat = async(req, res) =>{
    return res.sendStatus(200);
}

//GET: /alerts/:alertId - lists a single alert
// Response forces HTML status code and JSON 
// message to the requiresting client
const alertsFindByID = async(req, res) => {
    const q = await Model
        .findById(req.params.alertId) // Return single record
        .exec();

        // Uncomment to show query results on console
        // console.log(q);

    if(!q)
    {   // Database returned no data
        return res.status(404).json({message: "Alert not found!"});
    } else { //Return result list
        return res.status(200).json(q);    
    }
};

// POST: /alerts - Adds a new Alert
// Regardless of outcome, response must include HTML, status code
// and JSON message to the requesting client
const alertsAddAlerts = async(req, res) => {
    const newAlerts = [];
    for (item of req.body){
        let newAlert = new Alert(item);
        newAlerts.push(newAlert);
    }

    try{
    const q = await Model.insertMany(newAlerts);
    if(!q){
        // Database returned no data
        return res
            .status(400)
            .json({message: "failed to create alert"});
    } else { // Return new alert
        return res
            .status(201)
            .json(q);
    }
    } catch (err) {
        return res.status(400).json({message: err.message});
    }

    
}


const alertsDeleteAlert = async(req, res) =>{
    try{
        const q = await Model
        .findByIdAndDelete(req.params.alertId)
        .exec();

        if(!q){
            // Database couldn't find any records
            return res.status(404).json({message: "Alert not found!"});
        } else {
            return res.status(200).json(q);
        }
    }catch(err){
        console.error("Delete alert failed:", {
            message: err.message,
            stack: err.stack,
            name: err.name,
            code: err.code,           // MongoDB error code if present
            fullError: err            // sometimes helpful to see the whole object
        });
        return res.status(500).json(err);
    }
}

module.exports = {
    alertsList,
    heartBeat,
    alertsFindByID, 
    alertsAddAlerts, 
    alertsDeleteAlert};