// Script temporal para debuggear diferencias entre tiendas
const https = require('https');

async function fetchStoreData(storeName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3004,
      path: `/${storeName}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Debug-Script'
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          hasCSS: data.includes('new-base-default.css'),
          hasTheme: data.includes('data-theme="new-base-default"'),
          colorVars: extractColorVars(data)
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function extractColorVars(html) {
  const vars = {};
  const matches = html.match(/--nbd-[^:]+:[^;]+/g) || [];
  matches.forEach(match => {
    const [key, value] = match.split(':');
    vars[key.trim()] = value.trim();
  });
  return vars;
}

async function main() {
  try {
    console.log('🔍 Debugging store differences...\n');

    const technovaData = await fetchStoreData('technova');
    console.log('📊 TECHNOVA DATA:', JSON.stringify(technovaData, null, 2));

    const lunaraData = await fetchStoreData('lunara');
    console.log('\n📊 LUNARA DATA:', JSON.stringify(lunaraData, null, 2));

    console.log('\n🔍 DIFFERENCES:');
    console.log('CSS Variables different:', JSON.stringify(technovaData.colorVars) !== JSON.stringify(lunaraData.colorVars));

  } catch (error) {
    console.error('Error:', error);
  }
}

main();