const deleteBtn = document.getElementById("deleteBtn");

deleteBtn.addEventListener("click", async () => {
  try {
    const articleId = deleteBtn.getAttribute("data-article-id");
    const response = await fetch(`/blogs/delete/${articleId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      window.location = `/`;
    } else {
      throw new Error("Failed to delete");
    }
  } catch (err) {
    console.log(err);
  }
});
