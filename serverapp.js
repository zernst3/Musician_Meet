const express = require('express');
const connectDB = require('./config/db');

const app = express();

// connect database to the server
connectDB();

// Initialize Middleware
app.use(express.json({extended: false}));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => 
    res.send('API Running')
);

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/authorization', require('./routes/api/authorization'));
app.use('/api/artist', require('./routes/api/artist'));
app.use('/api/posts', require('./routes/api/posts'));

app.listen(PORT, () => console.log(`Server initialized on port ${PORT}`));