import { Card, CardContent } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default function AdminMarketing() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Marketing</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">Email campaigns, promotions, banner management, and notification tools.</p>
        </CardContent>
      </Card>
    </div>
  );
}
