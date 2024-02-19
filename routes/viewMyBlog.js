const express = require("express");
const Articles = require("../models/article");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const article = await Articles.findById(req.params.id).populate(
      "author",
      "firstName lastName"
    );
    const refererPage = new URL(req.headers.referer).searchParams.get("page");
    const currentPageNumber = refererPage ? parseInt(refererPage) : 1;

    const options = { day: "numeric", month: "short", year: "numeric" };
    article.publishedOnFormatted = article.publishedOn.toLocaleDateString(
      "en-IN",
      options
    );

    const matchUserAndArticle = article.author._id == req.session.userId;

    res.render("viewMyBlog", {
      title: "Blog - view",
      article,
      currentPageNumber,
      isAuthenticated: req.session.userId ? true : false,
      matchUserAndArticle,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving article");
  }
});

module.exports = router;
