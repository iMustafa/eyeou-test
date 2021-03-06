const Users = require('../models/users.model.js');
const Contests = require('../models/contest.model');
const emailHelper = require('../helpers/mail.helper');
var nodemailer = require("nodemailer");


// Create and Save a new User
exports.create = (req, res) => {

  // Validate request
  if (!req.body.email) {
    return res.status(400).send({
      message: "email name cannot be empty"
    });
  }
  // Create a User
  const users = new Users({
    email: req.body.email,
    access_code: ''
  });

  Users.find({
    email: req.body.email
  }).then((data) => {
    if (data == '') {
      // Save User in the database
      users.save()
        .then(data => {
          res.send(data);
        }).catch(err => {
          res.status(500).send({
            message: err.message || "Some error occurred while creating the Users."
          });
        });

    } else {
      console.log("Data ", data);
      return res.status(404).send({
        message: "Email already exists with emailId = " + data[0].email
      });
    }

  });



};

// Retrieve and return all Users from the database.
exports.findAll = (req, res) => {

  Users.find()
    .then(Users => {
      res.send(Users);
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Users."
      });
    });

};

// Find a single User with a UserId
exports.findOne = (req, res) => {

  Users.findById(req.params.usersId)
    .then(Users => {
      if (!Users) {
        return res.status(404).send({
          message: "Users not found with id " + req.params.usersId
        });
      }
      res.send(Users);
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "User not found with id " + req.params.usersId
        });
      }
      return res.status(500).send({
        message: "Error retrieving Users with id " + req.params.usersId
      });
    });

};

// Find a single User with a UserId
exports.findEmail = (req, res) => {
  const { lang } = req.params;
  Users.findOne({
    email: req.params.email
  })
    .then(Usersres => {
      const access_code = Math.floor(1000 + Math.random() * 9000);
      if (!Usersres) {

        const newusers = new Users({
          email: req.params.email,
          acess_code: access_code
        });
        newusers.save()
          .then(data => {
            emailHelper.sendEmail({
              $mailTo: req.params.email,
              $subject: emailHelper.validationEmailTemplate(lang, access_code).subject,
              $html: emailHelper.validationEmailTemplate(lang, access_code).html
            }).then(mail => res.send(data))
          })
          .catch(err => {
            res.status(500).send({
              message: err.message || "Some error occurred while creating the Users."
            });
          });

      } else {

        Users.findByIdAndUpdate(Usersres._id, { acess_code: access_code }, { new: true })
          .then(data => {
            emailHelper.sendEmail({
              $mailTo: data.email,
              $subject: emailHelper.validationEmailTemplate(lang, access_code).subject,
              $html: emailHelper.validationEmailTemplate(lang, access_code).html
            })
              .then(mailSent => res.status(200).json(data))
              .catch(mailError => res.status(403).json(mailError))
          });
      }
    }).catch(err => res.status(500).json(err));

};


// Update a User identified by the UserId in the request
exports.update = (req, res) => {
  if (!req.body.email) {
    return res.status(400).send({
      message: "useremail can not be empty"
    });
  }
  Users.findByIdAndUpdate(req.params.usersId,
    {
      email: req.body.email,
    },
    {
      new: true
    })
    .then(Users => {
      if (!Users) {
        return res.status(404).send({
          message: "User not found with id " + req.params.usersId
        });
      }
      res.send(Users);
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "User not found with id " + req.params.usersId
        });
      }
      return res.status(500).send({
        message: "Error updating User with id " + req.params.usersId
      });
    });

};

// Delete a User with the specified UserId in the request
exports.delete = (req, res) => {
  Users.findByIdAndRemove(req.params.usersId)
    .then(Users => {
      if (!Users) {
        return res.status(404).send({
          message: "User not found with id " + req.params.usersId
        });
      }
      res.send({
        message: "User deleted successfully!"
      });
    }).catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "User not found with id " + req.params.usersId
        });
      }
      return res.status(500).send({
        message: "Could not delete User with id " + req.params.usersId
      });
    });
};

exports.verify = (req, res) => {
  if (!req.body.email) {
    return res.status(400).send({
      message: "email name cannot be empty"
    })
  } else {
    Users.findOne({
      email: req.body.email
    })
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: "Email not exists "
          });
        } else {
          if (data.acess_code == req.body.acess_code) {
            res.status(200).json({
              message: true
            });

          } else {
            res.status(200).json({
              message: false
            });
          }
        }
      });
  }
}

exports.getUserImages = (req, res) => {
  Users
    .findById(req.params.id)
    .populate('images')
    .exec()
    .then(user => res.status(200).json(user))
    .catch(err => res.status(403).json(err));
}

exports.joinFreeContest = (req, res) => {
  const { userId, contestId } = req.body;
  Promise
    .all([
      Users.findByIdAndUpdate(userId, { $push: { contests: contestId } }).exec(),
      Contests.findByIdAndUpdate(contestId, { $push: { users: userId } }).exec()
    ])
    .then(info => res.status(200).json(info))
    .catch(err => res.status(403).json(err));
}

exports.notify = (req, res) => {
  const { email, full_name } = req.body;
  Users.findOne({ email }).exec()
    .then(async $user => {
      if ($user) {
        const user = await Users.findOneAndUpdate({ email }, { notify: true }).exec()
        res.status(200).json(user)
      } else {
        const user = await new Users({ email, full_name, notify: true }).save()
        res.status(200).json(user)
      }
    })
    .catch(error => res.status(500).json(error))
}