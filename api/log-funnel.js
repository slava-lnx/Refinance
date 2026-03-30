/* ============================================================
   Vercel Serverless Function — Funnel Analytics Logger
   POST /api/log-funnel
   ============================================================ */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, funnel, sessionId, step, stepIndex, totalSteps, timeOnStep, totalTime, stepsCompleted, userAgent } = req.body;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event,         // 'step_complete' | 'funnel_complete' | 'drop_off'
      funnel,        // 'refi' | 'heloc'
      sessionId,
      step,
      stepIndex,
      totalSteps,
      timeOnStep,    // ms spent on this step
      totalTime,     // ms since funnel start
      stepsCompleted,
      userAgent,
    };

    // Logs are viewable in Vercel dashboard → Logs
    console.log('FUNNEL_ANALYTICS:', JSON.stringify(logEntry));

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Funnel analytics error:', err);
    return res.status(200).json({ ok: true }); // Never block the user
  }
}
