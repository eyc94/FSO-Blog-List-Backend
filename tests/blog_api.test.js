const bcrypt = require('bcrypt');
const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
});

describe('retrieving information on blogs when there is at least 1 blog', () => {
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
});

describe('testing the creation of blogs with user tokens', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('supersecret', 10);
        const user = new User({ username: 'superuser', passwordHash });

        await user.save();
    });

    test('creation fails with appropriate status code when token is not provided', async () => {

        const newBlog = {
            title: "This blog is about dogs!",
            author: "Dog Man",
            url: "www.dogs.com",
            likes: 124
        };

        await api
            .post('/api/blogs')
            .set({ Authorization: `Bad token` })
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/);

        const blogsAtEnd = await helper.blogsInDb();
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test('a valid blog can be added', async () => {
        const targetUser = {
            username: 'superuser',
            password: 'supersecret'
        };

        const userResult = await api
            .post('/api/login')
            .send(targetUser)
            .expect(200);

        const { token } = userResult.body;

        const newBlog = {
            title: "This blog is about dogs!",
            author: "Dog Man",
            url: "www.dogs.com",
            likes: 124
        };

        await api
            .post('/api/blogs')
            .set({ Authorization: `Bearer ${token}` })
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
        const targetUser = {
            username: 'superuser',
            password: 'supersecret'
        };

        const userResult = await api
            .post('/api/login')
            .send(targetUser)
            .expect(200);

        const { token } = userResult.body;

        const newBlog = {
            title: "This blog is going to start with 0 likes!",
            author: "Joe Smith",
            url: "www.no-likes.com"
        };

        const response = await api
            .post('/api/blogs')
            .set({ Authorization: `Bearer ${token}` })
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.likes).toBe(0);
    });

    test('adding blogs with no title and url', async () => {
        const targetUser = {
            username: 'superuser',
            password: 'supersecret'
        };

        const userResult = await api
            .post('/api/login')
            .send(targetUser)
            .expect(200);

        const { token } = userResult.body;

        const newBlog = {
            author: "The Mysterious Author",
            likes: 234
        };

        await api
            .post('/api/blogs')
            .set({ Authorization: `Bearer ${token}` })
            .send(newBlog)
            .expect(400);

        const response = await helper.blogsInDb();
        expect(response).toHaveLength(helper.initialBlogs.length);
    });

    test('deletion of a blog', async () => {
        const targetUser = {
            username: 'superuser',
            password: 'supersecret'
        };

        const userResult = await api
            .post('/api/login')
            .send(targetUser)
            .expect(200);

        const { token } = userResult.body;

        const newBlog = {
            title: "This blog is about dogs!",
            author: "Dog Man",
            url: "www.dogs.com",
            likes: 124
        };

        await api
            .post('/api/blogs')
            .set({ Authorization: `Bearer ${token}` })
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = blogsAtStart[2];

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set({ Authorization: `Bearer ${token}` })
            .expect(204);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

        const contents = blogsAtEnd.map(b => b.title);
        expect(contents).not.toContain(blogToDelete.title);
    });
});

test('updating existing blog likes', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ likes: 1000 })
        .expect(200);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd[0];
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    expect(updatedBlog.likes).toBe(1000);
});

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('secret', 10);
        const user = new User({ username: 'root', passwordHash });

        await user.save();
    });

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen'
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map(u => u.username);
        expect(usernames).toContain(newUser.username);
    });

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen'
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('username must be unique');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });

    test('creation fails with proper statuscode and message if username is missing', async () => {
        const usersAtStart = await helper.usersInDb();
        const userWithoutUsername = {
            name: 'havenousername',
            password: 'password1'
        };

        const result = await api
            .post('/api/users')
            .send(userWithoutUsername)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('username or password is missing');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });

    test('creation fails with proper statuscode and message if password is missing', async () => {
        const usersAtStart = await helper.usersInDb();
        const userWithoutPassword = {
            username: 'sampleusername',
            name: 'havenousername'
        };

        const result = await api
            .post('/api/users')
            .send(userWithoutPassword)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('username or password is missing');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });

    test('creation fails with proper statuscode and message if username length is less than 3', async () => {
        const usersAtStart = await helper.usersInDb();
        const userUsernameLessThree = {
            username: 'ab',
            name: 'John',
            password: 'password2'
        };

        const result = await api
            .post('/api/users')
            .send(userUsernameLessThree)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('username or password length is less than 3');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });

    test('creation fails with proper statuscode and message if password length is less than 3', async () => {
        const usersAtStart = await helper.usersInDb();
        const userPassLessThree = {
            username: 'abc',
            name: 'John',
            password: 'xy'
        };

        const result = await api
            .post('/api/users')
            .send(userPassLessThree)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('username or password length is less than 3');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });
});

afterAll(() => {
    mongoose.connection.close();
});