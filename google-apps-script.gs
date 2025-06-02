function doPost(e) {
  try {
    // Get the spreadsheet by ID (extract from your URL)
    const SPREADSHEET_ID = '1vR7WeBi3YVXNLgS7O8PTyg1SX4xi_RTOL2mE9Ke_cNfxJ-N0FcHnSKPyBaxqdv08Jpde1Gm-PNYigGV';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const timestamp = new Date();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid email format'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if email already exists
    const existingEmails = sheet.getRange('A:A').getValues();
    for (let i = 1; i < existingEmails.length; i++) {
      if (existingEmails[i][0] === email) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Email already subscribed'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Find the next empty row (starting from A2)
    let nextRow = 2;
    while (sheet.getRange(nextRow, 1).getValue() !== '') {
      nextRow++;
    }
    
    // Add the email and timestamp to the spreadsheet
    sheet.getRange(nextRow, 1).setValue(email);
    sheet.getRange(nextRow, 2).setValue(timestamp);
    sheet.getRange(nextRow, 3).setValue('Cxves Landing Page');
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Successfully subscribed!'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService.createTextOutput(JSON.stringify({
    message: 'Cxves Email Subscription API is running'
  })).setMimeType(ContentService.MimeType.JSON);
} 