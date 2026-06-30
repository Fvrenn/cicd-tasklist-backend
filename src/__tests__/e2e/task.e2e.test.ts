import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { vi } from "vitest";
import testPrisma from "./setup.js";

// Mock the prisma singleton to use the test client
vi.mock("../../lib/prisma.js", () => ({
	default: testPrisma,
}));

// Import app AFTER mocking prisma
const { default: app } = await import("../../app.js");
import request from "supertest";

describe("Task API E2E Tests", () => {
	beforeEach(async () => {
		// Clean up database between tests
		await testPrisma.task.deleteMany();
	});

	afterAll(async () => {
		await testPrisma.$disconnect();
	});

	describe("POST /api/tasks", () => {
		it("should create a new task", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: "E2E Task", description: "E2E Description" });

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			expect(res.body.title).toBe("E2E Task");
			expect(res.body.description).toBe("E2E Description");
			expect(res.body.completed).toBe(false);
		});
		it("should return 400 if the task title is invalid", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: "", description: "E2E Description" });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
			expect(res.body.error).toBe("Title is required and must be a non-empty string");
		});
		it("should return 400 if the task title is not a string", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: 123, description: "E2E Description" });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("error");
			expect(res.body.error).toBe("Title is required and must be a non-empty string");
		});

	});

	describe("GET /api/tasks", () => {
		it("should fetch all tasks", async () => {
			const res = await request(app).get("/api/tasks");
			expect(res.status).toBe(200);
			expect(res.body).toBeInstanceOf(Array);
		});

		it("should return an empty array when no tasks exist", async () => {
			const res = await request(app).get("/api/tasks");
			expect(res.status).toBe(200);
			expect(res.body).toEqual([]);
		});

		it("should return tasks ordered by createdAt desc", async () => {
			await testPrisma.task.create({ data: { title: "First" } });
			await testPrisma.task.create({ data: { title: "Second" } });
			const res = await request(app).get("/api/tasks");
			expect(res.status).toBe(200);
			expect(res.body[0].title).toBe("Second");
			expect(res.body[1].title).toBe("First");
		});
	});

	describe("GET /api/tasks/:id", () => {
		it("should fetch a task by ID", async () => {
			const task = await testPrisma.task.create({
				data: { title: "E2E Task", description: "E2E Description" },
			});
			const res = await request(app).get(`/api/tasks/${task.id}`);
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("id");
			expect(res.body.id).toBe(task.id);
		});

		it("should return 404 if the task does not exist", async () => {
			const res = await request(app).get("/api/tasks/999999");
			expect(res.status).toBe(404);
			expect(res.body.error).toBe("Task not found");
		});

		it("should return 400 if the task ID is invalid", async () => {
			const res = await request(app).get("/api/tasks/abc");
			expect(res.status).toBe(400);
			expect(res.body.error).toBe("Invalid task ID");
		});
	});

	describe("PUT /api/tasks/:id", () => {
		it("should update a task by ID", async () => {
			const task = await testPrisma.task.create({
				data: { title: "E2E Task", description: "E2E Description" },
			});
			const res = await request(app)
				.put(`/api/tasks/${task.id}`)
				.send({ title: "E2E Task Updated", completed: true });
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("id");
			expect(res.body.id).toBe(task.id);
			expect(res.body.title).toBe("E2E Task Updated");
			expect(res.body.completed).toBe(true);
		});

		it("should return 404 if the task does not exist", async () => {
			const res = await request(app)
				.put("/api/tasks/999999")
				.send({ title: "Updated" });
			expect(res.status).toBe(404);
			expect(res.body.error).toBe("Task not found");
		});

		it("should return 400 if the task ID is invalid", async () => {
			const res = await request(app)
				.put("/api/tasks/abc")
				.send({ title: "Updated" });
			expect(res.status).toBe(400);
			expect(res.body.error).toBe("Invalid task ID");
		});
	});

	describe("DELETE /api/tasks/:id", () => {
		it("should delete a task by ID", async () => {
			const task = await testPrisma.task.create({
				data: { title: "E2E Task", description: "E2E Description" },
			});
			const res = await request(app).delete(`/api/tasks/${task.id}`);
			expect(res.status).toBe(204);
		});

		it("should actually remove the task from the database", async () => {
			const task = await testPrisma.task.create({
				data: { title: "To Delete" },
			});
			await request(app).delete(`/api/tasks/${task.id}`);
			const found = await testPrisma.task.findUnique({ where: { id: task.id } });
			expect(found).toBeNull();
		});

		it("should return 404 if the task does not exist", async () => {
			const res = await request(app).delete("/api/tasks/999999");
			expect(res.status).toBe(404);
			expect(res.body.error).toBe("Task not found");
		});

		it("should return 400 if the task ID is invalid", async () => {
			const res = await request(app).delete("/api/tasks/abc");
			expect(res.status).toBe(400);
			expect(res.body.error).toBe("Invalid task ID");
		});
	});
});
