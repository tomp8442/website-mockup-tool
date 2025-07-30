import puppeteer from 'puppeteer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { ScreenshotRequest, ScreenshotResponse } from '@shared/schema';

const TEMP_DIR = path.join(process.cwd(), 'temp');
const ASSETS_DIR = path.join(process.cwd(), 'server', 'assets');
const MOCKUPS_DIR = path.join(process.cwd(), 'generated');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.mkdir(MOCKUPS_DIR, { recursive: true });
}

export class MockupGenerator {
  private browser: any = null;

  async init() {
    await ensureDirectories();
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async generateMockup(request: ScreenshotRequest): Promise<ScreenshotResponse> {
    if (!this.browser) {
      await this.init();
    }

    const id = randomUUID();
    const screenshotPath = path.join(TEMP_DIR, `screenshot-${id}.png`);
    const mockupPath = path.join(MOCKUPS_DIR, `mockup-${id}.png`);

    try {
      // Take screenshot with Puppeteer
      const page = await this.browser.newPage();
      
      // Set viewport based on device frame and quality
      let width, height, deviceScaleFactor;
      
      if (request.deviceFrame === 'mobile') {
        // Mobile viewport settings for mobile view
        width = 390;  // Mobile phone width
        height = 844; // Mobile phone height
        deviceScaleFactor = 3; // Retina display
        
        // Set user agent for mobile
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
      } else {
        // Desktop/MacBook viewport settings
        width = request.quality === 'high' ? 1440 : 1024;
        height = Math.round(width * 0.7); // 16:10 aspect ratio
        deviceScaleFactor = 1;
      }
      
      await page.setViewport({ width, height, deviceScaleFactor });
      
      // Navigate to URL with timeout
      await page.goto(request.url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Take screenshot of viewport only (not full page)
      await page.screenshot({
        path: screenshotPath,
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width,
          height
        }
      });

      await page.close();

      // Load device mockup frame based on selection
      const mockupFileName = request.deviceFrame === 'mobile' ? 'mobile-mockup.png' : 'laptop-mockup.png';
      const mockupFramePath = path.join(ASSETS_DIR, mockupFileName);
      const mockupFrame = sharp(mockupFramePath);
      const mockupMetadata = await mockupFrame.metadata();

      // Load screenshot
      const screenshot = sharp(screenshotPath);
      const screenshotMetadata = await screenshot.metadata();

      // Calculate the precise screen area within the device mockup
      const mockupWidth = mockupMetadata.width || 1024;
      const mockupHeight = mockupMetadata.height || 640;
      
      let screenArea;
      
      if (request.deviceFrame === 'mobile') {
        // Mobile screen area positioning - fine-tuned for perfect fit
        const adjustedWidth = Math.round(mockupWidth * 0.57);  // 57% of frame width (2% increase from 55%)
        const adjustedHeight = Math.round(mockupHeight * 0.81); // 81% of frame height (2% increase from 79%)
        
        screenArea = {
          left: Math.round((mockupWidth - adjustedWidth) / 2),   // Center horizontally
          top: Math.round((mockupHeight - adjustedHeight) / 2),  // Center vertically
          width: adjustedWidth,
          height: adjustedHeight
        };
      } else {
        // MacBook screen area positioning
        screenArea = {
          left: Math.round(mockupWidth * 0.128),  // 12.8% from left
          top: Math.round(mockupHeight * 0.25),   // 25% from top
          width: Math.round(mockupWidth * 0.744), // 74.4% of frame width
          height: Math.round(mockupHeight * 0.47) // 47% of frame height
        };
      }

      // Resize screenshot to exactly match the screen area dimensions
      let resizedScreenshotBuffer;
      
      if (request.deviceFrame === 'mobile') {
        // For mobile, add rounded corners to match the device
        const cornerRadius = Math.round(screenArea.width * 0.08); // 8% of width for corner radius
        
        resizedScreenshotBuffer = await screenshot
          .resize(screenArea.width, screenArea.height, {
            fit: 'fill',
            kernel: sharp.kernel.lanczos3
          })
          .composite([{
            input: Buffer.from(`
              <svg width="${screenArea.width}" height="${screenArea.height}">
                <defs>
                  <mask id="rounded">
                    <rect width="100%" height="100%" fill="white" rx="${cornerRadius}" ry="${cornerRadius}"/>
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="black" mask="url(#rounded)"/>
              </svg>
            `),
            blend: 'dest-in'
          }])
          .png()
          .toBuffer();
      } else {
        // Regular screenshot for MacBook
        resizedScreenshotBuffer = await screenshot
          .resize(screenArea.width, screenArea.height, {
            fit: 'fill',
            kernel: sharp.kernel.lanczos3
          })
          .png()
          .toBuffer();
      }

      // Create a base canvas with the mockup dimensions
      const baseCanvas = sharp({
        create: {
          width: mockupWidth,
          height: mockupHeight,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      });

      // First composite the screenshot onto the base canvas
      const canvasWithScreenshot = await baseCanvas
        .composite([{
          input: resizedScreenshotBuffer,
          left: screenArea.left,
          top: screenArea.top,
          blend: 'over'
        }])
        .png()
        .toBuffer();

      // Then composite the laptop frame on top to create the layered effect
      const compositedImage = await sharp(canvasWithScreenshot)
        .composite([{
          input: mockupFramePath,
          left: 0,
          top: 0,
          blend: 'over' // Laptop frame goes on top
        }])
        .png()
        .toFile(mockupPath);

      // Get file stats
      const stats = await fs.stat(mockupPath);
      const finalMetadata = await sharp(mockupPath).metadata();

      // Clean up temporary screenshot
      await fs.unlink(screenshotPath);

      const response: ScreenshotResponse = {
        id,
        url: request.url,
        mockupUrl: `/api/mockups/${id}/download`,
        dimensions: {
          width: finalMetadata.width || 0,
          height: finalMetadata.height || 0
        },
        fileSize: stats.size,
        createdAt: new Date().toISOString()
      };

      return response;

    } catch (error) {
      // Clean up files on error
      try {
        await fs.unlink(screenshotPath);
      } catch {}
      
      throw error;
    }
  }

  async getMockupPath(id: string): Promise<string | null> {
    const mockupPath = path.join(MOCKUPS_DIR, `mockup-${id}.png`);
    
    try {
      await fs.access(mockupPath);
      return mockupPath;
    } catch {
      return null;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const mockupGenerator = new MockupGenerator();

// Initialize on startup
mockupGenerator.init().catch(console.error);

// Cleanup on process exit
process.on('SIGINT', () => mockupGenerator.cleanup());
process.on('SIGTERM', () => mockupGenerator.cleanup());
