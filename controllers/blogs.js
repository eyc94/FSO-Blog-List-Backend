const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
    if (!request.token) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }
    const body = request.body;
    const user = request.user;

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id
    });
    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response, next) => {
    const deletingBlog = await Blog.findById(request.params.id);
    const user = request.user;

    if (!deletingBlog) {
        return response.status(204).end();
    }

    if (user._id.toString() === deletingBlog.user.toString()) {
        await Blog.findByIdAndRemove(request.params.id);
        user.blogs = user.blogs.filter(blog => blog.toString() !== deletingBlog._id.toString());
        await user.save();
        return response.status(204).end();
    } else {
        return response.status(401).json({ error: 'Unauthorized deletion attempt' });
    }
});

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body;

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    };

    const updatedNote = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
    response.json(updatedNote);
});

module.exports = blogsRouter;