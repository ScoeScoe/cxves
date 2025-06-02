# 📊 Google Sheets Email Subscription Setup Guide

## 🎯 **Overview**
This guide will help you connect your Cxves landing page email subscription directly to your Google Spreadsheet using Google Apps Script.

## 📋 **Prerequisites**
- Google account with access to Google Sheets and Google Apps Script
- Your existing Google Spreadsheet (from the provided link)

## 🚀 **Step-by-Step Setup**

### **Step 1: Access Your Google Spreadsheet**
1. Go to your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1vR7WeBi3YVXNLgS7O8PTyg1SX4xi_RTOL2mE9Ke_cNfxJ-N0FcHnSKPyBaxqdv08Jpde1Gm-PNYigGV/edit
2. Make sure you have edit access to this spreadsheet
3. Note: The script assumes the following column structure:
   - Column A: Email addresses
   - Column B: Timestamp
   - Column C: Source (will be set to "Cxves Landing Page")

### **Step 2: Create Google Apps Script**
1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Delete the default `myFunction()` code
4. Copy and paste the entire contents of `google-apps-script.gs` file
5. Save the project (Ctrl/Cmd + S) and give it a name like "Cxves Email Subscription"

### **Step 3: Configure Permissions**
1. Click **"Run"** (play button) to test the script
2. You'll see a popup asking for permissions - click **"Review permissions"**
3. Choose your Google account
4. Click **"Advanced"** then **"Go to [Your Project Name] (unsafe)"**
5. Click **"Allow"** to grant access to Google Sheets

### **Step 4: Deploy as Web App**
1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon next to **"Type"** and select **"Web app"**
3. Set the following configuration:
   - **Description**: "Cxves Email Subscription API"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click **"Deploy"**
5. **IMPORTANT**: Copy the **Web app URL** - you'll need this for the next step

### **Step 5: Update Your HTML File**
1. Open your `index.html` file
2. Find this line (around line 1095):
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your Web app URL from Step 4
4. Save the file

### **Step 6: Test the Integration**
1. Start your local server: `python3 -m http.server 8000`
2. Open your browser to `http://localhost:8000`
3. Scroll to the newsletter section
4. Enter a test email and click **"Subscribe"**
5. Check your Google Spreadsheet - you should see the email added to row 2

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **"Script function not found" Error**
- Make sure you copied the entire script code
- Verify the function names are correct (`doPost` and `doGet`)

#### **"Permission denied" Error**
- Re-run the script in Apps Script editor to grant permissions
- Make sure you chose "Anyone" for access in deployment settings

#### **CORS Errors**
- Ensure you deployed as a Web app (not an API executable)
- Double-check the deployment settings

#### **Email not appearing in spreadsheet**
- Verify the spreadsheet ID in the script matches your actual spreadsheet
- Check the browser console (F12) for any error messages
- Test the script directly in Apps Script editor

### **Testing the Script Directly**
You can test your script in the Apps Script editor:
```javascript
function testScript() {
  const testData = {
    postData: {
      contents: JSON.stringify({ email: 'test@example.com' })
    }
  };
  const result = doPost(testData);
  console.log(result.getContent());
}
```

## 📈 **Features Included**

✅ **Email Validation**: Checks for proper email format  
✅ **Duplicate Prevention**: Prevents the same email from being added twice  
✅ **Timestamp Logging**: Records when each subscription occurred  
✅ **Source Tracking**: Identifies submissions from "Cxves Landing Page"  
✅ **Error Handling**: Provides meaningful error messages  
✅ **User Feedback**: Shows success/error messages to users  
✅ **Loading States**: Displays spinner during submission  

## 🔒 **Security Notes**
- The script only accepts POST requests with email data
- Email validation prevents malicious input
- No sensitive data is stored or transmitted
- All data goes directly to your private Google Spreadsheet

## 📝 **Next Steps**
After setup, you can:
1. Customize the spreadsheet columns for additional data
2. Set up email notifications when new subscribers are added
3. Export subscriber data for email marketing tools
4. Add analytics tracking for subscription rates

---

**Need Help?** If you encounter any issues, check the browser console (F12) for error messages or test the script directly in the Apps Script editor. 