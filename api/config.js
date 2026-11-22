// Sert la configuration PUBLIQUE au navigateur (URL Supabase + clé « anon », faite pour être publique).
export default function handler(req, res) {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  };
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(`window.SITE_CONFIG = ${JSON.stringify(config)};`);
}
