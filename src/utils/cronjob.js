import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';
import wss from './socket.js';

export const robotGenerator = async () => {
  while(true){
    console.log('Generating robot...') 
    const id = uuidv4();
    const user_id = await database('users').select('id').then(data => data[Math.floor(Math.random() * data.length)].id); 

    const robot = {
      id: id,
      name: `Robot-${id}`,
      email: `${id}@gmail.com`,
      user_id: user_id
    }

    await database('robots').insert(robot)

    console.log('Robot generated:', robot)
    wss.clients.forEach(client => {
      if(client.readyState === 1){
        client.send(JSON.stringify(robot))
      }
    });

    const timeOutDuration = Math.floor(Math.random() * 5000) + 10000
    await new Promise(resolve => setTimeout(resolve, timeOutDuration))
  }
};

export const taskGenerator = async () => {
  while(true){
    console.log('Generating task...') 
    const id = uuidv4(); 
    const robot_id =  await database('robots').select('id').then(data => data[Math.floor(Math.random() * data.length)].id);

    const task = {
      id: id,
      name: `Task-${id}`,
      description: `Description-${id}`,
      status: 'Pending',
      robot_id: robot_id
    };

    await database('tasks').insert(task);

    console.log('Task generated:', task)
    wss.clients.forEach(client => {
      if(client.readyState === 1){
        client.send(JSON.stringify(task))
      }
    });

    const timeOutDuration = Math.floor(Math.random() * 5000) + 10000
    await new Promise(resolve => setTimeout(resolve, timeOutDuration))
  }
};