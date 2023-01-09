const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

//// Show Add Page ////
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

//Post Request /  Stories
router.post("/", async (req, res) => {
  try {
    req.body.user = req.user.id; /// req.body.user story schema has user as a field chat gpt this
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.render("errors/500");
  }
});

//// Show All Stories ////
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", {
      stories,
    });
  } catch (error) {
    console.error(error);
    res.render("errors/500");
  }
});

//// Show Edit Page ////
router.get("/edit/:id", ensureAuth, async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  }).lean();

  if (!story) {
    return res.render("error/404");
  }

  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    res.render("stories/edit", {
      story,
    });
  }
});

//// PUT REQ Edit Page ////
router.put("/:id", ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();

  if (!story) {
    res.render("errors/404");
  }
  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
  }
  res.redirect("/dashboard");
});

//// Delete Request REQ ////
router.delete("/:id", ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();

  if (!story) {
    res.render("errors/404");
  }
  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    story = await Story.findByIdAndDelete({ _id: req.params.id });
  }
  res.redirect("/dashboard");
});

//// Single Story Page ////
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user._id != req.user.id && story.status == "private") {
      res.render("error/404");
    } else {
      res.render("stories/show", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

//// More From author ////
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

/// Search ///
router.get('/search/:query', ensureAuth, async (req, res) => {
  try{
      const stories = await Story.find({title: new RegExp(req.query.query,'i'), status: 'public'})
      .populate('user')
      .sort({ createdAt: 'desc'})
      .lean()
     res.render('stories/index', { stories })
  } catch(err){
      console.log(err)
      res.render('error/404')
  }
})

module.exports = router;
