const express = require("express");
const Articles = require("../models/article");
const router = express.Router();
const paginate = require("express-paginate");

router.get("/", async (req, res) => {
  try {
    const resultsPromise = Articles.find({})
      .populate("author")
      .sort({ publishedOn: -1 })
      .limit(req.query.limit)
      .skip(req.skip);

    const countPromise = Articles.countDocuments({});

    const [results, itemCount] = await Promise.all([
      resultsPromise,
      countPromise,
    ]);

    const pageCount = Math.ceil(itemCount / req.query.limit);

    const pages = paginate.getArrayPages(req)(5, pageCount, req.query.page);

    // Check if there are previous pages
    const hasPreviousPages = req.query.page > 1;

    // Check if there are next pages
    const hasNextPages = req.query.page < pageCount;

    const currentPage = req.query.page || 1;

    results.forEach((article) => {
      const options = { day: "numeric", month: "short", year: "numeric" };
      article.publishedOnFormatted = article.publishedOn.toLocaleDateString(
        "en-IN",
        options
      );
    });

    res.render("home", {
      title: "Blog",
      heading: "Articles",
      articles: results,
      pageCount,
      itemCount,
      pages,
      hasPreviousPages,
      hasNextPages,
      req,
      successMessage: req.flash("success"),
      currentPage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching articles");
  }
});

module.exports = router;
