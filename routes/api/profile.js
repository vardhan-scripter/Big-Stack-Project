const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Person = require("../../models/Person");

const Profile = require("../../models/Profile");

// @type    GET
//@route    /api/profile/
// @desc    route for personnal user profile
// @access  PRIVATE

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id })
        .then(profile => {
          if (!profile) {
            return res.status(404).json({ profilenotfound: "No profile Found" });
          }
          res.json(profile);
        })
        .catch(err => console.log("got some error in profile " + err));
    }
  );

//@type   POST
//@route   /api/profile
//@desc   route for UPDATING/SAVING user profile
//@access   PRIVATE

router.post(
    "/",
    passport.authenticate("jwt",{session: false}),
    (req, res) => {
        const profileValues = {};
        profileValues.user = req.user.id;
        if (req.body.username) profileValues.username = req.body.username;
        if (req.body.website) profileValues.website = req.body.website;
        if (req.body.country) profileValues.country = req.body.country;
        if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        if (typeof req.body.languages !== undefined) {
        profileValues.languages = req.body.languages.split(",");
        }
        //get social links
        profileValues.social = {};

        if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
        if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
        if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

        Profile.findOne({user: req.user.id})
        .then(profile => {
            if(profile){
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileValues },
                    { new: true }
                )
                .then(profile => res.json(profile))
                .catch(err => console.log(err));
            }else{
                Profile.findOne({username: profileValues.username})
                .then(profile => {
                    if(profile){
                        res.status(400).json({error: "username already exists"});
                    }

                    new Profile(profileValues)
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err))
            }
        })
        .catch();
    }
);

//@type   GET
//@route   /api/profile/:username
//@desc   getting user profile based on username
//@access   PUBLIC
router.get("/:username", (req, res) => {
        Profile.findOne({username: req.params.username})
        .populate("user", ["name","profilePic"])
        .then(profile => {
            if(!profile){
                res.status(404).json({ usernotfound: "user not found"});
            }
            res.json(profile);
        })
        .catch(err => console.log(err));
    });

// //@type   GET
// //@route   /api/profile/:id
// //@desc   Assignment : getting user profile based on id
// //@access   PUBLIC
// router.get("/:_id", (req, res) => {
//     Profile.findOne({_id: req.params._id})
//     .populate("user", ["name","profilePic"])
//     .then(profile => {
//         if(!profile){
//             res.status(404).json({ usernotfound: "user not found"});
//         }
//         res.json(profile);
//     })
//     .catch(err => console.log(err));
// });

//@type   GET
//@route   /api/profile/find/everyone
//@desc   getting all profiles
//@access   PUBLIC
router.get("/find/everyone", (req, res) => {
    Profile.find()
    .populate("user", ["name","profilePic"])
    .then(profiles => {
        if(!profiles){
            res.status(404).json({ profilesnotfound: "No data found"});
        }
        res.json(profiles);
    })
    .catch(err => console.log(err));
});

//@type   DELETE
//@route   /api/profile/
//@desc   route to delete user profile
//@access   PRIVATE
router.delete("/", passport.authenticate("jwt",{session: false}),(req, res) => {
    Profile.findOne({ user: req.user.id })
    Profile.findOneAndRemove({ user: req.user.id })
    .then( () => {
        Person.findByIdAndRemove({ _id: req.user.id })
        .then( () => res.json( {success: "delete was successfull"}))
        .catch( err => console.log(err));
    })
    .catch( err => console.log(err));
})

//@type   POST
//@route   /api/profile/workrole
//@desc   route to add work profile
//@access   PRIVATE
router.post(
    "/workrole",
    passport.authenticate("jwt",{session: false}),
    (req, res) => {
        Profile.findOne({user: req.user.id})
        .then( profile => {
            const newWork = {
                role: req.body.role,
                company: req.body.company,
                country: req.body.country,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                details: req.body.details
            }
            profile.workrole.push(newWork);
            profile.save()
            .then(profile => res.json(profile))
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err));

})

//@type   DELETE
//@route   /api/profile/workrole/:w_id
//@desc   route to delete work profile
//@access   PRIVATE
router.delete(
    "/workrole/:w_id",
    passport.authenticate("jwt",{session: false}),
    (req, res) => {
        Profile.findOne({user: req.user.id})
        .then( profile => {
            const removeworkrole = profile.workrole.map(item => item._id).indexOf(req.params.w_id);
            profile.workrole.splice(removeworkrole, 1); 

            profile.save()
            .then(profile => res.json(profile))
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
})


module.exports = router;