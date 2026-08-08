<?php

namespace Database\Seeders;

use App\Models\AgriResource;
use App\Models\MarketPrice;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MarketPriceSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resourceIds = AgriResource::query()->pluck('id', 'name');
        $now = now();
        $marketPrices = [];

        foreach ($this->marketPriceRows() as $row) {
            $resourceId = $resourceIds[$row['commodity']] ?? null;

            if ($resourceId === null) {
                continue;
            }

            $marketPrices[] = [
                'agri_resource_id' => $resourceId,
                'specifications' => $row['specifications'],
                'longitude' => null,
                'latitude' => null,
                'province' => null,
                'region' => 'NCR',
                'market' => $row['market'],
                'price' => $row['price'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        MarketPrice::query()->delete();
        MarketPrice::insert($marketPrices);
    }

    /**
     * @return array<int, array{commodity: string, specifications: string, market: string, price: float}>
     */
    private function marketPriceRows(): array
    {
        $csv = <<<'CSV'
COMMODITY,SPECIFICATIONS,COMMONWEALTH MARKET,GUADALUPE PUBLIC MARKET,NEW LAS PINAS CITY PUBLIC MARKET,MARIKINA PUBLIC MARKET,MUNOZ MARKET,PASAY CITY MARKET,MUTYA NG PASIG MEGA MARKET,QUINTA MARKET,SAN ANDRES MARKET,MEGA Q MART,PAMILIHANG LUNGSOD NG MUNTINLUPA,MALABON CENTRAL MARKET,PRITIL MARKET,MAYPAJO PUBLIC MARKET,PACO MARKET,DAGONOY MARKET,TRABAJO MARKET,BLUMENTRITT MARKET,MANDALUYONG PUBLIC MARKET I,NAVOTAS AGORA MARKET,LA HUERTA MARKET,CARTIMAR MARKET,GRACE MARKETPLACE (PATEROS),MURPHY MARKET,KAMUNING MARKET,AGORA PUBLIC MARKET (SAN JUAN),BICUTAN MARKET,TAGUIG PEOPLE'S MARKET,NEW MARULAS PUBLIC MARKET,BALINTAWAK MARKET (CLOVERLEAF),FARMERS MARKET,HULONG DUHAT PUBLIC MARKET,KMLV NEW KARUHATAN MARKET,MANDALUYONG PUBLIC MARKET II,NEW PARANG MARKET,NORTH DIVERSION MARKET,POBLACION PUBLIC MARKET,SUKI MARKET
Ampalaya,4-5 PCS/KG,140,120,100,100,80,70,100,120,100,80,100,90,120,90,160,110,130,150,120,90,90,120,140,120,110,90,90,140,100,100,120,100,120,120,100,N/A,80,120
Squash,SUPREMA VARIETY,50,50,65,60,60,40,60,70,70,70,60,70,70,60,50,60,80,60,70,60,80,70,90,80,80,60,60,80,70,50,80,70,70,70,60,N/A,70,80
Pechay (Native),3-4 SMALL BUNDLES/KG,150,80,90,100,120,80,90,100,100,120,120,80,100,100,120,100,100,100,120,120,100,120,120,120,100,80,80,100,120,70,120,90,100,100,100,N/A,60,120
Sitao,3-4 SMALL BUNDLES/KG,120,120,150,100,100,120,100,120,120,120,120,90,120,120,180,120,120,180,200,120,160,130,150,120,140,90,120,120,100,150,160,90,120,160,N/A,N/A,90,120
Eggplant,3-4 SMALL BUNDLES/KG,80,70,110,100,100,100,120,100,100,100,120,80,120,90,80,110,80,90,100,100,90,120,120,100,90,120,80,100,100,80,120,90,140,90,100,N/A,100,140
Tomato,15-18 PCS/KG,50,100,105,100,80,100,100,100,120,100,100,100,140,100,80,120,140,70,140,120,80,100,100,120,130,120,70,120,120,50,120,100,120,130,100,N/A,100,140
Cabbage (Scorpio),750GM-1KG/HEAD,120,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,80,N/A,N/A,N/A,N/A,100,N/A,N/A,N/A,N/A,N/A,N/A,N/A,120,N/A,N/A,N/A,60,N/A,N/A,N/A
Carrots,8-10PCS/KG,100,80,105,N/A,100,75,120,N/A,100,N/A,90,100,120,80,120,100,100,120,120,100,N/A,90,140,140,130,100,90,120,120,100,150,100,120,100,100,N/A,80,N/A
Habichuelas (Baguio Bean),KG,140,120,125,130,120,110,100,120,120,140,140,140,N/A,90,180,120,140,200,140,120,120,110,170,140,140,120,120,120,120,90,200,140,180,130,140,N/A,100,150
White Potato,10-12PCS/KG,100,120,145,120,130,120,120,140,140,140,120,120,140,130,140,120,120,150,140,120,120,110,140,120,140,100,120,120,140,100,180,120,120,120,120,N/A,100,150
Pechay (Baguio),KG,60,80,90,80,50,80,80,80,80,80,70,80,100,60,80,80,90,80,80,90,80,55,100,90,100,80,80,100,100,60,100,80,100,100,60,N/A,60,80
Chayote,KG,40,60,70,50,40,30,50,60,70,50,60,50,60,50,100,60,70,90,80,40,70,45,80,70,70,60,60,80,50,35,80,60,50,70,50,40,40,70
Broccoli,MEDIUM (8-10CM DIAMETER/BUNCH HD),N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,120,200,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A
Cauliflower,MEDIUM (8-10CM DIAMETER/BUNCH HD),200,140,200,N/A,200,200,200,220,180,N/A,220,150,N/A,N/A,140,200,140,150,200,220,N/A,170,N/A,220,N/A,200,180,220,200,150,200,150,200,200,N/A,N/A,150,250
Bell Pepper (Green),MEDIUM (151-250GM/PC),240,250,240,180,N/A,200,250,N/A,200,200,200,N/A,N/A,N/A,300,250,N/A,N/A,N/A,N/A,N/A,140,N/A,260,300,N/A,N/A,N/A,N/A,250,300,N/A,300,N/A,N/A,N/A,N/A,N/A
Bell Pepper (Red),MEDIUM (151-250GM/PC),240,200,200,150,200,200,230,250,180,180,200,250,250,200,200,180,150,200,250,240,240,140,280,260,250,180,220,250,250,120,300,200,200,300,250,N/A,140,250
Celery,MEDIUM (501-800 G),140,120,220,N/A,150,140,160,140,140,N/A,140,180,N/A,150,140,150,N/A,N/A,150,160,N/A,55,180,250,250,150,120,200,150,100,250,180,150,N/A,N/A,N/A,100,N/A
Cabbage (Rare Ball),510GM-1KG/HEAD,N/A,N/A,100,80,60,N/A,80,N/A,80,N/A,60,N/A,80,N/A,N/A,N/A,N/A,N/A,120,N/A,90,N/A,N/A,N/A,N/A,60,100,120,N/A,60,120,N/A,N/A,130,N/A,70,N/A,80
Cabbage (Wonder Ball),510GM-1KG/HEAD,N/A,100,N/A,N/A,N/A,45,N/A,N/A,N/A,60,N/A,80,N/A,70,N/A,60,90,N/A,N/A,90,N/A,50,N/A,90,100,N/A,N/A,N/A,90,N/A,N/A,90,N/A,N/A,N/A,N/A,50,N/A
Lettuce (Green Ice),KG,220,200,160,150,N/A,140,N/A,N/A,150,N/A,N/A,200,N/A,N/A,200,180,N/A,N/A,300,250,N/A,80,N/A,N/A,N/A,180,N/A,N/A,200,120,200,200,N/A,N/A,200,N/A,100,N/A
Lettuce (Iceberg),MEDIUM(301-450CM DIAMETER/BUNCH HD),N/A,150,N/A,N/A,N/A,100,N/A,N/A,180,N/A,N/A,N/A,N/A,N/A,200,N/A,N/A,N/A,N/A,N/A,N/A,80,N/A,N/A,N/A,180,N/A,N/A,250,150,250,N/A,N/A,N/A,N/A,N/A,N/A,N/A
Lettuce (Romaine),KG,N/A,260,200,150,N/A,140,N/A,N/A,150,N/A,200,N/A,N/A,N/A,N/A,250,N/A,N/A,N/A,N/A,N/A,80,N/A,N/A,N/A,N/A,N/A,N/A,N/A,200,200,N/A,N/A,N/A,N/A,N/A,N/A,N/A
Garlic(Imported),KG,130,120,140,140,120,140,160,150,160,140,130,140,160,150,150,140,140,150,150,160,150,150,190,150,160,150,130,160,140,120,150,150,160,140,160,120,140,180
Garlic(Native),KG,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,350,N/A,N/A,350,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A
Ginger,"FAIRLY WELL-MATURED, MEDIUM (150-300 GM)",140,160,190,180,N/A,160,200,200,200,200,170,160,170,200,150,200,140,180,200,160,180,170,180,200,200,150,170,200,200,N/A,200,160,200,180,180,N/A,150,200
Red Onion,13-15 PCS/KG,85,100,95,120,80,90,120,100,120,120,80,80,140,120,100,100,100,120,100,100,100,100,180,120,120,100,90,120,130,80,150,90,120,100,100,80,90,150
Red Onion (Imported),KG,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A
White Onion,KG,80,100,100,100,80,80,100,100,120,120,100,80,140,100,N/A,100,90,100,90,90,N/A,120,140,120,120,100,100,120,100,75,150,70,100,90,100,N/A,70,140
White Onion (Imported),KG,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A
Chili (Red),KG,120,200,200,150,150,110,140,150,180,120,140,200,N/A,N/A,200,180,180,N/A,200,N/A,200,100,150,200,300,150,180,250,150,180,300,200,150,220,N/A,N/A,180,250
CSV;

        $rows = array_map('str_getcsv', preg_split('/\R/', trim($csv)));
        $headers = array_shift($rows);
        $markets = array_slice($headers, 2);
        $marketPriceRows = [];

        foreach ($rows as $row) {
            $commodity = $row[0];
            $specifications = $row[1];

            foreach ($markets as $index => $market) {
                $price = $row[$index + 2] ?? null;

                if ($price === null || $price === 'N/A') {
                    continue;
                }

                $marketPriceRows[] = [
                    'commodity' => $commodity,
                    'specifications' => $specifications,
                    'market' => $market,
                    'price' => (float) $price,
                ];
            }
        }

        return $marketPriceRows;
    }
}
