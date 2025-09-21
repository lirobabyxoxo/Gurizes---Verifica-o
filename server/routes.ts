import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerConfigSchema, insertVerificationRequestSchema } from "@shared/schema";
import { startDiscordBot } from "./discord-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Server configuration routes
  app.get("/api/server-config/:serverId", async (req, res) => {
    try {
      const { serverId } = req.params;
      const config = await storage.getServerConfig(serverId);
      
      if (!config) {
        return res.status(404).json({ message: "Server configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/server-config/:serverId", async (req, res) => {
    try {
      const { serverId } = req.params;
      const validatedData = insertServerConfigSchema.parse(req.body);
      
      const config = await storage.createOrUpdateServerConfig(serverId, validatedData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Verification request routes
  app.get("/api/verification-requests/:serverId", async (req, res) => {
    try {
      const { serverId } = req.params;
      const { status } = req.query;
      
      const requests = await storage.getVerificationRequests(serverId, status as string);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/verification-requests", async (req, res) => {
    try {
      const validatedData = insertVerificationRequestSchema.parse(req.body);
      const request = await storage.createVerificationRequest(validatedData);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.patch("/api/verification-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, approvedBy, approvedByUsername } = req.body;
      
      const updated = await storage.updateVerificationRequest(id, {
        status,
        approvedBy,
        approvedByUsername,
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Verification request not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stats routes
  app.get("/api/verification-stats/:serverId", async (req, res) => {
    try {
      const { serverId } = req.params;
      const stats = await storage.getVerificationStats(serverId);
      
      if (!stats) {
        return res.status(404).json({ message: "Stats not found" });
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Recent activity route
  app.get("/api/recent-activity/:serverId", async (req, res) => {
    try {
      const { serverId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const activity = await storage.getRecentActivity(serverId, limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // Start Discord bot
  startDiscordBot(storage);

  return httpServer;
}
