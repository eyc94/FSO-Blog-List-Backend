const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const mongoose = require('mongoose');

console.log('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.error('error connecting to MongoDB:', error.message);
    });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

app.use('/api/blogs', blogsRouter);

module.exports = app;