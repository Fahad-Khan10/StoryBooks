require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const exphbs = require("express-handlebars");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");

const app = express();

// BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/// MethodOverride
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// Static Public
app.use(express.static(__dirname + "/public"));

//Passport config
require("./config/passport")(passport);

// Morgan Console
const morgan = require("morgan");
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//// Database Connection
const connectDB = require("./config/db");
connectDB();

//HandleBars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

// HandleBars
app.engine(
  ".hbs",
  exphbs.engine({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    extname: ".hbs",
    defaultLayout: "main",
  })
);

app.set("view engine", ".hbs");

// Sessions
app.use(
  session({
    secret: "storybooks cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//// Passport MiddleWare
app.use(passport.initialize());
app.use(passport.session());

//set global variable
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

///// Listening //////
const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(`Server Running in ${process.env.NODE_ENV} on port ${PORT}`)
  //   ${process.env.NODE_ENV}
);
