import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">Store settings, payment configuration, shipping zones, tax rules, and general preferences.</p>
        </CardContent>
      </Card>
    </div>
  );
}
