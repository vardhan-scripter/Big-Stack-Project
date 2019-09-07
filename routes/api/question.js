const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Person = require("../../models/Person");

const Profile = require("../../models/Profile");

const Question = require("../../models/Question");

// @type    GET
//@route    /api/questions
// @desc    route for showing all questions
// @access  PUBLIC

router.get("/", (req, res) => {
    Question.find().sort({date: "desc"})
    .then( questions => {
        res.json(questions);
    })
    .catch( err => res.json({noquestions: "no questions to display"}));
});

// @type    POST
//@route    /api/questions/
// @desc    route for submitting questions
// @access  PRIVATE

router.post("/",passport.authenticate("jwt", {session: false}), (req, res) => {
    const newQuestion = new Question({
        textOne: req.body.textone,
        textTwo: req.body.texttwo,
        user: req.user.id,
        name: req.body.name
    });

    newQuestion.save()
    .then( question => res.json(question))
    .catch(err => console.log("unable to push question to database" + err));
})

// @type    POST
//@route    /api/question/answer/:q_id
// @desc    route for answer of question
// @access  PRIVATE

router.post("/answer/:q_id",passport.authenticate("jwt", {session: false}), (req, res) => {
    Question.findById(req.params.q_id)
    .then(question => {
        const answer = {
            user : req.user.id,
            text : req.body.text,
            name : req.body.name
        }

        question.answers.unshift(answer);
        question.save()
        .then(question => res.json(question))
        .catch( err => console.log(err));
    })
    .catch( err => console.log(err));
})

// @type    POST
//@route    /api/question/upvote/:q_id
// @desc    route for upvote of question
// @access  PRIVATE

router.post("/upvote/:q_id",passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Question.findById(req.params.q_id)
        .then(question => {
            if(question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length>0){
                return res.status(400).json({noupvote: "user is already upvoted"})
            }
            question.upvotes.unshift({user: req.user.id});
            question.save()
            .then(question => res.json(question))
            .catch(err => console.log(err));
        })
        .catch( err => console.log(err));
    })
    .catch(err => console.log(err));
})

module.exports = router;