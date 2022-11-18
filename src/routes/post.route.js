const express = require("express")
const Post = require("../models/post.model")
const router = express.Router()

// Get all posts
router.get("/posts", async (req, res) => {
	const posts = await Post.find();
	res.send(posts);
});

//Save post
router.post("/posts", async (req, res) => {
	const post = new Post({
		title: req.body.title,
		content: req.body.content,
	})
	await post.save();
	res.send(post);
})

module.exports = router