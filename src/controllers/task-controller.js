import xss from 'xss';
import database from '../config/database.js';

export const createTask = async (req, res) => {
  // Sanitize the input to prevent cross-site scripting (XSS) attacks
  const name = req.body.name !== undefined ? xss(req.body.name) : undefined;
  const description = req.body.description !== undefined ? xss(req.body.description) : undefined;
  const status = req.body.status !== undefined ? xss(req.body.status) : undefined;
  const robotId = req.body.robotId !== undefined ? xss(req.body.robotId) : undefined;

  // Check if any of the required fields are missing
  if(name === undefined || description === undefined || status === undefined || robotId === undefined){
    return res.status(400).json({ message: 'Name, description, status and robotId are required' });
  }

  // Check if the robot assigned to the task exists
  const robotExists = await database('robots').count('*').where('id', robotId).then(result => result[0].count > 0);

  // If the robot does not exist, return a 400 error with a message
  if (!robotExists) {
    return res.status(400).json({ message: 'The robot that was assigned to this task does not exist' });
  } else {
    // Insert the new task into the database
    await database('tasks').insert({
      name: name,
      description: description,
      status: status,
      robotid: robotId
    })

    // Return the newly created task object
    res.status(201).json(await database('tasks').select('*').where('robotid', robotId).then(data => data));
  }
};

export const getTasks = async (req, res) => {
  // Set the response status to 200 and retrieve all tasks from the database
  const page = parseInt(xss(req.query.page)) || 1;
  const limit = parseInt(xss(req.query.limit)) || 10;

  const tasks = await database('tasks')
    .select('*')
    .limit(limit)
    .offset((page - 1) * limit)
    .then(data => data);

  res.status(200).json(tasks);
};

export const getTask = async (req, res) => {
  // Sanitize the ID parameter to prevent cross-site scripting (XSS) attacks
  const id = xss(req.params.id);

  // Retrieve the task from the database based on the provided ID
  const task = await database('tasks').select('*').where('id', id).then(data => data[0])

  // If the task is not found, send a 404 error response with a message
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
  } else {
    // If the task is found, send a 200 success response with the task data
    res.status(200).json(task);
  }
};

export const getTasksByRobot = async (req, res) => {
  // Sanitize the robot ID parameter to prevent cross-site scripting (XSS) attacks
  const robotId = xss(req.params.robotId);
  const order = xss(req.query.order) || 'asc';
  const page = parseInt(xss(req.query.page)) || 1;
  const limit = parseInt(xss(req.query.limit)) || 10;

  // Retrieve the robot from the database based on the provided ID
  const robot = await database('robots').select('*').where('id', robotId).then(data => data[0]);

  // If the robot is not found, send a 404 error response with a message
  if (!robot) {
    res.status(404).json({ message: 'There is no robot with the given id' });
  } else {
    // If the robot is found, retrieve the tasks for the specified robot and order them by created date
    const tasks = await database('tasks')
      .select('*')
      .where('robotid', robotId)
      .orderBy('createdat', order)
      .limit(limit)
      .offset((page - 1) * limit)
      .then(data => data);

    if (tasks.length === 0) {
      res.status(404).json({ message: 'There are no tasks for the specified robot' });
    } else {
      // If tasks are found, send a 200 success response with the tasks data
      res.status(200).json(tasks);
    }
  }
};

export const updateTask = async (req, res) => {
  // Sanitize the ID parameter to prevent cross-site scripting (XSS) attacks
  const id = xss(req.params.id);

  // Check if the task exists in the database
  const found = await database('tasks').count('*').where('id', id).then(result => result[0].count > 0);

  // If the task is not found, send a 400 error response with a message
  if(!found){
    res.status(400).json({message: 'Task not found'});
  } else {
    // Update the task in the database
    await database('tasks').where('id', id).update(req.body)
      .then(async () => res.status(200).json(await database('tasks').select('*').where('id', id).then(data => data[0])))
      .catch(() => res.sendStatus(500))
  }
};

export const deleteTask = async (req, res) => {
  // Sanitize the ID parameter to prevent cross-site scripting (XSS) attacks
  const id = xss(req.params.id);

  // Check if the task exists in the database
  const found = await database('tasks').count('*').where('id', id).then(result => result[0].count > 0);

  // If the task is not found, send a 400 error response with a message
  if(!found){
    res.status(400).json({message: 'Task not found'});
  } else {
    // If the task is found, delete the task from the database
    await database('tasks').where('id', id).del()
      .then(() => res.sendStatus(204))
      .catch(() => res.sendStatus(500))
  }
};