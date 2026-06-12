/**
 * Apex Union Landing Page — Google Sheets Lead Capture
 * ----------------------------------------------------
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Paste this entire file → Save
 * 3. Run setupApexUnionLeadsSheet once (authorize when prompted)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into .env.local → GOOGLE_SHEET_WEB_APP_URL
 * 6. Run: node scripts/generate-config.mjs
 */

var SHEET_NAME = "Apex Union Leads";
var DASHBOARD_NAME = "Dashboard";

var HEADERS = [
  "Client Submitted At",
  "Full Name",
  "Email",
  "Phone (WhatsApp)",
  "Track Interest",
  "Current Status",
];

var THEME = {
  maroon: "#4d0000",
  maroonDeep: "#320000",
  maroonSoft: "#6b1414",
  gold: "#c9a84c",
  goldLight: "#f2d78d",
  cream: "#f1e9c9",
  surfaceLight: "#f9f5ec",
  surfaceAlt: "#ebe2d0",
  white: "#ffffff",
};

/** Run once from the Apps Script editor to create columns + brand styling */
function setupApexUnionLeadsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename("Apex Union — Lead Database");

  var leadsSheet = getOrCreateSheet_(ss, SHEET_NAME);
  ensureHeaders_(leadsSheet);
  styleLeadsSheet_(leadsSheet);

  var dashboard = getOrCreateSheet_(ss, DASHBOARD_NAME);
  setupDashboard_(dashboard, leadsSheet);

  ss.setActiveSheet(leadsSheet);
  ss.moveActiveSheet(1);

  SpreadsheetApp.flush();
}

