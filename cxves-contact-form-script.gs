function doPost(e) {
  try {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // REPLACE WITH YOUR NEW CONTACT FORM SPREADSHEET ID
    const SPREADSHEET_ID = 'YOUR_CONTACT_SPREADSHEET_ID_HERE';
    
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
    
    // Validate required fields
    if (!data.name || !data.email || !data.type) {
      return output.setContent(JSON.stringify({
        success: false,
        message: 'Missing required fields: name, email, or interest type'
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
    
    const timestamp = new Date();
    
    // Get the active sheet (should be the first sheet)
    const sheet = spreadsheet.getActiveSheet();
    
    // Find the next empty row
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
    
    // Add the contact form data to the spreadsheet
    try {
      sheet.getRange(nextRow, 1).setValue(data.name);
      sheet.getRange(nextRow, 2).setValue(data.email);
      sheet.getRange(nextRow, 3).setValue(data.company || '');
      sheet.getRange(nextRow, 4).setValue(data.phone || '');
      sheet.getRange(nextRow, 5).setValue(data.type);
      sheet.getRange(nextRow, 6).setValue(data.message || '');
      sheet.getRange(nextRow, 7).setValue(timestamp);
      sheet.getRange(nextRow, 8).setValue('Cxves Landing Page - Contact Form');
      
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
You can reply directly to this email to respond to ${data.name}.
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
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      debug: `Contact saved to row ${nextRow} and email sent to info@cxves.io`
    }));
    
  } catch (error) {
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
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  return output.setContent(JSON.stringify({
    message: 'Cxves Contact Form API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0'
  }));
}

// Test function for contact form
function testContactSubmission() {
  const testData = {
    postData: {
      contents: JSON.stringify({
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
    const SPREADSHEET_ID = 'YOUR_CONTACT_SPREADSHEET_ID_HERE';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    console.log('Spreadsheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Sheet URL:', spreadsheet.getUrl());
    return 'SUCCESS: Can access contact form spreadsheet';
  } catch (error) {
    console.log('Spreadsheet access failed:', error.toString());
    return 'FAILED: ' + error.toString();
  }
} 