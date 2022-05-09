

module.exports.getLogin = (req, res) => {
    res.render('login', {user: req.user})
}


module.exports.logout = (req, res) => {
    //handle with passport
    req.logout()
    res.redirect('/')
}

module.exports.googleRedirect = (req, res) => {
    res.redirect('/login/success')
}

module.exports.authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect("/login")
    } else { 
        next()
    }
}

module.exports.loginSuccess = (req, res) => {
    res.render('loginSuccess', {user: req.user})
}
