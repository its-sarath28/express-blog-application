const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const User = require("../models/users");

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Blog - login",
  });
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Blog - register",
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/user/login");
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("danger", "Invalid credentials");
      return res.render("login", {
        title: "Blog - login",
        errors: [{ msg: "Invalid credentials" }],
      });
    }

    // Compare hashed password with the provided password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      req.session.userId = user._id;
      req.session.firstName = user.firstName;
      res.redirect("/");
    } else {
      req.flash("danger", "Invalid credentials");
      res.render("login", {
        title: "Blog - login",
        errors: [{ msg: "Invalid credentials" }],
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/register",
  [
    body("firstName")
      .notEmpty()
      .withMessage("First name is required")
      .custom((value) => {
        if (!/^[a-zA-Z ]+$/.test(value)) {
          throw new Error("First name should only contain letters and spaces");
        }
        return true;
      }),
    body("lastName")
      .notEmpty()
      .withMessage("Last name is required")
      .custom((value) => {
        if (!/^[a-zA-Z ]+$/.test(value)) {
          throw new Error("Last name should only contain letters and spaces");
        }
        return true;
      }),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not in correct format"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters long"),
    body("cnfPassword")
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
    (req, res, next) => {
      const { firstName, lastName, email, password, cnfPassword } = req.body;
      if (!firstName && !lastName && !email && !password && !cnfPassword) {
        return res.render("register", {
          title: "Blog - register",
          errors: [{ msg: "All fields are required" }],
        });
      }
      next();
    },
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("register", {
        title: "Blog - register",
        errors: errors.array(),
        values: req.body,
      });
    } else {
      const { firstName, lastName, email, password } = req.body;

      try {
        const userFound = await User.findOne({ email });

        if (userFound) {
          req.flash("danger", "Email already exists!");
          return res.redirect("/user/register");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
        });

        await user.save();
        req.session.userId = user._id;
        req.session.firstName = user.firstName;
        req.flash("success", "User registered successfully!");
        res.redirect("/");
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Error while registering user");
      }
    }
  }
);

module.exports = router;
