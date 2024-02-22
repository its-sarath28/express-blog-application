const express = require("express");
const Articles = require("../models/article");
const router = express.Router();
const paginate = require("express-paginate");

router.get("/", async (req, res) => {
  try {
    const userId = req.session.userId;

    const [userArticles, itemCount] = await Promise.all([
      Articles.find({ author: userId })
        .populate("author", "firstName lastName")
        .sort({ publishedOn: -1 })
        .limit(req.query.limit)
        .skip(req.skip),
      Articles.countDocuments({ author: userId }),
    ]);

    const pageCount = Math.ceil(itemCount / req.query.limit);

    const pages = paginate.getArrayPages(req)(5, pageCount, req.query.page);

    // Check if there are previous pages
    const hasPreviousPages = req.query.page > 1;

    // Check if there are next pages
    const hasNextPages = req.query.page < pageCount;

    userArticles.forEach((article) => {
      const options = { day: "numeric", month: "short", year: "numeric" };
      article.publishedOnFormatted = article.publishedOn.toLocaleDateString(
        "en-IN",
        options
      );
    });

    pages.forEach((page) => {
      if (page.number === req.query.page) {
        page.active = true;
      } else {
        page.active = false;
      }
    });

    const refererPage = new URL(req.headers.referer).searchParams.get("page");
    const currentPageNumber = refererPage ? parseInt(refererPage) : 1;

    res.render("myBlog", {
      title: "Blog - My Blogs",
      heading: "My Blogs",
      articles: userArticles,
      pageCount,
      itemCount,
      pages,
      hasPreviousPages,
      hasNextPages,
      req,
      successMessage: req.flash("success"),
      currentPageNumber,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while fetching user articles");
  }
});

module.exports = router;
