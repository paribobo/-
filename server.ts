import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("probation.db");

// Google Sheets Setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY 
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/^b['"]|['"]$/g, "").replace(/\\n/g, "\n")
      : undefined,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const WEB_APP_URL = process.env.GOOGLE_WEB_APP_URL;
const SHEET_NAME = "ทดลองงาน";

async function syncToWebApp(record: any) {
  if (!WEB_APP_URL) return;
  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  } catch (error) {
    console.error("Error syncing to Google Web App:", error);
  }
}

async function syncToSheet(record: any) {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.log("Google Sheets integration not configured. Skipping sync.");
    return;
  }

  try {
    const values = [[
      record.id,
      record.title,
      record.first_name,
      record.last_name,
      record.position,
      record.department,
      record.appointment_date,
      record.round1_status,
      record.round1_start_date,
      record.round1_end_date,
      record.round2_status,
      record.round2_start_date,
      record.round2_end_date,
      record.chairman,
      record.committee1,
      record.committee2,
      record.committee3,
      record.committee4,
      record.secretary,
      record.round1_score,
      record.round2_score,
      record.status,
      record.created_at
    ]];

    // Check if record exists in sheet to decide between append or update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] == record.id);

    console.log(`Syncing record ${record.id} to sheet. Found at row index: ${rowIndex}`);

    if (rowIndex !== -1) {
      // Update existing row (rowIndex + 1 because Sheets is 1-indexed)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    }
  } catch (error: any) {
    console.error("Error syncing to Google Sheets:", error.message || error);
  }
}

async function ensureSheetExists() {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) return;
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetExists = spreadsheet.data.sheets?.some(s => s.properties?.title === SHEET_NAME);
    
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: SHEET_NAME }
            }
          }]
        }
      });
    }
  } catch (error) {
    console.error("Error ensuring sheet exists:", error);
  }
}

async function ensureSheetHeaders() {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) return;

  try {
    await ensureSheetExists();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Z1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        "ID", "คำนำหน้า", "ชื่อ", "นามสกุล", "ตำแหน่ง", "สังกัดงาน", "วันที่บรรจุ", 
        "รอบที่ 1 สถานะ", "รอบที่ 1 เริ่ม", "รอบที่ 1 ถึง",
        "รอบที่ 2 สถานะ", "รอบที่ 2 เริ่ม", "รอบที่ 2 ถึง",
        "ประธาน", "กรรมการ 1", "กรรมการ 2", "กรรมการ 3", "กรรมการ 4", "เลขานุการ",
        "คะแนนรอบ 1", "คะแนนรอบ 2", "สถานะรวม", "วันที่สร้าง"
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [headers] },
      });
    }
  } catch (error) {
    console.error("Error ensuring sheet headers:", error);
  }
}

