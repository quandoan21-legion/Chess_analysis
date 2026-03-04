import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',');
    const row = {};

    headers.forEach((header, index) => {
      let value = values[index]?.trim();

      if (header === 'rated') {
        value = value === 'True' || value === 'true';
      } else if (['month', 'year', 'white_rating', 'black_rating'].includes(header)) {
        value = parseInt(value) || null;
      }

      row[header] = value;
    });

    data.push(row);
  }

  return data;
}

async function importData() {
  try {
    console.log('Reading CSV file...');
    const dataPath = path.join(__dirname, '../data/data.csv');
    const games = parseCSV(dataPath);

    console.log(`Found ${games.length} games to import`);

    const batchSize = 100;
    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      console.log(`Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(games.length / batchSize)}...`);

      const { error } = await supabase
        .from('chess_games')
        .insert(batch);

      if (error) {
        console.error('Error importing batch:', error);
        continue;
      }
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importData();
