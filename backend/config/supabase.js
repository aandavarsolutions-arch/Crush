const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

let supabase = null;
let isSupabaseConfigured = false;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://your-project.supabase.co') {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    isSupabaseConfigured = true;
    console.log('✅ Supabase PostgreSQL client initialized.');
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

      if (error) throw error;
      return data;
    } else {
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
    }
  },

  async getLinkByCode(code) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('unique_code', code)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } else {
      return localDb.links.find(l => l.unique_code === code) || null;
    }
  },

  async incrementOpenCount(code) {
    if (isSupabaseConfigured) {
      // Fetch current link
      const link = await this.getLinkByCode(code);
      if (!link) return null;
      const { data, error } = await supabase
        .from('links')
        .update({ open_count: (link.open_count || 0) + 1 })
        .eq('id', link.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const link = localDb.links.find(l => l.unique_code === code);
      if (link) {
        link.open_count = (link.open_count || 0) + 1;
        saveLocalDb();
      }
      return link;
    }
  },

  async addSubmission({ linkId, visitorName, crushName }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            link_id: linkId,
            visitor_name: visitorName,
            crush_name: crushName,
            reaction: '😂'
          }
        ])
        .select()
        .single();
      if (error) throw error;

      // Increment completed count on links table
      const { data: linkData } = await supabase.from('links').select('completed_count').eq('id', linkId).single();
      if (linkData) {
        await supabase.from('links').update({ completed_count: (linkData.completed_count || 0) + 1 }).eq('id', linkId);
      }

      return data;
    } else {
      const newSubmission = {
        id: crypto.randomUUID(),
        link_id: linkId,
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
    }
  },

  async updateReaction(submissionId, reaction) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('submissions')
        .update({ reaction })
        .eq('id', submissionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const sub = localDb.submissions.find(s => s.id === submissionId);
      if (sub) {
        sub.reaction = reaction;
        saveLocalDb();
      }
      return sub;
    }
  },

  async getSubmissionsByLinkId(linkId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('link_id', linkId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return localDb.submissions
        .filter(s => s.link_id === linkId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }
};

module.exports = {
  db,
  isSupabaseConfigured
};