function resetProbationIds() {
  const records = db.prepare("SELECT * FROM probation_records_v2 ORDER BY id ASC").all();
  
  const deleteStmt = db.prepare("DELETE FROM probation_records_v2");
  const resetSeqStmt = db.prepare("DELETE FROM sqlite_sequence WHERE name = 'probation_records_v2'");
  const insertStmt = db.prepare(`
    INSERT INTO probation_records_v2 (
      title, first_name, last_name, appointment_date, position, department, status, role,
      round1_status, round1_start_date, round1_end_date,
      round2_status, round2_start_date, round2_end_date,
      chairman, committee1, committee2, committee3, committee4, secretary,
      round1_score, round2_score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    deleteStmt.run();
    resetSeqStmt.run();
    for (const r of records as any[]) {
      insertStmt.run(
        r.title, r.first_name, r.last_name, r.appointment_date, r.position, r.department, r.status, r.role,
        r.round1_status, r.round1_start_date, r.round1_end_date,
        r.round2_status, r.round2_start_date, r.round2_end_date,
        r.chairman, r.committee1, r.committee2, r.committee3, r.committee4, r.secretary,
        r.round1_score, r.round2_score, r.created_at
      );
    }
  });

  transaction();
}

async function syncFromSheet() {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.warn("Google Sheets Sync From Sheet: Missing SPREADSHEET_ID or GOOGLE_SERVICE_ACCOUNT_EMAIL");
    return 0;
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:W`, // Fetch up to column W (created_at)
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return 0;

    const insertOrUpdate = db.prepare(`
      INSERT INTO probation_records_v2 (
        id, title, first_name, last_name, position, appointment_date,
        round1_status, round1_start_date, round1_end_date, round1_score,
        round2_status, round2_start_date, round2_end_date, round2_score,
        chairman, committee1, committee2, committee3, committee4, secretary,
        department, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, 
        first_name=excluded.first_name, 
        last_name=excluded.last_name,
        position=excluded.position, 
        appointment_date=excluded.appointment_date,
        round1_status=excluded.round1_status, 
        round1_start_date=excluded.round1_start_date,
        round1_end_date=excluded.round1_end_date, 
        round1_score=excluded.round1_score,
        round2_status=excluded.round2_status, 
        round2_start_date=excluded.round2_start_date,
        round2_end_date=excluded.round2_end_date, 
        round2_score=excluded.round2_score,
        chairman=excluded.chairman, 
        committee1=excluded.committee1, 
        committee2=excluded.committee2,
        committee3=excluded.committee3, 
        committee4=excluded.committee4, 
        secretary=excluded.secretary,
        department=excluded.department, 
        status=excluded.status, 
        created_at=excluded.created_at
    `);

    const transaction = db.transaction((dataRows) => {
      for (const row of dataRows) {
        if (!row[0]) continue;
        // Ensure we have enough columns or default them
        const values = Array(23).fill(null);
        row.forEach((val, i) => values[i] = val);
        
        insertOrUpdate.run(
          values[0], // id
          values[1], // title
          values[2], // first_name
          values[3], // last_name
          values[4], // position
          values[6], // appointment_date
          values[7], // round1_status
          values[8], // round1_start_date
          values[9], // round1_end_date
          values[19], // round1_score
          values[10], // round2_status
          values[11], // round2_start_date
          values[12], // round2_end_date
          values[20], // round2_score
          values[13], // chairman
          values[14], // committee1
          values[15], // committee2
          values[16], // committee3
          values[17], // committee4
          values[18], // secretary
          values[5], // department
          values[21], // status
          values[22] || new Date().toISOString() // created_at
        );
      }
    });

    transaction(rows);
    return rows.length;
  } catch (error) {
    console.error("Error syncing from Google Sheets:", error);
    throw error;
  }
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'Admin'
  );

  CREATE TABLE IF NOT EXISTS probation_records_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    first_name TEXT,
    last_name TEXT,
    appointment_date TEXT,
    position TEXT,
    round1_status TEXT,
    round1_start_date TEXT,
    round1_end_date TEXT,
    round2_status TEXT,
    round2_start_date TEXT,
    round2_end_date TEXT,
    chairman TEXT,
    committee1 TEXT,
    committee2 TEXT,
    committee3 TEXT,
    committee4 TEXT,
    secretary TEXT,
    round1_score TEXT,
    round2_score TEXT,
    department TEXT,
    status TEXT,
    role TEXT DEFAULT 'User',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert default admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin1234", "Admin");
}

