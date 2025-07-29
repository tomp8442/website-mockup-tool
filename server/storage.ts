import { ScreenshotResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  storeMockup(mockup: ScreenshotResponse): Promise<ScreenshotResponse>;
  getMockup(id: string): Promise<ScreenshotResponse | undefined>;
}

export class MemStorage implements IStorage {
  private mockups: Map<string, ScreenshotResponse>;

  constructor() {
    this.mockups = new Map();
  }

  async storeMockup(mockup: ScreenshotResponse): Promise<ScreenshotResponse> {
    this.mockups.set(mockup.id, mockup);
    return mockup;
  }

  async getMockup(id: string): Promise<ScreenshotResponse | undefined> {
    return this.mockups.get(id);
  }
}

export const storage = new MemStorage();
