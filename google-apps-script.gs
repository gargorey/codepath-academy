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
 */
const SHEET_NAME = 'Enquiries';
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
    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ result: 'success', info: 'CodePath Academy form endpoint is running.' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
