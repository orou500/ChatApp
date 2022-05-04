

module.exports.getLogin = (req, res) => {
    res.render('login')
}


module.exports.logout = (req, res) => {
    //handle with passport
    res.send('logout')
}

module.exports.googleRedirect = (req, res) => {
    res.send('you reached the callback URI')
}