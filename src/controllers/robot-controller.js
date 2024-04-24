import xss from 'xss';
import database from '../config/database.js';

export const createRobot = async (req, res) => {
  const name = req.body.name !== undefined ? xss(req.body.name) : undefined;
  const email = req.body.email !== undefined ? xss(req.body.email) : undefined;

  // Check if either the name or email is missing
  if(name === undefined || email === undefined){
    return res.status(400).json({ message: 'Name and email are required' });
  }

  // Check if the email already exists in the list of robots
  const emailExists = await database('robots').count('*').where('email', email).then(result => result[0].count > 0);
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists in the list of robots' });
  }

  // Insert the new robot into the database
  await database('robots').insert({
    name: name,
    email: email
  })

  // Return the newly created robot object
  res.status(201).json(await database('robots').select('*').where('email', email).then(data => data[0]));
};

export const getRobots = async (req, res) => {
  // Set the response status to 200 and retrieve all robots from the database
  const page = parseInt(xss(req.query.page)) || 1;
  const limit = parseInt(xss(req.query.limit)) || 10;

  const robots = await database('robots')
    .select('*')
    .limit(limit)
    .offset((page - 1) * limit)
    .then(data => data);

  res.status(200).json(robots);
};

export const getRobot = async (req, res) => {
  // Sanitize the ID parameter to prevent cross-site scripting (XSS) attacks
  const id = xss(req.params.id);

  // Retrieve the robot from the database based on the provided ID
  const robot = await database('robots').select('*').where('id', id).then(data => data[0])

  // If the robot is not found, send a 404 error response with a message
  if (!robot) {
    res.status(404).json({ message: 'Robot not found' });
  } else {
    // If the robot is found, send a 200 success response with the robot data
    res.status(200).json(robot);
  }
};

export const updateRobot = async (req, res) => {
  // Sanitize the ID parameter to prevent cross-site scripting (XSS) attacks
  const id = xss(req.params.id);
  let name = req.body.name !== undefined ? xss(req.body.name) : undefined;
  let email = req.body.email !== undefined ? xss(req.body.email) : undefined;
  
  // Check if both name and email are missing
  if(name === undefined && email === undefined){
      res.status(400).json({message: 'Nothing to update'});
  }

  // Retrieve the robot from the database based on the provided ID
  const robot = await database('robots').select('*').where('id', id).then(data => data[0]);

  // If the robot is not found, send a 404 error response with a message
  if (!robot) {
    res.status(404).json({ message: 'Robot not found' });
  } else {
    // If the robot is found, update the name and email if not provided
    if(name === undefined){
      name = robot.name;
    }
    if (email === undefined){
      email = robot.email;
    }

    // Update the robot in the database
    await database('robots').where('id', id).update({ name, email })
      .then(async () => res.status(200).json(await database('robots').select('*').where('id', id).then(data => data[0])))
      .catch(() => res.sendStatus(500))
  }
};

export const deleteRobot = async (req, res) => {
  // Sanitize the ID parameter to prevent cross-site scripting (XSS) attacks
  const id = xss(req.params.id);

  // Check if the robot exists in the database
  const found = await database('robots').count('*').where('id', id).then(result => result[0].count > 0);

  // If the robot is not found, send a 404 error response with a message
  if (!found) {
    res.status(404).json({ message: 'Robot not found' });
  } else {
    // If the robot is found, delete the robot from the database
    await database('robots').where('id', id).del()
      .then(() => res.sendStatus(204))
      .catch(() => res.sendStatus(500))
  }
};