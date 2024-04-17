import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import knex from "knex";
import validator from 'validator';
import { robotGenerator, taskGenerator } from "./cronjob.js";
import "./socket.js";

dotenv.config();

const app = express();

// Middleware to parse
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

// Database connection
export const database = knex({
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  }
})

//robotGenerator(); // generate robots
//taskGenerator(); // generate tasks

// Routes
// Create (POST)
app.post('/api/robots', async (req, res) => {
    const { name, email } = req.body;
  
    const emailExists = await database('robots').count('*').where('email', email).then(result => result[0].count > 0);
    if (emailExists) {
        return res.status(400).json({ message: 'Email already exists in the list of robots' });
    }

    await database('robots').insert({
      name: name,
      email: email
    })

    res.status(201).json(await database('robots').select('*').where('email', email).then(data => data[0]));
});

// Read all (GET)
app.get('/api/robots', async (req, res) => {
    res.status(200).json(await database('robots').select('*').then(data => data));
});

// Read by ID (GET)
app.get('/api/robots/:id', async (req, res) => {
    const { id } = req.params;
    const robot = await database('robots').select('*').where('id', id).then(data => data[0])
    if (!robot) {
        res.status(404).json({ message: 'Robot not found' });
    } else {
        res.status(200).json(robot);
    }
});

// Update (PATCH)
app.patch('/api/robots/:id', async (req, res) => {
    const id = req.params.id;
    const updatedResource = req.body;
    const found = await database('robots').count('*').where('id', id).then(result => result[0].count > 0);
    if (!found) {
        res.status(404).json({ message: 'Robot not found' });
    } else {
        await database('robots').where('id', id).update(updatedResource)
          .then(async () => res.status(200).json(await database('robots').select('*').where('id', id).then(data => data[0])))
          .catch(() => res.sendStatus(500))
    }
});

// Delete (DELETE)
app.delete('/api/robots/:id', async (req, res) => {
    const { id } = req.params;
    const found = await database('robots').count('*').where('id', id).then(result => result[0].count > 0);
    if (!found) {
        res.status(404).json({ message: 'Robot not found' });
    } else {
        await database('robots').where('id', id).del()
          .then(() => res.sendStatus(204))
          .catch(() => res.sendStatus(500))
    }
});

// Create a task
app.post('/api/tasks', async (req, res) => {
  const { name, description, status, robotId } = req.body;

  const robotExists = await database('robots').count('*').where('id', robotId).then(result => result[0].count > 0);

  if (!robotExists) {
    return res.status(400).json({ message: 'The robot that was assigned to this task does not exist' });
  } else {
    await database('tasks').insert({
      name: name,
      description: description,
      status: status,
      robotid: robotId
    })

    res.status(201).json(await database('tasks').select('*').where('robotid', robotId).then(data => data));
  }
});

// Read tasks
app.get('/api/tasks', async (req, res) => {
  res.status(200).json(await database('tasks').select('*').then(data => data));
});

// Read tasks for a robot
app.get('/api/tasks/:robotId', async (req, res) => {
  const { robotId } = req.params;

  const robot = await database('robots').select('*').where('id', robotId).then(data => data[0]);

  if (!robot) {
    res.status(404).json({ message: 'There is no robot with the given id' });
  } else {
    res.status(200).json(await database('tasks').select('*').where('robotid', robotId).then(data => data));
  }
})

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  const found = await database('tasks').count('*').where('id', id).then(result => result[0].count > 0);

  if(!found){
    res.status(400).json({message: 'Task not found'});
  } else {
    await database('tasks').where('id', id).update(req.body)
      .then(async () => res.status(200).json(await database('tasks').select('*').where('id', id).then(data => data[0])))
      .catch(() => res.sendStatus(500))
  }
});

  // Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  const found = await database('tasks').count('*').where('id', id).then(result => result[0].count > 0);

  if(!found){
    res.status(400).json({message: 'Task not found'});
  } else {
    await database('tasks').where('id', id).del()
      .then(() => res.sendStatus(204))
      .catch(() => res.sendStatus(500))
  }
});

// Start the server
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is listening at http://localhost:${process.env.SERVER_PORT}`);
});

export default app;

/*
  - You must write unit tests for your endpoints 
  (so at least 5 unit tests are expected - one for each endpoint)
*/