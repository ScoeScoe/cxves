function doPost(e) {
  try {
    // Add CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
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
      return output.setContent(JSON.stringify({
        success: false,
        message: 'Invalid email format'
      }));
    }
    
    // Check if email already exists
    const existingEmails = sheet.getRange('A:A').getValues();
    for (let i = 1; i < existingEmails.length; i++) {
      if (existingEmails[i][0] === email) {
        return output.setContent(JSON.stringify({
          success: false,
          message: 'Email already subscribed'
        }));
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
    return output.setContent(JSON.stringify({
      success: true,
      message: 'Successfully subscribed!'
    }));
    
  } catch (error) {
    // Return error response with more details
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString(),
      details: error.stack
    }));
  }
}

function doGet(e) {
  // Handle GET requests (for testing) with CORS headers
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  return output.setContent(JSON.stringify({
    message: 'Cxves Email Subscription API is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  }));
}

// Test function for debugging
function testEmailSubmission() {
  const testData = {
    postData: {
      contents: JSON.stringify({ email: 'test@example.com' })
    }
  };
  const result = doPost(testData);
  console.log(result.getContent());
  return result.getContent();
} 