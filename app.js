/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo/es5')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var sass = require('node-sass-middleware');


/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function () {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(sass({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    sourceMap: true,
    outputStyle: 'expanded'
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secrets.sessionSecret,
    store: new MongoStore({url: secrets.db, autoReconnect: true})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
    csrf: true,
    xframe: 'SAMEORIGIN',
    xssProtection: true
}));
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});
app.use(function (req, res, next) {
    if (/api/i.test(req.path)) {
        req.session.returnTo = req.path;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));

app.get('/views/:folder/:view', function (req, res) {
    return res.render(req.params.folder + '/' + req.params.view);
});

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
//app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/users', userController.getUsers);
app.get('/user', passportConf.isAuthenticated, function (req, res) {
    return res.send(req.user);
});
app.get('/startPairing', userController.pairingStarted);
app.get('/pairingList', userController.getPairingList);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email', 'user_location']}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), function (req, res) {
    userController.getUsers(function (err, users) {
        if (err) {
            console.log(err);
            return;
        }
        io.sockets.emit('users', users);
    });
    res.redirect(req.session.returnTo || '/');
});


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express + socketio server.
 */
var io = require('socket.io')(app.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
}));

module.exports = app;


io.sockets.on('connection', function (socket) {
    function emitUsers(data) {
        userController.getUsers(function (err, users) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(users.length);
            socket.broadcast.emit('users', users);
            socket.emit('users', users);
        });
    }

    emitUsers();
    //setInerval(10, emitUsers);
    socket.on('login', function () {
        console.log('login');
        emitUsers()
    });
    socket.on('logout', function () {
        socket.emit('users');
    });
    //socket.on('deploy', function (data) {
    //    var deploySh = spawn('ssh', ['-o', "StrictHostKeyChecking no", '-l', 'ubuntu', data.ip, data.script]);
    //    deploySh.stdout.on('data', function (data) {
    //        //console.log(data.toString());
    //        io.emit('progress', data.toString('ascii'));
    //    });
    //    deploySh.stderr.on('data', function (data) {
    //        //console.log(data.toString());
    //        io.emit('progress', 'Error: ' + data.toString('ascii'));
    //    });
    //    deploySh.on('exit', function (code) {
    //        if (code === 255) {
    //            return io.emit('end', 'Connection Failed (' + code + ')');
    //        }
    //        io.emit('end', code);
    //    });
    //
    //});
});