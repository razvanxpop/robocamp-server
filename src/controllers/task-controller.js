import { randomBytes } from 'crypto';
import xss from 'xss';
import database from '../config/database.js';

export const createTask = async (req, res) => {
  const name = req.body.name !== undefined ? xss(req.body.name) : undefined;
  const description = req.body.description !== undefined ? xss(req.body.description) : undefined;
  const status = req.body.status !== undefined ? xss(req.body.status) : undefined;
  const user_id = req.body.user_id !== undefined ? xss(req.body.user_id) : undefined;
  console.log('user_id', user_id);
  const robot_id = await database('robots').select('id').where('user_id', user_id).then(data => data[randomBytes(1).readUInt8(0) % data.length].id);
  console.log('robot_id', robot_id);
  if(robot_id === undefined){
    return res.status(400).json({ message: 'There are no robots available to assign to this task' });
  }

  if(name === undefined || description === undefined || status === undefined){
    return res.status(400).json({ message: 'Name, description, status are required' });
  }

  const found = await database('robots').count('*').where('id', robot_id).then(result => result[0].count > 0);
  console.log('found', found)
  if (!found) {
    return res.status(400).json({ message: 'The robot that was assigned to this task does not exist' });
  } else {
    await database('tasks').insert({
      name: name,
      description: description,
      status: status,
      robot_id: robot_id
    })

    res.status(201).json(await database('tasks').select('*').where('robot_id', robot_id).then(data => data[data.length - 1]));
  }
};

export const getTasks = async (req, res) => {
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
  const id = xss(req.params.id);

  const task = await database('tasks').select('*').where('id', id).then(data => data[0])

  if (!task) {
    res.status(404).json({ message: 'Task not found' });
  } else {
    res.status(200).json(task);
  }
};

export const getTasksByRobot = async (req, res) => {
  const robot_id = xss(req.params.robot_id);
  const order = xss(req.query.order) || 'asc';
  const page = parseInt(xss(req.query.page)) || 1;
  const limit = parseInt(xss(req.query.limit)) || 10;

  const robot = await database('robots').select('*').where('id', robot_id).then(data => data[0]);

  if (!robot) {
    res.status(404).json({ message: 'There is no robot with the given id' });
  } else {
    const tasks = await database('tasks')
      .select('*')
      .where('robot_id', robot_id)
      .orderBy('created_at', order)
      .limit(limit)
      .offset((page - 1) * limit)
      .then(data => data);

    if (tasks.length === 0) {
      res.status(404).json({ message: 'There are no tasks for the specified robot' });
    } else {
      res.status(200).json(tasks);
    }
  }
};

export const updateTask = async (req, res) => {
  const id = xss(req.params.id);
  const name = req.body.name !== undefined ? xss(req.body.name) : undefined;
  const description = req.body.description !== undefined ? xss(req.body.description) : undefined;
  const status = req.body.status !== undefined ? xss(req.body.status) : undefined;
  const robot_id = req.body.robot_id !== undefined ? xss(req.body.robot_id) : undefined;

  if(robot_id === undefined){
    return res.status(400).json({ message: 'Robot ID is required' });
  }
  if(name === undefined && description === undefined && status === undefined){
    return res.status(400).json({ message: 'Nothing to update' });
  }

  const task = await database('tasks').select('*').where('id', id).then(data => data[0]);

  if(!task){
    res.status(400).json({message: 'Task not found'});
  } else {
    if(name === undefined){
      name = task.name;
    }
    if(description === undefined){
      description = task.description;
    }
    if(status === undefined){
      status = task.status;
    }
    if(robot_id === undefined){
      robot_id = task.robot_id;
    }

    const updatedTask = {
      name: name,
      description: description,
      status: status,
      updated_at: new Date(),
      robot_id: robot_id
    };

    await database('tasks').where('id', id).update(updatedTask)
      .then(async () => res.status(200).json(await database('tasks').select('*').where('id', id).then(data => data[0])))
      .catch(() => res.sendStatus(500))
  }
};

export const deleteTask = async (req, res) => {
  const id = xss(req.params.id);

  const found = await database('tasks').count('*').where('id', id).then(result => result[0].count > 0);

  if(!found){
    res.status(400).json({message: 'Task not found'});
  } else {
    await database('tasks').where('id', id).del()
      .then(() => res.sendStatus(204))
      .catch(() => res.sendStatus(500))
  }
};