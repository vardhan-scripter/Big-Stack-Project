const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jsonwt = require("jsonwebtoken");
const key = require("../../setup/dbconfig");

//@type   GET
//@route   /api/auth
//@desc   testing purpose
//@access   PUBLIC

router.get('/',(req,res) => res.json({test : "successfully data sent"}));

//@type   POST
//@route   /api/auth/register
//@desc   User registration
//@access   PUBLIC

const Person = require("../../models/Person");


router.post('/register',(req,res) => {
    Person.findOne({ email: req.body.email })
    .then( person => {
        if(person){
            return res
            .status(400)
            .json({emailerror: "email is already exists"})
        }else{
            const newPerson = new Person({
                name : req.body.name,
                email : req.body.email,
                password : req.body.password
            })
            //Encrypt password using bcrypt
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPerson.password, salt, (err, hash) => {
                if (err) throw err;
                newPerson.password = hash;
                newPerson
                    .save()
                    .then(person => res.json(person))
                    .catch(err => console.log(err));
                });
            });
        }
    })
    .catch(err => console.log(err))

});

//@type   POST
//@route   /api/auth/login
//@desc   User Authentication
//@access   PUBLIC

router.post("/login", (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    Person.findOne({email})
        .then(person => {
            if(!person){
                return res
                    .status(404)
                    .json({error : "email not exists"})
            }
            bcrypt
            .compare(password, person.password)
                .then(isPerson => {
                    if(isPerson){
                        // res.json({ success: "User is able to login successfully" });
                        //use payload and create token for user
                        const payload = {
                            id: person.id,
                            name: person.name,
                            email: person.email
                        };
                        jsonwt.sign(
                            payload,
                            key.secret,
                            { expiresIn: 3600 },
                            (err, token) => {
                            res.json({
                                success: true,
                                token: "Bearer " + token
                            });
                            }
                        );
                    }else{
                        return res.json({error : "password is not correct"})
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
})

module.exports = router;