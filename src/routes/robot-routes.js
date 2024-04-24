import express from 'express';
import { createRobot, deleteRobot, getRobot, getRobots, updateRobot } from '../controllers/robot-controller.js';

const robotRoutes = express.Router();

robotRoutes.get('/', getRobots);
robotRoutes.get('/:id', getRobot);
robotRoutes.post('/', createRobot);
robotRoutes.patch('/:id', updateRobot);
robotRoutes.delete('/:id', deleteRobot);

export default robotRoutes;