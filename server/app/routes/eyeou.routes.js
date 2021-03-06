const multer = require('multer');
const passport = require('passport');
const contestMiddlewares = require('../middlewares/contests.middleware');
const userMiddlewares = require('../middlewares/users.middleware');
const emailHelper = require('../helpers/mail.helper');

module.exports = (app) => {
    const upload = multer();

    const contests = require('../controllers/contests.controller.js');
    // Create a new Contests
    app.post('/contests', contests.create);
    // Retrieve all Contests
    app.get('/contests', contests.findAll);
    // Retrieve a single Contest with ContestId
    app.get('/contests/findById/:contestId', userMiddlewares.isUserInContest, contests.findOne);
    // Retrieve a single Contest with Contest SlugName
    app.get('/contests/findBySlug/:slug', userMiddlewares.isUserInContest, contests.findSlug)
    // Update a Note with ContestId
    app.put('/contests/:contestsId', contests.update);
    // Delete a Note with ContestId
    app.delete('/contests/:contestsId', contests.delete);
    // Find Contest ID By Slug
    app.get('/contests/findIdBySlug/:slug', contests.findIdBySlug);


    const users = require('../controllers/users.controller.js');
    // Create a new User
    app.post('/users', users.create);
    // Retrieve all Users
    app.get('/users', users.findAll);
    // Retrieve a single User with usersId
    app.get('/users/:usersId', users.findOne);
    // Retrieve a single User with email
    app.get('/users/email/:email/:lang', users.findEmail);
    // Update a User with usersId
    app.put('/users/:usersId', users.update);
    // Delete a User with usersId
    app.delete('/users/:usersId', users.delete)
    // getverification data
    app.post('/users/verify', users.verify);
    // Get User Images
    app.get('/users/:id/images', users.getUserImages);
    // Join Free Contest
    app.post('/users/joinFreeContest', contestMiddlewares.isFreeContest, userMiddlewares.isUserInContest, users.joinFreeContest);
    // Notify user
    app.post('/users/notify', users.notify);
    // Authenticate With Google
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }))
    // Google Redirect URL
    app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
        res.redirect('/')
    })
    // Send Email
    app.post('/email/send', emailHelper.sendEmailExpress);


    const images = require('../controllers/image.controller.js');
    //Upload image to aws and asave data in mongo
    app.post('/images/uploads', upload.single("image"), images.uploadimage);
    //find all images
    app.get('/images', images.findAll);
    // Retrieve a single image with contestid
    app.get('/images/:user_id', images.findOne);
    // Update a image with contestid
    app.put('/images/:user_id', images.update);
    // Delete a image with contest_id
    app.delete('/images/:user_id', images.delete);


    const paypal = require('../controllers/paypal.controller');
    // Create New Payment
    app.post('/paypal/pay', paypal.create);
    // Execute Payment
    app.post('/paypal/exec', paypal.execute);
    // Check User Transaction For Contest
    app.get('/paypal/check/:user/:contest', paypal.check);

}