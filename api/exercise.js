const { Router } = require("express");
const UserEntry = require("../models/user"); // import scyhema Model
const router = Router();

// Return array of users:
router.get("/users", (req, res) => {
  UserEntry.find({}, (err, doc) => {
    if (err) return console.log("Error: ", err);
    let responseArray = [];
    for (let entry in doc) {
      responseArray.push({
        username: doc[entry].username,
        _id: doc[entry]._id,
      });
    }
    res.json(responseArray);
  });
});

// Post New User Obj
// {username:string, id: number, exercises: []}
router.post("/new-user", (req, res, next) => {
  // save user object in db
  // respond with user obj id + userName

  var username = req.body.username;
  // var exercises = [];
  try {
    var user = new UserEntry({ username: username /*exercises:exercises*/ });
    user.save((err, data) => {
      if (err) return console.error(err);
      res.json({
        username: data.username,
        _id: data._id,
      });
    });
  } catch (error) {
    next(error);
  }
});

// Add exercises
// POST form data
router.post("/add", (req, res, next) => {
  console.log(req.body);
  var exerciseSession = req.body;
  if (
    !exerciseSession.userId ||
    !exerciseSession.description ||
    !exerciseSession.duration
  ) {
    res.send(
      "User ID, Description and Duration are required fields - please enter values..."
    );
  }
  // check req has a date, add now if not supplied
  if (!exerciseSession.date || exerciseSession.date == "")
    exerciseSession.date = new Date();
  let duration = parseInt(exerciseSession.duration);
  let dateString = new Date(exerciseSession.date).toDateString();

  let exerciseInstance = {
    description: exerciseSession.description,
    duration: duration,
    date: dateString,
  };
  //const doc = await UserEntry.findOne({_id: req.body.userId})
  /*
   UserEntry.updateOne({_id: exerciseSession.userId
    },{ $push: { exercises: exerciseInstance } },{upsert: true, new: true }, (err, doc) => {
      if (err) return console.log("Error: ", err);
      let user = UserEntry.findOne({_id:exerciseSession.userId})
      console.log(user);
      res.json({
        username: doc.username,
        description: exerciseInstance.description,
        duration: parseInt(exerciseSession.duration),
        _id: doc._id,
        date: exerciseInstance.date});
    });
    */
  UserEntry.findByIdAndUpdate(
    exerciseSession.userId,
    { $push: { exercises: exerciseInstance } },
    (err, doc) => {
      if (err) return console.log("Error: ", err);
      res.json({
        username: doc.username,
        description: exerciseInstance.description,
        duration: exerciseInstance.duration,
        _id: doc._id,
        date: exerciseInstance.date,
      });
    }
  );
});

router.get("/log", (req, res) => {
  // Get queries from req object
  let userId = req.query.userId;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  // Create object to populate for response
  let userInfo = {};
  // If the user doesn't specify from and to dates:
  if (!from && !to) {
    // Check db for provided userId
    UserEntry.findOne({ _id: userId }, (err, doc) => {
      if (err) return console.log("Error finding ID: ", err);
      if (doc == null) {
        console.log(userId);
        res.send("Unknown UserId.. Plz try again!");
      } else {
        let exercise = doc.exercises;
        let log = [];

        for (let i = 0; i < limitCheck(limit, exercise.length); i++) {
          log.push({
            activity: exercise[i].description,
            duration: exercise[i].duration,
            date: exercise[i].date,
          });
        }
        userInfo = {
          _id: userId,
          username: doc.username,
          count: log.length,
          log: log,
        };
        res.json(userInfo);
      }
    });
    // If the user specifies from and to dates:
  } else {
    UserEntry.find()
      .where("_id")
      .equals(userId)
      .where("exercises.date")
      .gt(from)
      .lt(to)
      .exec((err, doc) => {
        if (err) return console.log("Error: ", err);
        if (doc.length == 0) {
          res.send(
            "Error: Check User ID or No activities in this date range..."
          );
        } else {
          let exercise = doc[0].exercises;
          let log = [];
          for (let i = 0; i < limitCheck(limit, exercise.length); i++) {
            log.push({
              activity: exercise[i].description,
              duration: exercise[i].duration,
              date: exercise[i].date,
            });
          }
          userInfo = {
            _id: userId,
            username: doc[0].username,
            count: log.length,
            log: log,
          };
          res.json(userInfo);
        }
      });
  }
  // Function to check limit and use in for loop that creates log array
  let limitCheck = (i, j) => {
    if (i <= j) {
      return i;
    } else {
      return j;
    }
  };
});

module.exports = router;
