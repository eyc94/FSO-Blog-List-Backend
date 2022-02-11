const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
    {
        title: 'This is a sample title 1',
        author: 'John Doe',
        url: 'www.sample-one.com',
        likes: 20
    },
    {
        title: 'This is a sample title 2',
        author: 'Jane Doe',
        url: 'www.sample-two.com',
        likes: 35
    }
];

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map(blog => blog.toJSON());
};

const usersInDb = async () => {
    const users = await User.find({});
    return users.map(user => user.toJSON());
};

module.exports = {
    initialBlogs, blogsInDb, usersInDb
};