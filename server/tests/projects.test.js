require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const CapstoneProject = require('../src/models/CapstoneProject');
const UserProject = require('../src/models/UserProject');
const { generateToken } = require('../src/utils/jwt');

describe('Capstone Projects — Start Build & Workspace Endpoints', () => {
  let user1, token1;
  let user2, token2;
  const testSuffix = Date.now();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create 2 test users to verify authentication and user isolation
    user1 = await User.create({
      name: `Test Student 1 ${testSuffix}`,
      email: `teststudent1_${testSuffix}@example.com`,
      password: 'Password123!',
      role: 'student',
      isActive: true,
    });
    token1 = generateToken(user1._id, user1.role);

    user2 = await User.create({
      name: `Test Student 2 ${testSuffix}`,
      email: `teststudent2_${testSuffix}@example.com`,
      password: 'Password123!',
      role: 'student',
      isActive: true,
    });
    token2 = generateToken(user2._id, user2.role);
  });

  afterAll(async () => {
    // Cleanup test data
    if (user1) {
      await UserProject.deleteMany({ user: { $in: [user1._id, user2._id] } });
      await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
    }
    await mongoose.connection.close();
  });

  describe('GET /api/projects', () => {
    it('should return available capstone project recommendations with stableId', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeGreaterThanOrEqual(4);

      const titles = res.body.projects.map((p) => p.title);
      expect(titles).toContain('Microservices E-Commerce Platform with Docker & Redis');
      expect(titles).toContain('Automated Resume Parser & ATS Screener Engine');
      expect(titles).toContain('CI/CD Pipeline & Kubernetes Deployment Automation');
      expect(titles).toContain('Real-Time Collaborative Project Workspace');
    });
  });

  describe('POST /api/projects/:id/start', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/projects/proj-1/start');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject start requests with an unknown project ID with 404', async () => {
      const res = await request(app)
        .post('/api/projects/non-existent-proj-id-9999/start')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should successfully start a recommended capstone project and create persistent UserProject record', async () => {
      const res = await request(app)
        .post('/api/projects/proj-1/start')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.project).toBeDefined();

      const created = res.body.project;
      expect(created.title).toBe('Microservices E-Commerce Platform with Docker & Redis');
      expect(created.status).toBe('Planning');
      expect(created.progress).toBe(0);
      expect(created.user.toString()).toBe(user1._id.toString());
      expect(Array.isArray(created.milestones)).toBe(true);
      expect(created.milestones.length).toBeGreaterThanOrEqual(4);

      // Verify persistence directly in the database
      const dbProject = await UserProject.findById(created._id);
      expect(dbProject).not.toBeNull();
      expect(dbProject.title).toBe('Microservices E-Commerce Platform with Docker & Redis');
      expect(dbProject.status).toBe('Planning');
    });

    it('should gracefully handle duplicate start clicks without creating duplicate records', async () => {
      // User 1 starts proj-1 a second time
      const res = await request(app)
        .post('/api/projects/proj-1/start')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.alreadyStarted).toBe(true);

      // Verify only 1 project record exists for this user and project
      const count = await UserProject.countDocuments({
        user: user1._id,
        title: 'Microservices E-Commerce Platform with Docker & Redis',
      });
      expect(count).toBe(1);
    });
  });

  describe('GET /api/projects/user/started', () => {
    it('should list all started projects for the current authenticated user', async () => {
      const res = await request(app)
        .get('/api/projects/user/started')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBe(1);
      expect(res.body.projects[0].title).toBe('Microservices E-Commerce Platform with Docker & Redis');
    });

    it('should return empty list for user2 who has not started any projects', async () => {
      const res = await request(app)
        .get('/api/projects/user/started')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.projects.length).toBe(0);
    });
  });

  describe('GET /api/projects/user/:id & Authorization Security', () => {
    let user1Project;

    beforeAll(async () => {
      user1Project = await UserProject.findOne({ user: user1._id });
    });

    it('should allow the project owner to retrieve private project details', async () => {
      const res = await request(app)
        .get(`/api/projects/user/${user1Project._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.project._id.toString()).toBe(user1Project._id.toString());
      expect(res.body.project.title).toBe(user1Project.title);
    });

    it('should forbid user2 from accessing user1 project details with 403', async () => {
      const res = await request(app)
        .get(`/api/projects/user/${user1Project._id}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/access denied/i);
    });
  });

  describe('PATCH /api/projects/user/:id — Milestones & Progress Calculation', () => {
    let user1Project;

    beforeAll(async () => {
      user1Project = await UserProject.findOne({ user: user1._id });
    });

    it('should toggle a milestone, recalculate progress %, and update status to In Progress', async () => {
      const milestoneId = user1Project.milestones[0].id;

      const res = await request(app)
        .patch(`/api/projects/user/${user1Project._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          milestoneId,
          completed: true,
          githubRepoUrl: 'https://github.com/teststudent1/ecommerce-platform',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = res.body.project;
      const targetMilestone = updated.milestones.find((m) => m.id === milestoneId);
      expect(targetMilestone.completed).toBe(true);
      expect(updated.progress).toBeGreaterThan(0);
      expect(updated.status).toBe('In Progress');
      expect(updated.githubRepoUrl).toBe('https://github.com/teststudent1/ecommerce-platform');
    });

    it('should prevent unauthorized users from modifying another user project', async () => {
      const res = await request(app)
        .patch(`/api/projects/user/${user1Project._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          status: 'Completed',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
