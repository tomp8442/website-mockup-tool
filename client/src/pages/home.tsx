import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { screenshotRequestSchema, type ScreenshotRequest, type ScreenshotResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Download, Globe, Image, Bolt, Shield, Palette, Upload, WandSparkles, Check, Info, Laptop, ExternalLink, AlertTriangle } from "lucide-react";

export default function Home() {
  const [mockupResult, setMockupResult] = useState<ScreenshotResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<ScreenshotRequest>({
    resolver: zodResolver(screenshotRequestSchema),
    defaultValues: {
      url: "",
      quality: "high",
      deviceFrame: "laptop"
    }
  });

  const generateMockupMutation = useMutation({
    mutationFn: async (data: ScreenshotRequest) => {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      try {
        const response = await apiRequest("POST", "/api/generate-mockup", data);
        const result = await response.json();
        clearInterval(progressInterval);
        setProgress(100);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      setMockupResult(data);
      toast({
        title: "Mockup Generated Successfully!",
        description: "Your website mockup is ready for download.",
      });
      setTimeout(() => setProgress(0), 1000);
    },
    onError: (error: any) => {
      setProgress(0);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate mockup. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDownload = () => {
    if (mockupResult) {
      window.open(mockupResult.mockupUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    return `${diffInMinutes} minutes ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Laptop className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Mockup Generator</h1>
                <p className="text-sm text-slate-600">Create professional device mockups instantly</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                <WandSparkles className="inline w-4 h-4 mr-2" />
                Free Tool
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Transform Websites into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Beautiful Mockups
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Enter any website URL and instantly generate a professional laptop mockup. Perfect for presentations, portfolios, and marketing materials.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Form */}
          <Card className="shadow-xl border-slate-200">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Globe className="text-white w-4 h-4" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Website URL</h3>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => generateMockupMutation.mutate(data))} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter Website URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="https://example.com"
                              {...field}
                              className="pr-10"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="flex items-center text-xs">
                          <Info className="w-3 h-3 mr-1" />
                          We'll capture a screenshot optimized for your selected device
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deviceFrame"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Frame</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="laptop">Standard Laptop</SelectItem>
                              <SelectItem value="mobile">Mobile Phone</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quality</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">High (1440px)</SelectItem>
                              <SelectItem value="medium">Medium (1024px)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-4 shadow-lg hover:shadow-xl"
                    disabled={generateMockupMutation.isPending}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {generateMockupMutation.isPending ? "Generating..." : "Generate Mockup"}
                  </Button>
                </form>
              </Form>

              {/* Loading State */}
              {generateMockupMutation.isPending && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="animate-spin">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">Generating mockup...</p>
                      <p className="text-xs text-blue-600">This may take up to a minute</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Error State */}
              {generateMockupMutation.isError && (
                <Alert className="mt-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {generateMockupMutation.error?.message || "Failed to generate mockup. Please check the URL and try again."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="shadow-xl border-slate-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <Image className="text-white w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Preview</h3>
                </div>
                {mockupResult && (
                  <Button 
                    onClick={handleDownload}
                    className="bg-green-500 hover:bg-green-600 shadow-md"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              {!mockupResult ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Laptop className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Ready to Generate</h4>
                  <p className="text-slate-600 text-sm">Enter a website URL and click "Generate Mockup" to see your preview here</p>
                </div>
              ) : (
                <div>
                  <img 
                    src={mockupResult.mockupUrl} 
                    alt="Generated laptop mockup with website screenshot" 
                    className="w-full rounded-xl shadow-lg border border-slate-200"
                  />
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Generated mockup</span>
                      <span className="text-slate-500">{formatTimeAgo(mockupResult.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>{mockupResult.dimensions.width} × {mockupResult.dimensions.height} pixels</span>
                      <span>{formatFileSize(mockupResult.fileSize)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Laptop className="text-white w-4 h-4" />
              </div>
              <span className="text-slate-900 font-semibold">Mockup Generator</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <span>Built with Puppeteer & Sharp</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
