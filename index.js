import express from "express";
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import cors from 'cors';
import validator from 'validator';
import "./socket.js";

dotenv.config();

const app = express();
const SERVER_PORT = process.env.SERVER_PORT;

// Middleware to parse
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

const resources = []
// Routes

// Create (POST)
app.post('/api/resources', (req, res) => {
    const newRobot = req.body;

    const emailExists = resources.some(robot => robot.email === newRobot.email);
    if (emailExists) {
        return res.status(400).json({ message: 'Email already exists in the list of robots' });
    }

    resources.push(newRobot);
    res.status(201).json(newRobot);
});

// Read all (GET)
app.get('/api/resources', (req, res) => {
    res.status(200).json(resources);
});

// Read by ID (GET)
app.get('/api/resources/:id', (req, res) => {
    const id = req.params.id;
    const resource = resources.find(r => r.id === id);
    if (!resource) {
        res.status(404).json({ message: 'Resource not found' });
    } else {
        res.status(200).json(resource);
    }
});

// Update (PATCH)
app.patch('/api/resources/:id', (req, res) => {
    const id = req.params.id;
    const updatedResource = req.body;
    const index = resources.findIndex(r => r.id === id);
    if (index === -1) {
        res.status(404).json({ message: 'Resource not found' });
    } else {
        resources[index] = { ...resources[index], ...updatedResource };
        res.status(200).json(resources[index]);
    }
});

// Delete (DELETE)
app.delete('/api/resources/:id', (req, res) => {
    const id = req.params.id;
    const index = resources.findIndex(r => r.id === id);
    if (index === -1) {
        res.status(404).json({ message: 'Resource not found' });
    } else {
        resources.splice(index, 1);
        res.sendStatus(204);
    }
});

// Start the server
app.listen(SERVER_PORT, () => {
    console.log(`Server is listening at http://localhost:${SERVER_PORT}`);
});

export default app;

/*
Requirements:
  - CRUD
    ○ Create (POST) should return a 201 Created status code
    ○ Read (GET) should return a 200 status code
      § 2 endpoints are required - getOne and getAll (list of all the elements)
    ○ Update (PATCH) should return a 200 OK status code. Should use the ID of the entity to find it
    ○ Delete (DELETE) should return a 204 No content status code WITHOUT any response body
  - Frontend should handle those calls and their respective status codes. 
  It also must provide a visual feedback to the user (alert, snack bar, notification etc… anything)
  - If Read (by id), Update or Delete are trying to manipulate a non-existent entity, 
  the backend should return a 404 status code and frontend should display the right message. 
  You can also return a json with a message from the backend.
  - You must write unit tests for your endpoints 
  (so at least 5 unit tests are expected - one for each endpoint)
*/

/*
  
*/