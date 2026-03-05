/* ============================================================
   Vercel Serverless Function — LeadPoint TCPA Disclosure Proxy
   GET /api/disclosure
   ============================================================ */

const CHANNEL_ID = process.env.LEADPOINT_CHANNEL_ID || '20994';
const DISCLOSURE_URL = `https://www.dataverify123.com/disclosure.ilp?channel_id=${CHANNEL_ID}`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(DISCLOSURE_URL);
    const text = await response.text();

    // The API returns JavaScript that sets a variable with HTML content.
    // Extract the HTML string from the JS variable assignment.
    // Typical format: var disclosure = '...html...';
    const match = text.match(/var\s+\w+\s*=\s*'([\s\S]*?)';/);
    const html = match ? match[1] : text;

    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ html });
  } catch (err) {
    console.error('Disclosure fetch error:', err);
    return res.status(500).json({ html: '' });
  }
}
