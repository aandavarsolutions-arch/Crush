const crypto = require('crypto');
const { db } = require('../config/supabase');
const { sanitizeString } = require('../middleware/sanitize');

// Generate short random code (e.g. "AbX72K")
function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// Generate secret key for stats authorization
function generateSecretKey() {
  return crypto.randomBytes(16).toString('hex');
}

exports.createLink = async (req, res) => {
  try {
    const creatorName = sanitizeString(req.body.creatorName, 50);

    if (!creatorName) {
      return res.status(400).json({ success: false, error: 'Please enter your name.' });
    }

    // Generate unique short code
    let uniqueCode = generateShortCode(6);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.getLinkByCode(uniqueCode);
      if (!existing) break;
      uniqueCode = generateShortCode(6);
      attempts++;
    }

    const secretKey = generateSecretKey();

    const link = await db.createLink({
      uniqueCode,
      creatorName,
      secretKey
    });

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    res.json({
      success: true,
      data: {
        code: link.unique_code,
        creatorName: link.creator_name,
        shareUrl: `${baseUrl}/c/${link.unique_code}`,
        statsUrl: `${baseUrl}/stats/${link.unique_code}?key=${secretKey}`,
        secretKey: secretKey
      }
    });
  } catch (error) {
    console.error('Error in createLink:', error);
    res.status(500).json({ success: false, error: 'Failed to generate link. Please try again.' });
  }
};

exports.getPrankInfo = async (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = sanitizeString(code, 16);

    const link = await db.getLinkByCode(cleanCode);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Prank link not found or has expired.' });
    }

    // Increment open count asynchronously
    await db.incrementOpenCount(cleanCode);

    res.json({
      success: true,
      data: {
        creatorName: link.creator_name,
        code: link.unique_code
      }
    });
  } catch (error) {
    console.error('Error in getPrankInfo:', error);
    res.status(500).json({ success: false, error: 'Unable to load prank details.' });
  }
};

exports.submitPrank = async (req, res) => {
  try {
    const { code, visitorName, crushName } = req.body;
    const cleanCode = sanitizeString(code, 16);
    const cleanVisitorName = sanitizeString(visitorName, 50);
    const cleanCrushName = sanitizeString(crushName, 50);

    if (!cleanVisitorName || !cleanCrushName) {
      return res.status(400).json({ success: false, error: 'Both your name and your crush\'s name are required!' });
    }

    const link = await db.getLinkByCode(cleanCode);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Prank link not found.' });
    }

    const submission = await db.addSubmission({
      linkId: link.id,
      creatorName: link.creator_name,
      visitorName: cleanVisitorName,
      crushName: cleanCrushName
    });

    res.json({
      success: true,
      data: {
        submissionId: submission.id,
        creatorName: link.creator_name,
        visitorName: submission.visitor_name,
        crushName: submission.crush_name
      }
    });
  } catch (error) {
    console.error('Error in submitPrank:', error);
    res.status(500).json({ success: false, error: 'Submission failed. Please try again.' });
  }
};

exports.updateReaction = async (req, res) => {
  try {
    const { submissionId, reaction } = req.body;
    const cleanSubmissionId = sanitizeString(submissionId, 64);
    const cleanReaction = sanitizeString(reaction, 10);

    const validReactions = ['😂', '😭', '💀', '❤️', '😡'];
    if (!validReactions.includes(cleanReaction)) {
      return res.status(400).json({ success: false, error: 'Invalid reaction emoji.' });
    }

    const updated = await db.updateReaction(cleanSubmissionId, cleanReaction);
    res.json({ success: true, data: { reaction: updated ? updated.reaction : cleanReaction } });
  } catch (error) {
    console.error('Error in updateReaction:', error);
    res.status(500).json({ success: false, error: 'Failed to update reaction.' });
  }
};

exports.getLinkStats = async (req, res) => {
  try {
    const { code } = req.params;
    const key = req.query.key;

    const cleanCode = sanitizeString(code, 16);
    const cleanKey = sanitizeString(key || '', 64);

    const link = await db.getLinkByCode(cleanCode);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found.' });
    }

    // Verify secret key for security
    if (link.secret_key !== cleanKey) {
      return res.status(403).json({ success: false, error: 'Access denied. Invalid statistics authorization key.' });
    }

    const submissions = await db.getSubmissionsByLinkId(link.id);

    // Calculate reaction breakdown
    const reactionsCount = { '😂': 0, '😭': 0, '💀': 0, '❤️': 0, '😡': 0 };
    submissions.forEach(sub => {
      if (sub.reaction && reactionsCount.hasOwnProperty(sub.reaction)) {
        reactionsCount[sub.reaction]++;
      }
    });

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    res.json({
      success: true,
      data: {
        code: link.unique_code,
        creatorName: link.creator_name,
        openCount: link.open_count || 0,
        completedCount: link.completed_count || 0,
        crushSubmissionsCount: submissions.length,
        shareUrl: `${baseUrl}/c/${link.unique_code}`,
        reactionsBreakdown: reactionsCount,
        submissions: submissions.map(sub => ({
          id: sub.id,
          visitorName: sub.visitor_name,
          crushName: sub.crush_name,
          reaction: sub.reaction || '😂',
          createdAt: sub.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Error in getLinkStats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics.' });
  }
};

exports.healthCheckDb = async (req, res) => {
  try {
    const { supabase, isSupabaseConfigured, SUPABASE_URL } = require('../config/supabase');
    
    let supabaseStatus = 'Not configured';
    let testLinks = null;
    let testSubmissions = null;
    let errorMessage = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: linksData, error: linksErr } = await supabase.from('links').select('id, unique_code, creator_name').limit(5);
        const { data: subsData, error: subsErr } = await supabase.from('submissions').select('id, creator_name, visitor_name, crush_name').limit(5);

        if (linksErr || subsErr) {
          errorMessage = { linksErr, subsErr };
          supabaseStatus = 'Connected but Query Error';
        } else {
          supabaseStatus = 'Connected and Working 100%';
          testLinks = linksData;
          testSubmissions = subsData;
        }
      } catch (err) {
        errorMessage = err.message;
        supabaseStatus = 'Exception during query';
      }
    }

    res.json({
      isSupabaseConfigured,
      supabaseUrlSet: SUPABASE_URL ? 'YES' : 'NO',
      supabaseStatus,
      errorMessage,
      testLinks,
      testSubmissions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

