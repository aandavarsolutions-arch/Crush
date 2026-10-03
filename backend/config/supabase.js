const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

let rawUrl = (process.env.SUPABASE_URL || '').trim();
// Auto-fix if user provided Dashboard URL instead of Project API URL
if (rawUrl.includes('supabase.com/dashboard/project/')) {
  const parts = rawUrl.split('supabase.com/dashboard/project/');
  const projectId = parts[1].split('/')[0].split('?')[0];
  rawUrl = `https://${projectId}.supabase.co`;
} else if (rawUrl && !rawUrl.startsWith('http')) {
  rawUrl = `https://${rawUrl}.supabase.co`;
}

const SUPABASE_URL = rawUrl;
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY).trim();

let supabase = null;
let isSupabaseConfigured = false;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://your-project.supabase.co' && !SUPABASE_URL.includes('your-project')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    isSupabaseConfigured = true;
    console.log(`✅ Supabase PostgreSQL client initialized at ${SUPABASE_URL}`);
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err.message);
  }
}

// Fallback Local Storage Manager (saves to local JSON file for out-of-the-box local usage)
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'local_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let localDb = {
  links: [],
  submissions: []
};

if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    localDb = JSON.parse(raw);
  } catch (e) {
    console.warn('⚠️ Error loading local database file, starting fresh.');
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local DB:', err.message);
  }
}

// Data Access Layer Abstraction
const db = {
  async createLink({ uniqueCode, creatorName, secretKey }) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('links')
          .insert([
            {
              unique_code: uniqueCode,
              creator_name: creatorName,
              secret_key: secretKey,
              open_count: 0,
              completed_count: 0
            }
          ])
          .select()
          .single();

        if (error) {
          console.error('⚠️ Supabase error in createLink:', error.message || error);
          throw error;
        }
        return data;
      } catch (err) {
        console.warn('⚠️ Falling back to local storage due to Supabase error:', err.message);
      }
    }
    
    // Fallback or Local DB
    const newLink = {
      id: crypto.randomUUID(),
      unique_code: uniqueCode,
      creator_name: creatorName,
      secret_key: secretKey,
      open_count: 0,
      completed_count: 0,
      created_at: new Date().toISOString()
    };
    localDb.links.push(newLink);
    saveLocalDb();
    return newLink;
  },

  async getLinkByCode(code) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('links')
          .select('*')
          .eq('unique_code', code)
          .single();
        if (error && error.code !== 'PGRST116') {
          console.warn('⚠️ Supabase error in getLinkByCode:', error.message);
        } else if (data) {
          return data;
        }
      } catch (err) {
        console.warn('⚠️ Supabase fetch exception:', err.message);
      }
    }
    return localDb.links.find(l => l.unique_code === code) || null;
  },

  async incrementOpenCount(code) {
    if (isSupabaseConfigured) {
      try {
        const link = await this.getLinkByCode(code);
        if (link && link.id) {
          const { data, error } = await supabase
            .from('links')
            .update({ open_count: (link.open_count || 0) + 1 })
            .eq('id', link.id)
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (err) {
        console.warn('⚠️ incrementOpenCount fallback:', err.message);
      }
    }
    const link = localDb.links.find(l => l.unique_code === code);
    if (link) {
      link.open_count = (link.open_count || 0) + 1;
      saveLocalDb();
    }
    return link;
  },

  async addSubmission({ linkId, creatorName, visitorName, crushName }) {
    if (isSupabaseConfigured) {
      try {
        const payload = {
          link_id: linkId,
          creator_name: String(creatorName || ''),
          visitor_name: visitorName,
          crush_name: crushName,
          reaction: '😂'
        };

        const { data, error } = await supabase
          .from('submissions')
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.error('⚠️ Supabase addSubmission error:', error.message || error);
          const { data: retryData, error: retryErr } = await supabase
            .from('submissions')
            .insert([{ link_id: linkId, visitor_name: visitorName, crush_name: crushName, reaction: '😂' }])
            .select()
            .single();
          if (!retryErr && retryData) return retryData;
        } else if (data) {
          try {
            const { data: linkData } = await supabase.from('links').select('completed_count').eq('id', linkId).single();
            if (linkData) {
              await supabase.from('links').update({ completed_count: (linkData.completed_count || 0) + 1 }).eq('id', linkId);
            }
          } catch (e) {}
          return data;
        }
      } catch (err) {
        console.warn('⚠️ addSubmission exception:', err.message);
      }
    }
    
    const newSubmission = {
      id: crypto.randomUUID(),
      link_id: linkId,
      creator_name: creatorName || '',
      visitor_name: visitorName,
      crush_name: crushName,
      reaction: '😂',
      created_at: new Date().toISOString()
    };
    localDb.submissions.push(newSubmission);

    const link = localDb.links.find(l => l.id === linkId);
    if (link) {
      link.completed_count = (link.completed_count || 0) + 1;
    }
    saveLocalDb();
    return newSubmission;
  },

  async updateReaction(submissionId, reaction) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .update({ reaction })
          .eq('id', submissionId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('⚠️ updateReaction fallback:', err.message);
      }
    }
    const sub = localDb.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.reaction = reaction;
      saveLocalDb();
    }
    return sub;
  },

  async getSubmissionsByLinkId(linkId) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('link_id', linkId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('⚠️ getSubmissionsByLinkId fallback:', err.message);
      }
    }
    return localDb.submissions
      .filter(s => s.link_id === linkId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

module.exports = {
  db,
  isSupabaseConfigured
};