// Migration to add columns if they don't exist
try {
  db.prepare("ALTER TABLE probation_records_v2 ADD COLUMN round1_score TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE probation_records_v2 ADD COLUMN round2_score TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE probation_records_v2 ADD COLUMN department TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE probation_records_v2 ADD COLUMN status TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE probation_records_v2 ADD COLUMN role TEXT DEFAULT 'User'").run();
} catch (e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as { id: number, username: string, role: string } | undefined;
      if (user) {
        // In a real app, you'd use JWT or sessions. 
        // For this demo, we'll return the user info.
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          } 
        });
      } else {
        res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
    } catch (error) {
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
  });

  // API Routes
  app.get("/api/records", (req, res) => {
    try {
      const records = db.prepare("SELECT * FROM probation_records_v2 ORDER BY id DESC").all();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch records" });
    }
  });

  app.post("/api/records", async (req, res) => {
    const {
      title, first_name, last_name, appointment_date, position, department, status, role,
      round1_status, round1_start_date, round1_end_date,
      round2_status, round2_start_date, round2_end_date,
      chairman, committee1, committee2, committee3, committee4, secretary,
      round1_score, round2_score
    } = req.body;

    try {
      const info = db.prepare(`
        INSERT INTO probation_records_v2 (
          title, first_name, last_name, appointment_date, position, department, status, role,
          round1_status, round1_start_date, round1_end_date,
          round2_status, round2_start_date, round2_end_date,
          chairman, committee1, committee2, committee3, committee4, secretary,
          round1_score, round2_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title, first_name, last_name, appointment_date, position, department, status, role || 'User',
        round1_status, round1_start_date, round1_end_date,
        round2_status, round2_start_date, round2_end_date,
        chairman, committee1, committee2, committee3, committee4, secretary,
        round1_score, round2_score
      );
      
      const newRecord = {
        id: info.lastInsertRowid,
        title, first_name, last_name, appointment_date, position, department, status, role,
        round1_status, round1_start_date, round1_end_date,
        round2_status, round2_start_date, round2_end_date,
        chairman, committee1, committee2, committee3, committee4, secretary,
        round1_score, round2_score
      };
      
      // Sync to Google Sheets in background
      syncToSheet(newRecord);
      syncToWebApp(newRecord);
      
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create record" });
    }
  });

  app.put("/api/records/:id", async (req, res) => {
    const { id } = req.params;
    const {
      title, first_name, last_name, appointment_date, position, department, status, role,
      round1_status, round1_start_date, round1_end_date,
      round2_status, round2_start_date, round2_end_date,
      chairman, committee1, committee2, committee3, committee4, secretary,
      round1_score, round2_score
    } = req.body;

    try {
      db.prepare(`
        UPDATE probation_records_v2 SET
          title = ?, first_name = ?, last_name = ?, appointment_date = ?, position = ?, department = ?, status = ?, role = ?,
          round1_status = ?, round1_start_date = ?, round1_end_date = ?,
          round2_status = ?, round2_start_date = ?, round2_end_date = ?,
          chairman = ?, committee1 = ?, committee2 = ?, committee3 = ?, committee4 = ?, secretary = ?,
          round1_score = ?, round2_score = ?
        WHERE id = ?
      `).run(
        title, first_name, last_name, appointment_date, position, department, status, role || 'User',
        round1_status, round1_start_date, round1_end_date,
        round2_status, round2_start_date, round2_end_date,
        chairman, committee1, committee2, committee3, committee4, secretary,
        round1_score, round2_score,
        id
      );
      
      // Sync to Google Sheets in background
      syncToSheet({
        id, title, first_name, last_name, appointment_date, position, department, status, role,
        round1_status, round1_start_date, round1_end_date,
        round2_status, round2_start_date, round2_end_date,
        chairman, committee1, committee2, committee3, committee4, secretary,
        round1_score, round2_score
      });
      syncToWebApp({
        id, title, first_name, last_name, appointment_date, position, department, status, role,
        round1_status, round1_start_date, round1_end_date,
        round2_status, round2_start_date, round2_end_date,
        chairman, committee1, committee2, committee3, committee4, secretary,
        round1_score, round2_score
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update record" });
    }
  });

  app.delete("/api/records/:id", async (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM probation_records_v2 WHERE id = ?").run(id);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete record" });
    }
  });

  app.post("/api/sync-all", async (req, res) => {
    try {
      // 1. Reset IDs in database to be sequential 1, 2, 3...
      resetProbationIds();
      
      // 2. Update headers and clear existing data
      const headers = [
        "ID", "คำนำหน้า", "ชื่อ", "นามสกุล", "ตำแหน่ง", "สังกัดงาน", "วันที่บรรจุ", 
        "รอบที่ 1 สถานะ", "รอบที่ 1 เริ่ม", "รอบที่ 1 ถึง",
        "รอบที่ 2 สถานะ", "รอบที่ 2 เริ่ม", "รอบที่ 2 ถึง",
        "ประธาน", "กรรมการ 1", "กรรมการ 2", "กรรมการ 3", "กรรมการ 4", "เลขานุการ",
        "คะแนนรอบ 1", "คะแนนรอบ 2", "สถานะรวม", "วันที่สร้าง"
      ];
      
      if (SPREADSHEET_ID) {
        // Update headers (Row 1)
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [headers] },
        });

        // Clear data (Row 2 onwards)
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A2:Z`,
        });
      }

      // 3. Fetch newly ordered records
      const records = db.prepare("SELECT * FROM probation_records_v2 ORDER BY id ASC").all();
      
      if (records.length > 0 && SPREADSHEET_ID) {
        const values = records.map((record: any) => [
          record.id,
          record.title,
          record.first_name,
          record.last_name,
          record.position,
          record.department,
          record.appointment_date,
          record.round1_status,
          record.round1_start_date,
          record.round1_end_date,
          record.round2_status,
          record.round2_start_date,
          record.round2_end_date,
          record.chairman,
          record.committee1,
          record.committee2,
          record.committee3,
          record.committee4,
          record.secretary,
          record.round1_score,
          record.round2_score,
          record.status,
          record.created_at
        ]);

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A2`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values },
        });
      }
      
      // Also sync to Web App if needed
      for (const record of records) {
        await syncToWebApp(record);
      }
      
      res.json({ success: true, count: records.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to sync all records" });
    }
  });

  app.post("/api/clear-all", async (req, res) => {
    try {
      db.prepare("DELETE FROM probation_records_v2").run();
      db.prepare("DELETE FROM sqlite_sequence WHERE name = 'probation_records_v2'").run();
      
      if (SPREADSHEET_ID) {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A2:Z`,
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to clear all records" });
    }
  });

  app.post("/api/sync-from-sheet", async (req, res) => {
    try {
      const count = await syncFromSheet();
      res.json({ success: true, count });
    } catch (error: any) {
      console.error("Sync from sheet error:", error);
      let errorMessage = "Failed to sync from sheet";
      let details = error.message || String(error);

      if (details.includes("API has not been used") || details.includes("disabled")) {
        errorMessage = "Google Sheets API ยังไม่ได้เปิดใช้งาน";
        details = "กรุณาเปิดใช้งาน API ที่นี่: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=303718493729";
      }

      res.status(500).json({ 
        error: errorMessage, 
        details: details 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    ensureSheetHeaders();
  });
}

startServer();
