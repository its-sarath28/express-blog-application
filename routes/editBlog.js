const express = require("express");
const Articles = require("../models/article");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const article = await Articles.findById(req.params.id);
    res.render("editBlog", {
      title: "Blog - Edit",
      article,
      successMessage: req.flash("success"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving edit blog");
  }
});

router.post("/:id", async (req, res) => {
  try {
    let article = {};
    article.title = req.body.title;
    article.body = req.body.body;

    let updateQuerry = { _id: req.params.id };

    await Articles.updateOne(updateQuerry, article);
    req.flash("success", `Updated successfully`);
    res.redirect("/blogs/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating blog");
  }
});

module.exports = router;
