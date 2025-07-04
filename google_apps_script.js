function doGet(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Sheet1');

  const name = e.parameter.name;
  const phone = e.parameter.phone;
  const overallLevel = e.parameter.overallLevel;
  const grammar = e.parameter.grammar;
  const vocabulary = e.parameter.vocabulary;
  const reading = e.parameter.reading;
  const language = e.parameter.language;
  const timestamp = e.parameter.timestamp || new Date().toISOString();

  sheet.appendRow([timestamp, name, phone, overallLevel, grammar, vocabulary, reading, language]);

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}
