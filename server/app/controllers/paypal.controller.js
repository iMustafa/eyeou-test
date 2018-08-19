const paypal = require('paypal-rest-sdk');
const paypalHelper = require('../helpers/paypal.helper');
const Transaction = require('../models/transactions.model');
const User = require('../models/users.model');
const Contest = require('../models/contest.model');

exports.check = (req, res) => {
  const { user, contest } = req.params
  Transaction
    .findOne({ user, contest })
    .exec()
    .then(document => {
      res.status(200).json(document)
    })
    .catch(error => {
      res.status(500).send(error)
    })
}

exports.create = (req, res) => {
  const redirect_urls = {
    return_url: process.env.paypal_return_url,
    cancel_url: process.env.paypal_cancel_url
  };
  const paymentJSON = new paypalHelper.Payment(redirect_urls, req.body.items);

  paypal.payment.create(paymentJSON, (error, payment) => {
    if (error) {
      res.status(403).send(error);
    } else {
      for (var index = 0; index < payment.links.length; index++) {
        if (payment.links[index].rel === 'approval_url') {
          res.status(200).json({ approval_url: payment.links[index].href });
        }
      }
    }
  });
}

exports.execute = (req, res) => {
  const amountReducer = (a, b) => (parseFloat(a.price) + parseFloat(b.price))
  const execute_payment_json = {
    payer_id: req.body.PayerID,
    transactions: [{
      amount: {
        currency: 'USD',
        total: req.body.items.length > 1 ? req.body.items.reduce(amountReducer) : req.body.items[0].price
      }
    }]
  };
  const { paymentId, user, contest } = req.body;

  paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
    if (error) {
      console.log('>> Error excuting:', error)
      res.status(403).send(error);
    } else {
      payment.transactions.forEach(transaction => {
        delete transaction.related_resources;
      })
      payment.user = user
      payment.contest = contest
      const trans = new Transaction(payment)
      try {
        console.log(user, contest)
        const transSaved = await trans.save();
        const userUpdate = await User.findOneAndUpdate({_id: user}, { $push: { contests: contest } }).exec();
        const contestUpdate = await Contest.findOneAndUpdate({_id: contest}, { $push: { users: user } }).exec();

        return res.status(200).json({ trans, contestUpdate })
      } catch (e) {
        console.log('>> ERROR SAVING', e)
        return res.status(403).json(e)
      }
    }
  });
}