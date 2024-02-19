const express = require("express");
const Articles = require("../models/article");
const router = express.Router();

router.delete("/:id", async (req, res) => {
  try {
    let articleId = req.params.id;
    const deletedArticle = await Articles.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      res.status(404).json({ error: "Article not found" });
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting article");
  }
});

module.exports = router;
