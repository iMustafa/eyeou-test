const Contests = require('../models/contest.model.js');

// Create and Save a new contest
exports.create = (req, res) => {

    // Validate request
    if (!req.body.contest_name) {
        return res.status(400).send({
            message: "Contests content can not be empty"
        });
    }

    // Create a contest
    const contests = new Contests({
        prize_money: req.body.prize_money,
        start_date: req.body.start_date,
        contest_name: req.body.contest_name,
        openphase_duration: req.body.openphase_duration,
        contest_title: req.body.contest_title,
        submit_time: req.body.submit_time,
        review_time: req.body.review_time,
        bgprofile_image: req.body.bgprofile_image,
        entry_price: req.body.entry_price,
        results: req.body.results,
        review_startdate: req.body.review_startdate,
        reviewphase_duration: req.body.reviewphase_duration,
        close_date: req.body.close_date,
        type: req.body.type
    });

    // Save contest in the database
    contests.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Contests."
            });
        });

};

// Retrieve and return all contests from the database.
exports.findAll = (req, res) => {

    Contests.find()
        .then(contests => {
            res.send(contests);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving contests."
            });
        });

};

// Find a single contest with a contestId
exports.findOne = (req, res) => {

    Contests.findById(req.params.contestsId)
        .then(contests => {
            if (!contests) {
                return res.status(404).send({
                    message: "Contests not found with id " + req.params.contestsId
                });
            }
            res.send(contests);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Contest not found with id " + req.params.contestsId
                });
            }
            return res.status(500).send({
                message: "Error retrieving contests with id " + req.params.contestsId
            });
        });

};

// Update a contest identified by the contestId in the request
exports.update = (req, res) => {

    // Validate Request
    if (!req.body.contest_name) {
        return res.status(400).send({
            message: "Contests name can not be empty"
        });
    }

    // Find contest and update it with the request body
    Contests.findByIdAndUpdate(req.params.contestsId, {
            prize_money: req.body.prize_money,
            start_date: req.body.start_date,
            contest_name: req.body.contest_name,
            openphase_duration: req.body.openphase_duration,
            contest_title: req.body.contest_title,
            submit_time: req.body.submit_time,
            review_time: req.body.review_time,
            bgprofile_image: req.body.bgprofile_image,
            entry_price: req.body.entry_price,
            results: req.body.results,
            review_startdate: req.body.review_startdate,
            reviewphase_duration: req.body.reviewphase_duration,
            close_date: req.body.close_date,
            type: req.body.type
        }, { new: true })
        .then(contests => {
            if (!contests) {
                return res.status(404).send({
                    message: "Contest not found with id " + req.params.contestsId
                });
            }
            res.send(contests);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Contest not found with id " + req.params.contestsId
                });
            }
            return res.status(500).send({
                message: "Error updating contest with id " + req.params.contestsId
            });
        });

};

// Delete a contest with the specified contestId in the request
exports.delete = (req, res) => {

    console.log(req.params.contestsId);

    Contests.findByIdAndRemove(req.params.contestsId)
        .then(contests => {
            if (!contests) {
                return res.status(404).send({
                    message: "Contest not found with id " + req.params.contestsId
                });
            }
            res.send({ message: "Contest deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Contest not found with id " + req.params.contestsId
                });
            }
            return res.status(500).send({
                message: "Could not delete contest with id " + req.params.contestsId
            });
        });


};