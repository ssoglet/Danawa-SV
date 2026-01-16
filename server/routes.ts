import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { radarQuerySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/radar", async (req, res) => {
    try {
      const query = radarQuerySchema.parse({
        month: req.query.month as string | undefined,
        nation: req.query.nation as string | undefined,
        minSales: req.query.minSales ? Number(req.query.minSales) : undefined,
        excludeNewEntry: req.query.excludeNewEntry === "true",
      });
      
      const result = await storage.getRadarData(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching radar data:", error);
      res.status(400).json({ error: "Invalid query parameters" });
    }
  });

  return httpServer;
}
