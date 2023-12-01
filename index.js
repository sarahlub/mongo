const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./db');
const bodyParser = require('body-parser');
const Event = require('./models/event');
const User = require('./models/user');




dotenv.config();


const app = express();
const PORT = 3000;

app.use(express.json());


const mongoDB = process.env.CONNECTION_STRING;

connectToDatabase();



app.get('/', (req, res) => {
    res.send('Hello World!')
});


// creating a new user
app.post('/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Getting all active users
app.get('/users', async(req, res) => {
    try {
        const { active } = req.query;
        const query = active ? { active: active === 'true' } : {};
        const users = await User.find(query);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Getting a specific user ny ID
app.put('/users/:id', async (req, res)=> {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(400).json({ message: 'opps...User cannot be found'})
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Deleting users by ID
app.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (deletedUser) {
            res.json({ message: 'User has been deleted successfully!'});
        } else {
            res.status(404).json({ message: 'User cannot be found '});
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Creating a new event
app.post('/events', async (req, res) => {
    try {
        // checking the organizer field is a valid user ID
        const organizedId = req.body.organizer;
        const isValidOrganizer = await User.exists({ _id: organizedId });

        if (!isValidOrganizer) {
            return res.status(400).json({ message: 'Invalid organizer ID '});
        }

        const newEvent = new Event(req.body);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// getting all Events
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Getting a particular event by ID and populating the organizer field
app.get('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId).populate('organizer', 'name email');

        if (event) {
            res.json(event); 
        } else {
                res.status(400).json({ message: 'Event cannot be found! '});
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/events/:id/join', async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.body.userId;

        // checking if event exists
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event cannot be found!' });
        }

        // checking if the user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User cannot be found!' });
        }

        // checking if user is already an attendee
        if (event.attendees.includes(userId)) {
            return res.status(404).json({ message: 'User is already an attendee' });
        }

        // Adding user as an attendee
        event.attendees.push(userId);

        // saving the updated event
        await event.save();
        res.json({ message: 'User has joined the event!' });


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});