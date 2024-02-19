const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Articles = require("../models/article");

router.get("/", (req, res) => {
  res.render("addBlog", {
    title: "Blog - Add",
    heading: "Add Blog",
  });
});

router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("body").notEmpty().withMessage("Body is required"),
    // Custom validation to check if all fields are empty
    (req, res, next) => {
      const { title, body } = req.body;
      if (!title && !body) {
        return res.render("addBlog", {
          title: "Blog - Add",
          heading: "Add article",
          errors: [{ msg: "All fields are required" }],
        });
      }
      next();
    },
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("addBlog", {
        title: "Blog - Add",
        heading: "Add Blog",
        errors: errors.array(),
        values: req.body,
      });
    } else {
      const { title, body } = req.body;

      try {
        const userId = req.session.userId;
        const articles = new Articles({
          title,
          body,
          author: userId,
        });

        await articles.save();
        req.flash("success", "Article added successfully!");
        res.redirect("/");
      } catch (err) {
        console.log(err);
        res.status(500).send("Error while adding article");
      }
    }
  }
);

module.exports = router;