/** Webhook — called by the landing page forms */
function doPost(e) {
  try {
    var payload = parseLeadPayload_(e);
    var sheet = getLeadsSheet_();
    ensureHeaders_(sheet);

    var name = clean_(payload.name);
    var email = clean_(payload.email);
    var phone = normalizePhone_(payload.phone, payload.countryCode);
    var track = clean_(payload.track);
    var status = clean_(payload.status);

    if (!name || !email || !phone || !track || !status) {
      return jsonResponse_({
        ok: false,
        error: "Missing required fields: name, email, phone, track, status",
      });
    }

    if (!isValidEmail_(email)) {
      return jsonResponse_({ ok: false, error: "Invalid email address" });
    }

    if (!isValidPhone_(phone)) {
      return jsonResponse_({ ok: false, error: "Invalid phone number" });
    }

    // Phone is written separately — values starting with "+" break appendRow (formula parse error)
    var row = [
      parseClientDate_(payload.submittedAt),
      name,
      email,
      "",
      track,
      status,
    ];

    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();
    writePhoneCell_(sheet, lastRow, phone);
    styleDataRow_(sheet, lastRow);

    return jsonResponse_({ ok: true, row: lastRow });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/** Health check — open the deployed URL in a browser */
function doGet() {
  return jsonResponse_({
    ok: true,
    service: "Apex Union Lead Webhook",
    sheet: SHEET_NAME,
    columns: HEADERS,
  });
}

function parseLeadPayload_(e) {
  if (!e) return {};

  if (e.postData && e.postData.contents) {
    var contentType = (e.postData.type || "").toLowerCase();

    if (contentType.indexOf("application/json") !== -1) {
      try {
        return JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // fall through
      }
    }
  }

  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (fallbackError) {
      return {};
    }
  }

  return {};
}

function normalizePhone_(phoneValue, countryCodeValue) {
  var phone = clean_(phoneValue);
  var countryCode = clean_(countryCodeValue);

  if (!phone) return "";

  // Already formatted like "+91 9876543210"
  if (phone.indexOf("+") === 0) {
    return phone.replace(/\s+/g, " ").trim();
  }

  var digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  if (countryCode && countryCode.indexOf("+") === 0) {
    var codeDigits = countryCode.replace(/\D/g, "");
    if (digits.indexOf(codeDigits) === 0 && digits.length > codeDigits.length + 3) {
      digits = digits.substring(codeDigits.length);
    }
    return countryCode + " " + digits;
  }

  if (digits.length === 10) {
    return "+91 " + digits;
  }

  return "+" + digits;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone_(phone) {
  var digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/** Writes phone as plain text so "+91 ..." is not parsed as a formula */
function writePhoneCell_(sheet, row, phone) {
  var phoneCell = sheet.getRange(row, 4);
  phoneCell.setNumberFormat("@");
  phoneCell.setValue(String(phone));
}

function getLeadsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    setupApexUnionLeadsSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }
  return sheet;
}

function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function ensureHeaders_(sheet) {
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var isEmpty = firstRow.join("").trim() === "";
  var matches =
    firstRow[0] === HEADERS[0] &&
    firstRow[HEADERS.length - 1] === HEADERS[HEADERS.length - 1];

  if (isEmpty || !matches) {
    if (sheet.getLastRow() > 1) {
      sheet.insertRowBefore(1);
    }
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function styleLeadsSheet_(sheet) {
  var lastCol = HEADERS.length;

  sheet.setFrozenRows(1);

  var header = sheet.getRange(1, 1, 1, lastCol);
  header
    .setValues([HEADERS])
    .setBackground(THEME.maroon)
    .setFontColor(THEME.cream)
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);

  header.setBorder(
    null,
    null,
    true,
    null,
    null,
    null,
    THEME.gold,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );

  sheet
    .getRange(1, 1, Math.max(sheet.getLastRow(), 200), lastCol)
    .setFontFamily("Arial")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  sheet
    .getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
    .setNumberFormat("dd mmm yyyy, hh:mm");

  sheet
    .getRange(2, 4, Math.max(sheet.getLastRow() - 1, 1), 1)
    .setNumberFormat("@");

  applyAlternatingRows_(sheet, 2, Math.max(sheet.getLastRow(), 2), lastCol);

  ensureFilter_(sheet, lastCol);
}

function ensureFilter_(sheet, lastCol) {
  if (sheet.getFilter()) return;
  sheet.getRange(1, 1, 1, lastCol).createFilter();
}

function styleDataRow_(sheet, row) {
  var lastCol = HEADERS.length;
  var rowRange = sheet.getRange(row, 1, 1, lastCol);
  var isEven = row % 2 === 0;

  rowRange
    .setBackground(isEven ? THEME.surfaceLight : THEME.white)
    .setFontColor(THEME.maroonDeep)
    .setBorder(
      null,
      null,
      true,
      null,
      null,
      null,
      THEME.surfaceAlt,
      SpreadsheetApp.BorderStyle.SOLID
    );

  sheet.getRange(row, 1).setNumberFormat("dd mmm yyyy, hh:mm");
}

function applyAlternatingRows_(sheet, startRow, endRow, lastCol) {
  for (var row = startRow; row <= endRow; row++) {
    var isEven = row % 2 === 0;
    sheet
      .getRange(row, 1, 1, lastCol)
      .setBackground(isEven ? THEME.surfaceLight : THEME.white);
  }
}

function setupDashboard_(dashboard, leadsSheet) {
  dashboard.clear();

  dashboard.getRange("A1:B1").merge();
  dashboard
    .getRange("A1")
    .setValue("APEX UNION — LEAD DASHBOARD")
    .setBackground(THEME.maroon)
    .setFontColor(THEME.cream)
    .setFontWeight("bold")
    .setFontSize(14)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dashboard.setRowHeight(1, 42);

  var stats = [
    ["Total leads", "=COUNTA('" + leadsSheet.getName() + "'!B2:B)"],
    ["Sales track", "=COUNTIF('" + leadsSheet.getName() + "'!E2:E,\"Sales\")"],
    ["Marketing track", "=COUNTIF('" + leadsSheet.getName() + "'!E2:E,\"Marketing\")"],
    ["Not sure track", "=COUNTIF('" + leadsSheet.getName() + "'!E2:E,\"Not Sure\")"],
    ["Last submission", "=IFERROR(MAX('" + leadsSheet.getName() + "'!A2:A),\"—\")"],
  ];

  dashboard.getRange(3, 1, stats.length, 2).setValues(stats);
  dashboard
    .getRange(3, 1, stats.length, 1)
    .setFontWeight("bold")
    .setFontColor(THEME.maroon)
    .setBackground(THEME.surfaceAlt);

  dashboard
    .getRange(3, 2, stats.length, 1)
    .setFontColor(THEME.maroonDeep)
    .setBackground(THEME.surfaceLight)
    .setHorizontalAlignment("right");

  dashboard.getRange(stats.length + 2, 2).setNumberFormat("dd mmm yyyy, hh:mm");

  dashboard
    .getRange("A10")
    .setValue(
      "Theme: maroon #4d0000 · gold #c9a84c · cream #f1e9c9 (matches apexunion landing page)"
    )
    .setFontStyle("italic")
    .setFontColor(THEME.maroonSoft)
    .setFontSize(9);
}

function clean_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseClientDate_(value) {
  var text = clean_(value);
  if (!text) return new Date();
  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return parsed;
  return text;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
