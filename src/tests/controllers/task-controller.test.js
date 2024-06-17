import request from 'supertest';
import app from '../app'; // Assuming your Express app is exported from app.js
import database from '../config/database.js';

// Mock the database module
jest.mock('../config/database.js');

describe('Task API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        name: 'Test Task',
        description: 'Task description',
        status: 'pending',
        user_id: '1'
      };

      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([{ id: 1 }]);
        } else if (query.includes('insert')) {
          return Promise.resolve([1]);
        }
      });

      const response = await request(app)
        .post('/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'Test Task');
    });

    it('should return 400 if required fields are missing', async () => {
      const taskData = {
        description: 'Task description',
        status: 'pending',
        user_id: '1'
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Name, description, status are required');
    });

    it('should return 400 if no robot is available', async () => {
      const taskData = {
        name: 'Test Task',
        description: 'Task description',
        status: 'pending',
        user_id: '1'
      };

      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([]);
        }
      });

      const response = await request(app)
        .post('/tasks')
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'There are no robots available to assign to this task');
    });
  });

  describe('GET /tasks', () => {
    it('should return paginated tasks', async () => {
      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([
            { id: 1, name: 'Test Task 1', description: 'Task description', status: 'pending' },
            { id: 2, name: 'Test Task 2', description: 'Task description', status: 'completed' }
          ]);
        }
      });

      const response = await request(app).get('/tasks?page=1&limit=2');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by ID', async () => {
      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([{ id: 1, name: 'Test Task', description: 'Task description', status: 'pending' }]);
        }
      });

      const response = await request(app).get('/tasks/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Task');
    });

    it('should return 404 if task is not found', async () => {
      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([]);
        }
      });

      const response = await request(app).get('/tasks/999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Task not found');
    });
  });

  describe('GET /robots/:robot_id/tasks', () => {
    it('should return tasks for a specific robot', async () => {
      database.mockImplementation((query) => {
        if (query.includes('robots')) {
          return Promise.resolve([{ id: 1 }]);
        } else if (query.includes('tasks')) {
          return Promise.resolve([
            { id: 1, name: 'Test Task', description: 'Task description', status: 'pending', robot_id: 1 }
          ]);
        }
      });

      const response = await request(app).get('/robots/1/tasks');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it('should return 404 if no tasks are found for the robot', async () => {
      database.mockImplementation((query) => {
        if (query.includes('robots')) {
          return Promise.resolve([{ id: 1 }]);
        } else if (query.includes('tasks')) {
          return Promise.resolve([]);
        }
      });

      const response = await request(app).get('/robots/1/tasks');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'There are no tasks for the specified robot');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task', async () => {
      const taskData = {
        name: 'Updated Task',
        description: 'Updated description',
        status: 'completed',
        robot_id: '1'
      };

      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([{ id: 1, name: 'Test Task', description: 'Task description', status: 'pending' }]);
        } else if (query.includes('update')) {
          return Promise.resolve(1);
        }
      });

      const response = await request(app)
        .put('/tasks/1')
        .send(taskData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Task');
    });

    it('should return 400 if task is not found', async () => {
      const taskData = {
        name: 'Updated Task',
        description: 'Updated description',
        status: 'completed',
        robot_id: '1'
      };

      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([]);
        }
      });

      const response = await request(app)
        .put('/tasks/999')
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Task not found');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([{ id: 1 }]);
        } else if (query.includes('del')) {
          return Promise.resolve(1);
        }
      });

      const response = await request(app).delete('/tasks/1');
      expect(response.status).toBe(204);
    });

    it('should return 400 if task is not found', async () => {
      database.mockImplementation((query) => {
        if (query.includes('select')) {
          return Promise.resolve([]);
        }
      });

      const response = await request(app).delete('/tasks/999');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Task not found');
    });
  });
});
