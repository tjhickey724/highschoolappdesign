var express = require('express');
var router = express.Router();
const crypto = require('crypto')
const User = require('../models/User')


// This is an example of middleware
// where we look at a request and process it!
router.use(function(req, res, next) {
  //console.log("about to look for routes!!! "+new Date())
  console.log(`${req.method} ${req.url}`);
  //console.dir(req.headers)
  next();
});


router.use((req,res,next) => {
  if (req.session.username) {
    res.locals.loggedIn = true
    res.locals.username = req.session.username
    res.locals.user = req.session.user
  } else {
    res.locals.loggedIn = false
    res.locals.username = null
    res.locals.user = null
  }
  console.log("res.locals = "+JSON.stringify(res.locals))
  next()
})


router.get("/login", (req,res) => {
  res.render("login")
})

router.post('/login',
  async (req,res,next) => {
    try {
      const {username,passphrase} = req.body
      const hash = crypto.createHash('sha256');
      hash.update(passphrase);
      const encrypted = hash.digest('hex')
      console.log(`hash.digest=${encrypted}`)
      const user = await User.findOne({username:username,passphrase:encrypted})
      console.log(`user = ${user}`)

      if (user) {
        req.session.username = username //req.body
        req.session.user = user
        res.redirect('/')
      } else {
        req.session.username = null
        req.session.user = user
        res.redirect('/login')
      }
    }catch(e){
      next(e)
    }
  })

router.post('/signup',
  async (req,res,next) =>{
    try {
      const {username,passphrase,passphrase2} = req.body
      if (passphrase != passphrase2){
        res.redirect('/login')
      }else if (passphrase.split(' ').length < 5) {
        res.redirect('/login')
      }else {
        console.log(`signing up ${username} with passphrase "${passphrase}"`)
        const hash = crypto.createHash('sha256');
        hash.update(passphrase);
        const encrypted = hash.digest('hex')
        console.log(`hash.digest=${encrypted}`)
        console.log(`hash.digest=${encrypted}`)
        const user = new User({username:username,passphrase:encrypted})
        await user.save()
        console.log('saved info in User')
        req.session.username = user.username
        req.session.user = user
        res.redirect('/')
      }
    }catch(e){
      next(e)
    }
  })

router.get('/logout', (req,res) => {
  req.session.destroy() //(error)=>{console.log("Error in destroying session: "+error)});
  res.redirect('/');
})

module.exports = router;
