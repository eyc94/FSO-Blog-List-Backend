const _ = require('lodash');

const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes;
    };

    return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
    let mostLikes = 0;
    let favBlog = {};

    blogs.forEach(blog => {
        if (blog.likes > mostLikes) {
            favBlog = blog;
            mostLikes = blog.likes;
        }
    });

    return favBlog;
};

const mostBlogs = (blogs) => {
    let authorWithMostBlogs = {};

    return authorWithMostBlogs;
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
};