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
    let authors = blogs.map(blog => blog.author);
    authors = [...new Set(authors)];

    let published = new Array(authors.length).fill(0);
    blogs.map(blog => {
        published[authors.indexOf(blog.author)]++;
    });

    let index = published.indexOf(Math.max(...published));

    return {
        author: authors[index],
        blogs: published[index]
    };
};

const mostLikes = (blogs) => {
    let authors = blogs.map(blog => blog.author);
    authors = [...new Set(authors)];

    let total = new Array(authors.length).fill(0);
    blogs.map(blog => {
        total[authors.indexOf(blog.author)] += blog.likes;
    });

    let index = total.indexOf(Math.max(...total));

    return {
        author: authors[index],
        likes: total[index]
    };
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
};