import express from 'express';
import { createTask, deleteTask, getTask, getTasks, getTasksByRobot, updateTask } from '../controllers/task-controller.js';

const taskRoutes = express.Router();

taskRoutes.get('/', getTasks);
taskRoutes.get('/:id', getTask);
taskRoutes.get('/robot/:robotId', getTasksByRobot);
taskRoutes.post('/', createTask);
taskRoutes.patch('/:id', updateTask);
taskRoutes.delete('/:id', deleteTask);

export default taskRoutes;