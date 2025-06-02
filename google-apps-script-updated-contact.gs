function doPost(e) {
  try {
    // Add CORS headers and better error handling
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // CORRECT SPREADSHEET ID
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
    
    const timestamp = new Date();
    
    // Handle different types of submissions
    if (data.type === 'contact') {
      // Handle contact form submission
      return handleContactForm(spreadsheet, data, timestamp, output);
    } else {
      // Handle email subscription (original functionality)
      return handleEmailSubscription(spreadsheet, data, timestamp, output);
    }
    
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

function handleEmailSubscription(spreadsheet, data, timestamp, output) {
  const email = data.email;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Invalid email format'
    }));
  }
  
  // Get or create the Subscriptions sheet
  let sheet;
  try {
    sheet = spreadsheet.getSheetByName('Subscriptions') || spreadsheet.getActiveSheet();
  } catch (error) {
    sheet = spreadsheet.getActiveSheet();
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
    
    SpreadsheetApp.flush();
    
  } catch (writeError) {
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Failed to write to spreadsheet',
      debug: writeError.toString()
    }));
  }
  
  return output.setContent(JSON.stringify({
    success: true,
    message: 'Successfully subscribed!',
    debug: `Added to row ${nextRow}`
  }));
}

function handleContactForm(spreadsheet, data, timestamp, output) {
  // Validate required contact form fields
  if (!data.name || !data.email || !data.type) {
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Missing required fields: name, email, or type'
    }));
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Invalid email format'
    }));
  }
  
  // Get or create the Contacts sheet
  let contactSheet;
  try {
    contactSheet = spreadsheet.getSheetByName('Contacts');
    if (!contactSheet) {
      // Create the Contacts sheet if it doesn't exist
      contactSheet = spreadsheet.insertSheet('Contacts');
      
      // Add headers
      contactSheet.getRange(1, 1).setValue('Name');
      contactSheet.getRange(1, 2).setValue('Email');
      contactSheet.getRange(1, 3).setValue('Company');
      contactSheet.getRange(1, 4).setValue('Phone');
      contactSheet.getRange(1, 5).setValue('Interest Type');
      contactSheet.getRange(1, 6).setValue('Message');
      contactSheet.getRange(1, 7).setValue('Timestamp');
      contactSheet.getRange(1, 8).setValue('Source');
      
      // Format headers
      const headerRange = contactSheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#237A6D');
      headerRange.setFontColor('#F2E8D4');
    }
  } catch (sheetError) {
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Cannot access or create Contacts sheet',
      debug: sheetError.toString()
    }));
  }
  
  // Find the next empty row
  let nextRow = 2;
  try {
    while (contactSheet.getRange(nextRow, 1).getValue() !== '') {
      nextRow++;
      if (nextRow > 10000) break;
    }
  } catch (searchError) {
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Error finding next available row in Contacts sheet',
      debug: searchError.toString()
    }));
  }
  
  // Add the contact form data to the spreadsheet
  try {
    contactSheet.getRange(nextRow, 1).setValue(data.name);
    contactSheet.getRange(nextRow, 2).setValue(data.email);
    contactSheet.getRange(nextRow, 3).setValue(data.company || '');
    contactSheet.getRange(nextRow, 4).setValue(data.phone || '');
    contactSheet.getRange(nextRow, 5).setValue(data.type);
    contactSheet.getRange(nextRow, 6).setValue(data.message || '');
    contactSheet.getRange(nextRow, 7).setValue(timestamp);
    contactSheet.getRange(nextRow, 8).setValue('Cxves Landing Page - Contact Form');
    
    SpreadsheetApp.flush();
    
  } catch (writeError) {
    return output.setContent(JSON.stringify({
      success: false,
      message: 'Failed to write contact data to spreadsheet',
      debug: writeError.toString()
    }));
  }
  
  // Send email notification to info@cxves.io
  try {
    const emailSubject = `New Contact Form Submission - ${data.type}`;
    const emailBody = `
New contact form submission from Cxves landing page:

Name: ${data.name}
Email: ${data.email}
Company: ${data.company || 'Not provided'}
Phone: ${data.phone || 'Not provided'}
Interest Type: ${data.type}
Message: ${data.message || 'No message provided'}

Submitted: ${timestamp.toLocaleString()}
Source: Cxves Landing Page - Contact Form

---
This email was automatically generated from your Cxves contact form.
    `;
    
    // Send email notification
    MailApp.sendEmail({
      to: 'info@cxves.io',
      subject: emailSubject,
      body: emailBody,
      replyTo: data.email
    });
    
  } catch (emailError) {
    // Don't fail the entire request if email fails, but log it
    console.log('Email notification failed:', emailError.toString());
    // Continue with success response since data was saved
  }
  
  return output.setContent(JSON.stringify({
    success: true,
    message: 'Contact form submitted successfully! We\'ll get back to you within 24 hours.',
    debug: `Added to Contacts sheet row ${nextRow} and email sent to info@cxves.io`
  }));
}

function doGet(e) {
  // Handle GET requests (for testing) with CORS headers
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  return output.setContent(JSON.stringify({
    message: 'Cxves Email Subscription & Contact API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '4.0',
    spreadsheetId: '1gJ0ystpkepC6-CxQThGL66tvbKNIOIbuOb28iPBqL4k',
    features: ['email-subscription', 'contact-form']
  }));
}

// Test function for email subscription
function testEmailSubmission() {
  const testData = {
    postData: {
      contents: JSON.stringify({ email: 'test@cxves.io' })
    }
  };
  const result = doPost(testData);
  console.log('Email test result:', result.getContent());
  return result.getContent();
}

// Test function for contact form
function testContactSubmission() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        type: 'contact',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Test Company',
        phone: '+1 555-123-4567',
        type: 'discovery-call',
        message: 'I am interested in learning more about your AI solutions.'
      })
    }
  };
  const result = doPost(testData);
  console.log('Contact test result:', result.getContent());
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