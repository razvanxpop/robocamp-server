const request = require('supertest');
const app = require('../../index.js');

describe('Robots Controller', () => {
  it('should create a new robot', async () => {
    const newRobot = {
      name: 'Test Robot',
      email: 'test@email.com'
    };

    const res = await request(app)
      .post('/api/robots')
      .send(newRobot);

    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual(newRobot.name);
    // Add more assertions for other robot properties...
  });

  it('should get all robots', async () => {
    const res = await request(app).get('/api/robots');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a robot by id', async () => {
    const robotId = 1; // Replace with a valid robot id
    const res = await request(app).get(`/api/robots/${robotId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(robotId);
  });

  it('should update a robot', async () => {
    const robotId = 1; // Replace with a valid robot id
    const updatedRobot = {
      name: 'Updated Robot',
      // Other updated robot properties...
    };

    const res = await request(app)
      .put(`/api/robots/${robotId}`)
      .send(updatedRobot);

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updatedRobot.name);
    // Add more assertions for other updated robot properties...
  });

  it('should delete a robot', async () => {
    const robotId = 1; // Replace with a valid robot id

    const res = await request(app).delete(`/api/robots/${robotId}`);

    expect(res.statusCode).toEqual(204);
  });

  // Add more tests for other methods...
});