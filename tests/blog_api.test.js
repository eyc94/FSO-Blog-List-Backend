const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
    await Blog.deleteMany({});

    let blogObject = new Blog(helper.initialBlogs[0]);
    await blogObject.save();

    blogObject = new Blog(helper.initialBlogs[1]);
    await blogObject.save();
});

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);
}, 100000);

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('all blogs have property named id, not _id', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
});

test('a valid blog can be added', async () => {
    const newBlog = {
        title: "This blog is about dogs!",
        author: "Dog Man",
        url: "www.dogs.com",
        likes: 124
    };

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const contents = blogsAtEnd.map(b => b.title);
    expect(contents).toContain(
        'This blog is about dogs!'
    );
});

test('this blog has no likes so it needs 0 likes', async () => {
    const newBlog = {
        title: "This blog is going to start with 0 likes!",
        author: "Joe Smith",
        url: "www.no-likes.com"
    };

    const response = await api
        .post('/api/blogs')
        .send(newBlog);

    expect(response.body.likes).toBe(0);
});

test('adding blogs with no title and url', async () => {
    const newBlog = {
        author: "The Mysterious Author",
        likes: 234
    };

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400);

    const response = await helper.blogsInDb();
    expect(response).toHaveLength(helper.initialBlogs.length);
});

afterAll(() => {
    mongoose.connection.close();
});