const mongoose = require("mongoose");
const express = require("express");
const physicianRouter = require("./routes/physician");
const bodyParser = require("body-parser");
const formdata = require("express-form-data");
const os = require("os");

const app = express();

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  allowedHeaders: true,
  optionSuccessStatus: 200,
};

const physicianUser = require("./models/User");
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  formdata.parse({
    uploadDir: os.tmpdir(),
    autoClean: true,
  })
);

mongoose
  .connect("mongodb://0.0.0.0:27017/FitbitDatabase")
  .then(function (result) {
    console.log("MongoDB connected");
  })
  .catch(function (err) {
    console.log(err);
  });

app.use("/physician", physicianRouter);

const FitbitApiClient = require("fitbit-node");
const client = new FitbitApiClient({
  clientId: "2393JT", // "YOUR_CLIENT_ID",
  clientSecret: "a8611c1fda7e370f325d41fde6dcca6c", //YOUR_CLIENT_SECRET",
});

app.get("/", (req, res) => {
  res.send("Welcome to the backend for dailyApple");
});

app.get("/authorize", (req, res) => {
  console.log("authorize"); //debug

  res.redirect(
    client.getAuthorizeUrl(
      "activity heartrate location nutrition profile settings sleep social weight",
      "http://localhost:5000/callback"
    )
  );
});

var temp;
app.get("/callback", (req, res) => {
  console.log("callback"); //debug
  console.log('yoooo');
  client
    .getAccessToken(req.query.code, "http://localhost:5000/callback")
    .then((result) => {
      console.log(result); //to get result.user_id
      temp = result;
      client
        .get("/profile.json", result.access_token)
        .then(async (results) => {
          console.log("profile");
          const loginUser = await physicianUser.findOne({
            userName: temp.user_id,
          });
          if (!loginUser) {
            const newUser = new physicianUser();
            newUser.userName = temp.user_id;
            newUser.access_token = temp.access_token;
            newUser.expires_in = temp.expires_in;
            newUser.refresh_token = temp.refresh_token;
            newUser.scope = temp.scope;
            await newUser.save();
          }
          return res.redirect("http://localhost:3000/patientSigned");
          // res.send(results[0]);
          console.log(results[0]);
        })
        .catch((err) => {      
          res.status(err.status).send("Failed");
        });f
    })
    .catch((err) => {
      res.status(err.status).send(err);
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// launch the server with port 5000
app.listen(5000, () => {
  console.log('The backend is running on port 5000');
});

