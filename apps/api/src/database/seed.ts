/**
 * Demo data around Cordeiros (BA). Everything here is FICTITIOUS: names, CAR codes and
 * notification texts only imitate the format of real notices for the prototype.
 */
import { Client } from 'pg';
import { config } from '../config';

// lng lat rings (closed) in SIRGAS 2000
const MAIN_PROPERTY = 'MULTIPOLYGON(((-41.9330 -15.0380,-41.9280 -15.0380,-41.9280 -15.0340,-41.9330 -15.0340,-41.9330 -15.0380)))';
// The neighbour invades ~50 m of the east side of the main property.
const NEIGHBOUR_PROPERTY = 'MULTIPOLYGON(((-41.9285 -15.0385,-41.9240 -15.0385,-41.9240 -15.0335,-41.9285 -15.0335,-41.9285 -15.0385)))';

async function seed() {
  const client = new Client({ connectionString: config.databaseUrl });
  await client.connect();
  try {
    await client.query('BEGIN');
    const main = await client.query<{ id: string }>(
      `INSERT INTO properties (car_code, name, municipality, state, owner_name, fiscal_modules, declared_area)
       VALUES ($1, $2, 'Cordeiros', 'BA', $3, 0.8, ST_GeomFromText($4, 4674))
       ON CONFLICT (car_code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['BA-0000000-DEMO0000000000000000000000000001', 'Sítio Boa Esperança (demonstração)', 'Raimundo da Silva (fictício)', MAIN_PROPERTY],
    );
    await client.query(
      `INSERT INTO properties (car_code, name, municipality, state, owner_name, fiscal_modules, declared_area)
       VALUES ($1, $2, 'Cordeiros', 'BA', $3, 1.1, ST_GeomFromText($4, 4674))
       ON CONFLICT (car_code) DO NOTHING`,
      ['BA-0000000-DEMO0000000000000000000000000002', 'Fazenda Vizinha (demonstração)', 'Proprietário vizinho (fictício)', NEIGHBOUR_PROPERTY],
    );
    const propertyId = main.rows[0].id;
    await client.query('DELETE FROM notifications WHERE property_id = $1', [propertyId]);
    await client.query(
      `INSERT INTO notifications (property_id, external_code, issued_by, issued_at, due_date, kind, original_text) VALUES
       ($1, 'NOT-DEMO-0001', 'Órgão estadual gestor do CAR (demonstração)', current_date - 20, current_date + 40, 'overlap',
        'Notificação de pendência: identificada sobreposição de área entre o perímetro declarado do imóvel e o imóvel BA-0000000-DEMO...0002. O proprietário ou possuidor deverá apresentar documentação comprobatória da posse ou propriedade da área sobreposta ou proceder à retificação do perímetro do imóvel no prazo de 60 (sessenta) dias, sob pena de o cadastro permanecer na condição de pendente.'),
       ($1, 'NOT-DEMO-0002', 'Órgão estadual gestor do CAR (demonstração)', current_date - 20, current_date + 40, 'legal_reserve',
        'Notificação de pendência: a área de Reserva Legal declarada é inferior ao percentual mínimo exigido pelo art. 12 da Lei nº 12.651/2012 para a localização do imóvel. Para imóveis com até 4 módulos fiscais, observar o disposto no art. 67 da referida Lei. Retificar a declaração da Reserva Legal ou apresentar justificativa no prazo de 60 (sessenta) dias.')`,
      [propertyId],
    );
    await client.query('COMMIT');
    console.log(`seeded demo property ${propertyId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
