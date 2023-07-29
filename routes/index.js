var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();
var User=require('./users.js')

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'email','profile' ]
}, async function verify(issuer, profile, cb) 
{
  let existingUser=await User.findOne({emails:profile.emails[0].value})
  if(existingUser){
    return cb(null,existingUser);
  }
  else{
   let newUser= await User.create ({name:profile.displayName,emails:profile.emails[0].value})
  return cb(null,newUser)
  }
//   db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
//     issuer,
//     profile.id
//   ], function(err, row) {
//     if (err) { return cb(err); }
//     if (!row) {
//       db.run('INSERT INTO users (name) VALUES (?)', [
//         profile.displayName
//       ], function(err) {
//         if (err) { return cb(err); }

//         var id = this.lastID;
//         db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
//           id,
//           issuer,
//           profile.id
//         ], function(err) {
//           if (err) { return cb(err); }
//           var user = {
//             id: id,
//             name: profile.displayName
//           };
//           return cb(null, user);
//         });
//       });
//     } else {
//       db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
//         if (err) { return cb(err); }
//         if (!row) { return cb(null, false); }
//         return cb(null, row);
//       });
//     }
//   });
}));


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user){
  res.render('index', { title: 'Express' });
  }
  else{
    res.redirect('/login')
  }
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));


module.exports = router;
