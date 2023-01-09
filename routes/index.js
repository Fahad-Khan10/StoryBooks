const express = require("express");
const router = express.Router();
const Story = require("../models/Story");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

/// Login Route
router.get("/", ensureGuest, function (req, res) {
  res.render("login", { layout: "login" });
});

/// DashBoard Route
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render("dashboard", {
      name: req.user.firstName,
      stories,
    });
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

module.exports = router;
