import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Image } from 'lucide-react';
import { generateIcon, downloadIcon, generateAllIcons } from '@/lib/generateIcon';
import { useEffect, useState } from 'react';

export function IconGenerator() {
  const [previews, setPreviews] = useState<Record<number, string>>({});

  useEffect(() => {
    // Generate previews for different sizes
    const sizes = [16, 32, 180, 192, 512];
    const newPreviews: Record<number, string> = {};
    
    sizes.forEach((size) => {
      newPreviews[size] = generateIcon(size);
    });
    
    setPreviews(newPreviews);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Icon Generator</h1>
          <p className="text-muted-foreground">
            Generate all required icons for NostrEats PWA
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Icons will be generated with fork, knife, and lightning bolt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 items-end">
              {Object.entries(previews).map(([size, dataUrl]) => (
                <div key={size} className="text-center">
                  <img
                    src={dataUrl}
                    alt={`${size}x${size} icon`}
                    className="border border-muted rounded-lg mb-2"
                    style={{ width: size, height: size }}
                  />
                  <p className="text-xs text-muted-foreground">{size}x{size}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download Icons</CardTitle>
            <CardDescription>
              Download individual icons or all at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => downloadIcon(16, 'favicon-16x16.png')}
              >
                <Download className="h-4 w-4 mr-2" />
                favicon-16x16.png
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadIcon(32, 'favicon-32x32.png')}
              >
                <Download className="h-4 w-4 mr-2" />
                favicon-32x32.png
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadIcon(180, 'apple-touch-icon.png')}
              >
                <Download className="h-4 w-4 mr-2" />
                apple-touch-icon.png
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadIcon(192, 'icon-192.png')}
              >
                <Download className="h-4 w-4 mr-2" />
                icon-192.png
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadIcon(512, 'icon-512.png')}
              >
                <Download className="h-4 w-4 mr-2" />
                icon-512.png
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={generateAllIcons}
                className="w-full"
                size="lg"
              >
                <Image className="h-4 w-4 mr-2" />
                Download All Icons
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                All icons will download automatically (may need to allow multiple downloads)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click "Download All Icons" to get all required files</li>
              <li>Move the downloaded files to the <code className="bg-muted px-1 rounded">/public</code> directory</li>
              <li>Rebuild the project</li>
              <li>Deploy to see the icons in action</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default IconGenerator;
