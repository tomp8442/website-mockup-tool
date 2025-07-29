import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { screenshotRequestSchema } from "@shared/schema";
import { mockupGenerator } from "./services/mockup-generator";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate mockup endpoint
  app.post("/api/generate-mockup", async (req, res) => {
    try {
      const validatedData = screenshotRequestSchema.parse(req.body);
      
      const mockup = await mockupGenerator.generateMockup(validatedData);
      const storedMockup = await storage.storeMockup(mockup);
      
      res.json(storedMockup);
    } catch (error: any) {
      console.error("Error generating mockup:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      
      if (error.message.includes('Navigation timeout')) {
        return res.status(400).json({ 
          message: "The website took too long to load. Please try again or check if the URL is accessible." 
        });
      }
      
      if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        return res.status(400).json({ 
          message: "Could not resolve the website URL. Please check if the URL is correct and accessible." 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to generate mockup. Please check the URL and try again." 
      });
    }
  });

  // Download mockup endpoint
  app.get("/api/mockups/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const mockup = await storage.getMockup(id);
      
      if (!mockup) {
        return res.status(404).json({ message: "Mockup not found" });
      }
      
      const filePath = await mockupGenerator.getMockupPath(id);
      
      if (!filePath) {
        return res.status(404).json({ message: "Mockup file not found" });
      }
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="mockup-${id}.png"`);
      res.sendFile(path.resolve(filePath));
      
    } catch (error) {
      console.error("Error downloading mockup:", error);
      res.status(500).json({ message: "Failed to download mockup" });
    }
  });

  // Get mockup info endpoint
  app.get("/api/mockups/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const mockup = await storage.getMockup(id);
      
      if (!mockup) {
        return res.status(404).json({ message: "Mockup not found" });
      }
      
      res.json(mockup);
    } catch (error) {
      console.error("Error fetching mockup:", error);
      res.status(500).json({ message: "Failed to fetch mockup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
