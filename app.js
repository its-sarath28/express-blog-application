const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const paginate = require("express-paginate");
const hbs = require("hbs");
const fs = require("fs");
const flash = require("connect-flash");
const expressMessages = require("express-messages");
const session = require("express-session");

const homeRouter = require("./routes/home");
const addBlogRouter = require("./routes/addBlog");
const viewBlogRouter = require("./routes/viewBlog");
const myBlogRouter = require("./routes/myBlog");
const viewMyBlogRouter = require("./routes/viewMyBlog");
const editBlogRouter = require("./routes/editBlog");
const deleteBlogRouter = require("./routes/deleteBlog");
const userRouter = require("./routes/users");

const app = express();

require("dotenv").config();
require("./config/connectdb");

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect("/user/login"); // Redirect to login page if not logged in
  }
};

// view engine setup
app.use(paginate.middleware(6, 50));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartial(
  "paginate",
  fs.readFileSync(
    path.join(__dirname, "views", "partials", "paginate.hbs"),
    "utf8"
  )
);
hbs.registerPartial(
  "alertMessage",
  fs.readFileSync(
    path.join(__dirname, "views", "partials", "message.hbs"),
    "utf8"
  )
);
hbs.registerHelper("decrement", (value) => {
  return parseInt(value) - 1;
});
hbs.registerHelper("increment", (value) => {
  return parseInt(value) + 1;
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    //secret: "anyWayYouKnow",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res);
  next();
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.userId ? true : false;
  next();
});

app.use("/", homeRouter);
app.use("/blogs/add", isAuthenticated, addBlogRouter);
app.use("/blogs", viewBlogRouter);
app.use("/myBlogs", isAuthenticated, myBlogRouter);
app.use("/myBlogs/blogs", isAuthenticated, viewMyBlogRouter);
app.use("/blogs/edit", isAuthenticated, editBlogRouter);
app.use("/blogs/delete", isAuthenticated, deleteBlogRouter);
app.use("/user", userRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
