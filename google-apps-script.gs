/**
 * CodePath Academy – enquiry form → Google Sheet
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
 */
const SHEET_NAME = 'Enquiries';

// Where new-enquiry emails go. Leave empty to use the Google account that owns this script.
// Several addresses: 'a@example.com,b@example.com'
const NOTIFY_EMAIL = '';
const HEADERS = ['Timestamp', 'Name', 'Phone / WhatsApp', 'Email', 'Course', 'Level', 'Message', 'Language', 'Page'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    const clean = v => String(v || '').slice(0, 2000).replace(/^[=+\-@]/, "'$&"); // stop formula injection
    sheet.appendRow([new Date(), clean(d.name), clean(d.phone), clean(d.email), clean(d.course),
                     clean(d.level), clean(d.message), clean(d.lang), clean(d.page)]);
    notify(d, ss);
    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
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
      ['الرسالة / Message', d.message || '—'],
      ['اللغة / Language', d.lang]
    ];
    const esc = v => String(v || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const wa = 'https://wa.me/' + String(d.phone || '').replace(/[^0-9]/g, '');
    const html =
      '<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">' +
      '<h2 style="margin:0 0 12px">طلب جديد من موقع CodePath Academy</h2>' +
      '<table cellpadding="6" style="border-collapse:collapse">' +
      rows.map(r => '<tr><td style="color:#666;white-space:nowrap">' + r[0] + '</td><td><b>' + esc(r[1]) + '</b></td></tr>').join('') +
      '</table>' +
      '<p><a href="' + wa + '">Reply on WhatsApp</a> · <a href="' + ss.getUrl() + '">Open the sheet</a></p></div>';
    const plain = rows.map(r => r[0] + ': ' + (r[1] || '')).join('\n') + '\n\nWhatsApp: ' + wa + '\nSheet: ' + ss.getUrl();
    const options = { htmlBody: html, name: 'CodePath Academy' };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) options.replyTo = d.email;
    MailApp.sendEmail(to, 'طلب جديد: ' + (d.name || '') + ' – ' + (d.course || ''), plain, options);
  } catch (err) {
    console.error('Email notification failed: ' + err);   // the row is still saved
  }
}

// Run this once from the editor (select "testNotify" → Run) to approve email permission and receive a sample email.
function testNotify() {
  notify({ name: 'Test', phone: '+966500000000', email: '', course: 'Test course', level: 'Test', message: 'Sample notification', lang: 'ar' },
         SpreadsheetApp.getActiveSpreadsheet());
}

function doGet() {
  return json({ result: 'success', info: 'CodePath Academy form endpoint is running.' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
