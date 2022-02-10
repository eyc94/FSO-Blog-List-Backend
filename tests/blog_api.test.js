const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

const Blog = require('../models/blog');
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

beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObject = new Blog(initialBlogs[0]);
    await blogObject.save();
    blogObject = new Blog(initialBlogs[1]);
    await blogObject.save();
});

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);
}, 100000);

afterAll(() => {
    mongoose.connection.close();
});