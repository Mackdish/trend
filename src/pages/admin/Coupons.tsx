import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AdminCoupons() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">Coupon management with discount codes, percentage/fixed discounts, usage limits, and expiry dates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
