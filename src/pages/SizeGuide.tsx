import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const sizeChart = [
  { us: '6', uk: '5.5', eu: '38.5', cm: '24' },
  { us: '7', uk: '6', eu: '40', cm: '25' },
  { us: '8', uk: '7', eu: '41', cm: '26' },
  { us: '9', uk: '8', eu: '42.5', cm: '27' },
  { us: '10', uk: '9', eu: '44', cm: '28' },
  { us: '11', uk: '10', eu: '45', cm: '29' },
  { us: '12', uk: '11', eu: '46', cm: '30' },
  { us: '13', uk: '12', eu: '47.5', cm: '31' },
];

export default function SizeGuide() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Size Guide</h1>
        <p className="text-muted-foreground mb-8">Find your perfect fit with our sizing chart.</p>

        <div className="bg-card rounded-xl border p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Men's Shoe Sizes</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">US</th>
                <th className="text-left py-2 font-medium">UK</th>
                <th className="text-left py-2 font-medium">EU</th>
                <th className="text-left py-2 font-medium">CM</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {sizeChart.map((row) => (
                <tr key={row.us} className="border-b last:border-0">
                  <td className="py-2">{row.us}</td>
                  <td className="py-2">{row.uk}</td>
                  <td className="py-2">{row.eu}</td>
                  <td className="py-2">{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card rounded-xl border p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">Measuring Tips</h2>
          <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-5">
            <li>Measure your feet in the evening when they are at their largest</li>
            <li>Stand on a piece of paper and trace around your foot</li>
            <li>Measure the length from heel to the longest toe in centimeters</li>
            <li>If you're between sizes, we recommend going half a size up</li>
            <li>Contact us at 0705 186 502 for sizing assistance</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
