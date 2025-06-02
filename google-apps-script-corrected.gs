function doPost(e) {
  try {
    // Add CORS headers and better error handling
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // CORRECT SPREADSHEET ID from the actual edit URL
    const SPREADSHEET_ID = '1gJ0ystpkepC6-CxQThGL66tvbKNIOIbuOb28iPBqL4k';
    
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (error) {
      return output.setContent(JSON.stringify({
        success: false,
        message: 'Cannot access spreadsheet. Please check permissions.',
        debug: error.toString()
      }));
    }
    
    const sheet = spreadsheet.getActiveSheet();
    
    // Parse the request data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return output.setContent(JSON.stringify({
        success: false,
        message: 'Invalid request data format',
        debug: parseError.toString()
      }));
    }
    
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
    try {
      const existingEmails = sheet.getRange('A:A').getValues();
      for (let i = 1; i < existingEmails.length; i++) {
        if (existingEmails[i][0] === email) {
          return output.setContent(JSON.stringify({
            success: false,
            message: 'Email already subscribed'
          }));
        }
      }
    } catch (readError) {
      return output.setContent(JSON.stringify({
        success: false,
        message: 'Cannot read existing data from spreadsheet',
        debug: readError.toString()
      }));
    }
    
    // Find the next empty row (starting from A2)
    let nextRow = 2;
    try {
      while (sheet.getRange(nextRow, 1).getValue() !== '') {
        nextRow++;
        // Safety check to prevent infinite loop
        if (nextRow > 10000) break;
      }
    } catch (searchError) {
      return output.setContent(JSON.stringify({
        success: false,
        message: 'Error finding next available row',
        debug: searchError.toString()
      }));
    }
    
    // Add the email and timestamp to the spreadsheet
    try {
      sheet.getRange(nextRow, 1).setValue(email);
      sheet.getRange(nextRow, 2).setValue(timestamp);
      sheet.getRange(nextRow, 3).setValue('Cxves Landing Page');
      
      // Force save
      SpreadsheetApp.flush();
      
    } catch (writeError) {
      return output.setContent(JSON.stringify({
        success: false,
        message: 'Failed to write to spreadsheet',
        debug: writeError.toString()
      }));
    }
    
    // Return success response
    return output.setContent(JSON.stringify({
      success: true,
      message: 'Successfully subscribed!',
      debug: `Added to row ${nextRow}`
    }));
    
  } catch (error) {
    // Return error response with more details
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Unexpected error: ' + error.toString(),
      debug: error.stack || 'No stack trace available'
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
    timestamp: new Date().toISOString(),
    version: '3.0',
    spreadsheetId: '1gJ0ystpkepC6-CxQThGL66tvbKNIOIbuOb28iPBqL4k'
  }));
}

// Test function for debugging
function testEmailSubmission() {
  const testData = {
    postData: {
      contents: JSON.stringify({ email: 'test@cxves.io' })
    }
  };
  const result = doPost(testData);
  console.log(result.getContent());
  return result.getContent();
}

// Function to test spreadsheet access
function testSpreadsheetAccess() {
  try {
    const SPREADSHEET_ID = '1gJ0ystpkepC6-CxQThGL66tvbKNIOIbuOb28iPBqL4k';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    console.log('Spreadsheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Sheet URL:', spreadsheet.getUrl());
    return 'SUCCESS: Can access spreadsheet';
  } catch (error) {
    console.log('Spreadsheet access failed:', error.toString());
    return 'FAILED: ' + error.toString();
  }
} 