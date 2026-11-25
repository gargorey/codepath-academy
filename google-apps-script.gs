/**
 * Khatwa Code (خطوة كود) – enquiry form → Google Sheet
 *
 * Setup (once):
 * 1. Create a Google Sheet, then Extensions → Apps Script.
 * 2. Replace everything in Code.gs with this file and click Save.
 * 3. Deploy → New deployment → type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, approve the permissions, and copy the Web app URL (ends in /exec).
 * 4. Paste that URL into SITE.googleSheetUrl in index.html.
 *
 * Updating this script later: Deploy → Manage deployments → ✏️ Edit →
 * Version: "New version" → Deploy. The URL stays the same.
 *
 * Admin dashboard (admin.html):
 *   Project Settings (⚙️) → Script Properties → Add script property
 *     Property: ADMIN_PASSWORD    Value: a long password only you know (12+ characters)
 *   Without it, the dashboard endpoints stay switched off and nothing can be read.
 */
const SHEET_NAME = 'Enquiries';

// Where new-enquiry emails go. Leave empty to use the Google account that owns this script.
// Several addresses: 'a@example.com,b@example.com'
const NOTIFY_EMAIL = '';
const HEADERS = ['Timestamp', 'Name', 'Phone / WhatsApp', 'Email', 'Course', 'Level', 'Message', 'Language', 'Page', 'Status', 'Notes', 'Payment plan'];
const STATUSES = ['New', 'Contacted', 'Enrolled', 'Waitlist', 'Not interested'];
const COL = { status: 10, notes: 11, plan: 12 };

const clean = v => String(v == null ? '' : v).slice(0, 2000).replace(/^[=+\-@]/, "'$&"); // stop formula injection

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  const width = sheet.getLastRow() === 0 ? 0 : sheet.getLastColumn();
  if (width < HEADERS.length) {   // new sheet, or an older sheet without the Status / Notes / Payment plan columns
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ result: 'error', error: 'Bad request' }); }
  if (d && d.action) return admin(d);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    sheet.appendRow([new Date(), clean(d.name), clean(d.phone), clean(d.email), clean(d.course),
                     clean(d.level), clean(d.message), clean(d.lang), clean(d.page), 'New', '', clean(d.plan)]);
    notify(d, sheet.getParent());
    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Admin dashboard API (password protected) ---------- */

function admin(d) {
  const auth = checkPassword(d.password);
  if (auth) return json({ result: 'error', error: auth });
  try {
    if (d.action === 'login') return json({ result: 'success' });
    if (d.action === 'list') return json({ result: 'success', statuses: STATUSES, rows: listRows() });
    if (d.action === 'update' || d.action === 'delete') {
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        const sheet = getSheet();
        const row = findRow(sheet, d.row, d.ts);
        if (!row) return json({ result: 'error', error: 'not_found' });
        if (d.action === 'delete') {
          sheet.deleteRow(row);
        } else {
          if (d.status != null) {
            if (STATUSES.indexOf(d.status) < 0) return json({ result: 'error', error: 'Unknown status' });
            sheet.getRange(row, COL.status).setValue(d.status);
          }
          if (d.notes != null) sheet.getRange(row, COL.notes).setValue(clean(d.notes));
        }
        return json({ result: 'success' });
      } finally {
        lock.releaseLock();
      }
    }
    return json({ result: 'error', error: 'Unknown action' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  }
}

// Returns '' when the password is right, otherwise the reason. Slows down and then blocks repeated wrong guesses.
function checkPassword(given) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD') || '';
  if (expected.length < 12) return 'not_configured';
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('adminFails') || 0);
  if (fails >= 20) return 'locked';
  const digest = v => Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(v || ''), Utilities.Charset.UTF_8));
  if (digest(given) === digest(expected)) return '';
  cache.put('adminFails', String(fails + 1), 900);   // 20 wrong tries locks the dashboard for 15 minutes
  Utilities.sleep(1500);
  return 'wrong_password';
}

function listRows() {
  const sheet = getSheet();
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const str = v => v instanceof Date ? v.toISOString() : String(v == null ? '' : v);
  return values.map((r, i) => ({
    row: i + 2,
    ts: r[0] instanceof Date ? r[0].getTime() : 0,
    name: str(r[1]), phone: str(r[2]), email: str(r[3]), course: str(r[4]), level: str(r[5]),
    message: str(r[6]), lang: str(r[7]), page: str(r[8]),
    status: str(r[9]) || 'New', notes: str(r[10]), plan: str(r[11])
  })).filter(x => x.ts || x.name || x.email || x.phone);
}

// Finds the row the dashboard means, even if rows moved (sorted or deleted in the sheet) since it loaded.
function findRow(sheet, row, ts) {
  const last = sheet.getLastRow();
  ts = Number(ts);
  if (!ts) return 0;
  const at = r => { const v = sheet.getRange(r, 1).getValue(); return v instanceof Date ? v.getTime() : 0; };
  row = Number(row);
  if (row >= 2 && row <= last && at(row) === ts) return row;
  if (last < 2) return 0;
  const col = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < col.length; i++) {
    if (col[i][0] instanceof Date && col[i][0].getTime() === ts) return i + 2;
  }
  return 0;
}

function notify(d, ss) {
  try {
    const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    if (!to) return;
    const rows = [
      ['الاسم / Name', d.name],
      ['الجوال / Phone', d.phone],
      ['البريد / Email', d.email],
      ['الدورة / Course', d.course],
      ['المستوى / Level', d.level],
      ['الدفع / Payment', d.plan || '—'],
      ['الرسالة / Message', d.message || '—'],
      ['اللغة / Language', d.lang]
    ];
    const esc = v => String(v || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const wa = 'https://wa.me/' + String(d.phone || '').replace(/[^0-9]/g, '');
    const html =
      '<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">' +
      '<h2 style="margin:0 0 12px">طلب جديد من موقع خطوة كود (Khatwa Code)</h2>' +
      '<table cellpadding="6" style="border-collapse:collapse">' +
      rows.map(r => '<tr><td style="color:#666;white-space:nowrap">' + r[0] + '</td><td><b>' + esc(r[1]) + '</b></td></tr>').join('') +
      '</table>' +
      '<p><a href="' + wa + '">Reply on WhatsApp</a> · <a href="' + ss.getUrl() + '">Open the sheet</a></p></div>';
    const plain = rows.map(r => r[0] + ': ' + (r[1] || '')).join('\n') + '\n\nWhatsApp: ' + wa + '\nSheet: ' + ss.getUrl();
    const options = { htmlBody: html, name: 'Khatwa Code' };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) options.replyTo = d.email;
    MailApp.sendEmail(to, 'طلب جديد: ' + (d.name || '') + ' – ' + (d.course || ''), plain, options);
  } catch (err) {
    console.error('Email notification failed: ' + err);   // the row is still saved
  }
}

// Run this once from the editor (select "testNotify" → Run) to approve email permission and receive a sample email.
function testNotify() {
  notify({ name: 'Test', phone: '+966500000000', email: '', course: 'Test course', level: 'Test', plan: 'بالتقسيط | Installments', message: 'Sample notification', lang: 'ar' },
         SpreadsheetApp.getActiveSpreadsheet());
}

function doGet() {
  return json({ result: 'success', info: 'Khatwa Code form endpoint is running.', dashboard: 3 });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
