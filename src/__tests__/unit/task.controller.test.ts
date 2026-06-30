import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import type { Task } from "@prisma/client";

// Mock the service module
vi.mock("../../services/task.service.js", () => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
}));

import * as taskService from "../../services/task.service.js";
import * as taskController from "../../controllers/task.controller.js";

const mockService = vi.mocked(taskService);

const mockTask: Task = {
	id: 1,
	title: "Test Task",
	description: "Test description",
	completed: false,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createMockResponse(): Response {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
	} as unknown as Response;
	return res;
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
	return {
		params: {},
		body: {},
		query: {},
		...overrides,
	} as unknown as Request;
}

describe("TaskController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getAllTasks", () => {
		it("should return 200 with all tasks", async () => {
			const tasks = [mockTask];
			mockService.findAll.mockResolvedValue(tasks);
			const req = createMockRequest();
			const res = createMockResponse();

			await taskController.getAllTasks(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(tasks);
		});
		it("should return 200 with an empty array if there are no tasks", async () => {
			mockService.findAll.mockResolvedValue([]);
			const req = createMockRequest();
			const res = createMockResponse();

			await taskController.getAllTasks(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith([]);
		});
		it("should return 500 if the service throws an error", async () => {
			mockService.findAll.mockRejectedValue(new Error("Failed to fetch tasks"));
			const req = createMockRequest();
			const res = createMockResponse();

			await taskController.getAllTasks(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch tasks" });
		});
		it
	});

	describe("getTaskById", () => {
		it("should return 200 with a single task", async () => {
			mockService.findById.mockResolvedValue(mockTask);
			const req = createMockRequest({ params: { id: "1" } });
			const res = createMockResponse();

			await taskController.getTaskById(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockTask);
		});
		it("should return 404 if the task is not found", async () => {
			mockService.findById.mockResolvedValue(null);
			const req = createMockRequest({ params: { id: "1" } });
			const res = createMockResponse();

			await taskController.getTaskById(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
		});
		it("should return 400 if the task ID is invalid", async () => {
			const req = createMockRequest({ params: { id: "abc" } });
			const res = createMockResponse();

			await taskController.getTaskById(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid task ID" });
		});
		it("should return 500 if the service throws an error", async () => {
			mockService.findById.mockRejectedValue(new Error("Failed to fetch task"));
			const req = createMockRequest({ params: { id: "1" } });
			const res = createMockResponse();

			await taskController.getTaskById(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch task" });
		});

	});

	describe("createTask", () => {
		it("should return 201 with the created task", async () => {
			mockService.create.mockResolvedValue(mockTask);
			const req = createMockRequest({ body: { title: "Test Task", description: "Test description" } });
			const res = createMockResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(mockTask);
		});
		it("should return 400 if the task title is invalid", async () => {
			mockService.create.mockResolvedValue(mockTask);
			const req = createMockRequest({ body: { title: "", description: "Test description" } });
			const res = createMockResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Title is required and must be a non-empty string" });
		});
		it("should return 400 if the task title is not a string", async () => {
			mockService.create.mockResolvedValue(mockTask);
			const req = createMockRequest({ body: { title: 123, description: "Test description" } });
			const res = createMockResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Title is required and must be a non-empty string" });
		});
		it("should return 500 if the service throws an error", async () => {
			mockService.create.mockRejectedValue(new Error("Failed to create task"));
			const req = createMockRequest({ body: { title: "Test Task", description: "Test description" } });
			const res = createMockResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Failed to create task" });
		});
	});

	describe("updateTask", () => {
		it("should return 200 with the updated task", async () => {
			mockService.update.mockResolvedValue(mockTask);
			const req = createMockRequest({ params: { id: "1" }, body: { title: "Test Task Updated", completed: true } });
			const res = createMockResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(mockTask);
		});
		it("should return 400 if the task ID is invalid", async () => {
			const req = createMockRequest({ params: { id: "abc" }, body: { title: "Test Task Updated", completed: true } });
			const res = createMockResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid task ID" });
		});
		it("should return 404 if the task is not found", async () => {
			mockService.update.mockRejectedValue(new Error("Task not found"));
			const req = createMockRequest({ params: { id: "999" }, body: { title: "Test Task Updated" } });
			const res = createMockResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
		});
		it("should return 500 if the service throws an error", async () => {
			mockService.update.mockRejectedValue(new Error("Failed to update task"));
			const req = createMockRequest({ params: { id: "1" }, body: { title: "Test Task Updated", completed: true } });
			const res = createMockResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Failed to update task" });
		});
	});

	describe("deleteTask", () => {
		it("should return 204 with no content", async () => {
			mockService.remove.mockResolvedValue(mockTask);
			const req = createMockRequest({ params: { id: "1" } });
			const res = createMockResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.send).toHaveBeenCalled();
		});
		it("should return 400 if the task ID is invalid", async () => {
			const req = createMockRequest({ params: { id: "abc" } });
			const res = createMockResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid task ID" });
		});
		it("should return 404 if the task is not found", async () => {
			mockService.remove.mockRejectedValue(new Error("Task not found"));
			const req = createMockRequest({ params: { id: "999" } });
			const res = createMockResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
		});
		it("should return 500 if the service throws an error", async () => {
			mockService.remove.mockRejectedValue(new Error("Failed to delete task"));
			const req = createMockRequest({ params: { id: "1" } });
			const res = createMockResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete task" });
		});
	});
});
