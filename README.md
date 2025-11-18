# AIVA - Frontier AI Virtual Assistant

<div align="center">
  <h3>🤖 AI-Powered Customer Service Assistant</h3>
  <p>Reducing average handle time and improving customer satisfaction through intelligent data retrieval and historical analysis</p>
</div>

---

## 📋 Overview

AIVA (AI Virtual Assistant) is an innovative customer service tool designed for Frontier Communications agents. Similar to Microsoft's Clippy but modernized for today's customer service needs.  It provides quick access to relevant customer information and f(one) articles to help resolve concerns. 
When integrated with Avaya, it can identify the customer’s current reason for calling and deliver targeted solutions instantly. The goal is to **reduce average handle time (AHT), improve Net Promoter Score (NPS), and lower overall operational costs**.


### Key Features

- 🎯 **Instant Customer Insights**: Quick retrieval of customer information and previous interaction history
- 📊 **Historical Data Analysis**: Access to previous call details and resolutions
- 📚 **Smart Article Recommendations**: Automatic linking to relevant knowledge base articles
- 🎨 **Interactive UI**: Three distinct AIVA states (Idle, Response, Question) with visual feedback
- 🔒 **Privacy First**: Automatic data clearing between customer interactions
- ⏱️ **Session Management**: Daily greetings and 10-minute idle timeout
- 📱 **Responsive Design**: Works seamlessly on desktop and tablet devices

---

## 🏗️ Architecture

### Backend (Python Flask)
- RESTful API for customer data retrieval
- Databricks SQL connector for data warehouse access
- SharePoint integration for knowledge base articles
- Secure credential management via environment variables

### Frontend (HTML/CSS/JavaScript)
- Modern, responsive UI with smooth animations
- Three AIVA states with distinct visual representations
- Pop-up modal for displaying customer information
- Session management and idle timeout handling

### Data Source
- **Databricks Table**: `hackathon.hackathon_hack_it.fictitious_customer_data_3`
- **SharePoint Repository**: `https://frontiercorp1.sharepoint.com/sites/FoneRepository`

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Access to Frontier Databricks instance
- SharePoint authentication credentials
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workspace
   ```

2. **Create and configure environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - Databricks hostname, HTTP path, and access token
   - SharePoint site URL, client ID, client secret, and tenant ID

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Databricks sample data (optional for demo)**
   
   Run the SQL script in `backend/sample_data.sql` in your Databricks workspace to create demo data.

5. **Start the application**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

   Or manually:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python app.py

   # Terminal 2 - Frontend
   cd frontend
   python -m http.server 8080
   ```

6. **Access AIVA**
   
   Open your browser and navigate to: `http://localhost:8080`

---

## 💡 How to Use AIVA

### First Time Daily Use

When you open AIVA for the first time each day, you'll be greeted with:

> "Hello! My name is AIVA! I'm your Frontier AI Virtual Assistant. Which account can I help you with today?"

### Searching for Customer Information

1. **Enter the 10-digit phone number/BTN/account number** in the search field
2. **Click "Search"** or press Enter
3. **AIVA will animate** to indicate new information is available
4. **Click on AIVA** to view the customer details popup

### Understanding AIVA States

#### 🟣 AIVA_Idle (Purple)
- Default state when no search is active
- Appears after 10 minutes of inactivity
- Gently floats to indicate availability

#### 🟢 AIVA_Response (Green)
- Displayed when customer information is found
- Shows a happy expression
- Bounces to grab attention

#### 🟠 AIVA_Question (Orange)
- Shows when no customer data is found
- Displays a question mark
- Indicates need for clarification

### Information Displayed

When customer data is found, AIVA displays:

- **BTN/Phone Number**: Customer's account identifier
- **Customer Name**: Full name from account
- **Balance Due**: Current account balance
- **Date of Previous Call**: Most recent contact date
- **Previous Call Details**: 2-3 sentence synopsis (max 50 words)
- **Call Resolution**: Status and relevant knowledge base articles

### Example Output

#### Resolved Case
```
BTN/Phone Number: 2436476063
Customer Name: Veronica Phillips
Balance Due: $212.07
Date of Previous Call: 2025-08-06

Previous Call Details: Veronica called in to request assistance with 
updating payment information after a failed auto-payment attempt. The 
payment information was updated and a payment was processed.

Call Resolution:
📄 PaymentInquirySettingupAutoPay_aspx
```

#### Unresolved Case
```
BTN/Phone Number: 5528390088
Customer Name: Megan Bush
Balance Due: $260.66
Date of Previous Call: 2025-08-21

Previous Call Details: Megan called to dispute a late fee, claiming the 
payment was made on time and provided transaction details. The agent 
advised that the payment didn't post until after the due date and the 
agent did not provide a credit for the late fee when the customer was eligible.

Call Resolution:
📄 QuestioningCharge-DisputeLateFee_aspx
```

#### No Previous Contact
```
BTN/Phone Number: 5310261793
Customer Name: Eric Robinson
Balance Due: $191.87
Date of Previous Call: No Previous Call Found

Previous Call Details: No Previous Call Records Found
Call Resolution: Not Applicable
Resolution Source: Not Applicable
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABRICKS_SERVER_HOSTNAME` | Databricks instance URL | `your-instance.cloud.databricks.com` |
| `DATABRICKS_HTTP_PATH` | SQL warehouse path | `/sql/1.0/warehouses/abc123` |
| `DATABRICKS_ACCESS_TOKEN` | Personal access token | `dapi...` |
| `SHAREPOINT_SITE_URL` | SharePoint site URL | `https://frontiercorp1.sharepoint.com/sites/FoneRepository` |
| `SHAREPOINT_CLIENT_ID` | Azure AD client ID | `your-client-id` |
| `SHAREPOINT_CLIENT_SECRET` | Azure AD client secret | `your-client-secret` |
| `SHAREPOINT_TENANT_ID` | Azure AD tenant ID | `your-tenant-id` |

### SharePoint Authentication

To set up SharePoint authentication:

1. Register an app in Azure AD
2. Grant permissions to SharePoint sites
3. Generate client secret
4. Add credentials to `.env` file

---

## 📊 API Endpoints

### GET `/api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T10:30:00"
}
```

### GET `/api/greeting`
Get AIVA's daily greeting message

**Response:**
```json
{
  "message": "Hello! My name is AIVA! I'm your Frontier AI Virtual Assistant. Which account can I help you with today?"
}
```

### GET `/api/customer/:btn`
Retrieve customer information by BTN

**Parameters:**
- `btn` (required): 10-digit phone number/BTN

**Response (Found):**
```json
{
  "found": true,
  "btn": "2436476063",
  "customer_name": "Veronica Phillips",
  "balance_due": "212.07",
  "date_of_previous_call": "2025-08-06",
  "previous_call_details": "...",
  "resolution_articles": [
    {
      "title": "PaymentInquirySettingupAutoPay_aspx",
      "url": "https://..."
    }
  ]
}
```

**Response (Not Found):**
```json
{
  "found": false,
  "message": "I'm sorry I cannot find a recent call from the customer. Is there anything else I can help you find?"
}
```

---

## 🎨 Customization

### Updating AIVA Images

AIVA uses three SVG images for different states. To customize:

1. Create your custom images (120x120px recommended)
2. Update the `AIVA_IMAGES` object in `frontend/app.js`
3. Use either base64-encoded data URLs or file paths

### Adjusting Idle Timeout

Change the timeout duration in `frontend/app.js`:

```javascript
const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes (in milliseconds)
```

### Styling Modifications

All styles are in `frontend/styles.css`. Key sections:

- `.aiva-icon` - AIVA appearance and animations
- `.aiva-popup` - Popup window styling
- `.customer-info` - Data display formatting

---

## 🔒 Security Considerations

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all sensitive credentials
3. **Implement rate limiting** in production
4. **Add authentication** for API endpoints in production
5. **Use HTTPS** in production deployments
6. **Sanitize user inputs** to prevent SQL injection
7. **Implement proper CORS** policies

---

## 📈 Benefits & Impact

### For Customer Service Agents
- ⚡ **Faster Call Resolution**: Immediate access to customer history
- 🎯 **Better Context**: Understanding customer issues before engaging
- 📚 **Quick Reference**: Instant access to relevant knowledge articles
- 💡 **Proactive Service**: Anticipate customer needs based on history

### For Customers
- ⏱️ **Reduced Wait Times**: Agents prepared with information
- 🎭 **Better Experience**: Fewer repeated questions
- ✅ **Quicker Resolutions**: Agents have resolution history
- 📊 **Improved NPS**: Higher satisfaction scores

### Business Metrics
- 📉 **Lower AHT**: Average Handle Time reduction
- 📈 **Higher NPS**: Net Promoter Score improvement
- 💰 **Cost Savings**: More efficient call handling
- 🎓 **Agent Training**: Built-in knowledge base access

---

## 🐛 Troubleshooting

### Backend Connection Issues

**Problem**: Cannot connect to Databricks

**Solution**:
- Verify `DATABRICKS_ACCESS_TOKEN` is valid
- Check network connectivity to Databricks
- Ensure HTTP path is correct
- Confirm table exists and permissions are granted

### Frontend Not Loading

**Problem**: Blank page or errors in console

**Solution**:
- Check that backend is running on port 5000
- Verify `API_BASE_URL` in `app.js` matches backend
- Clear browser cache and reload
- Check browser console for specific errors

### SharePoint Authentication Failing

**Problem**: Unable to retrieve articles

**Solution**:
- Verify Azure AD app registration
- Check client ID and secret are correct
- Ensure SharePoint permissions are granted
- Use fallback articles feature

### AIVA Not Animating

**Problem**: AIVA doesn't respond to searches

**Solution**:
- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Clear localStorage: `localStorage.clear()`
- Try different browser

---

## 🚀 Deployment

### Production Deployment Checklist

- [ ] Set `FLASK_ENV=production` in `.env`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Implement API authentication
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up database connection pooling
- [ ] Implement caching for frequent queries
- [ ] Add backup and disaster recovery

### Recommended Hosting Options

- **Backend**: AWS EC2, Azure App Service, Google Cloud Run, Heroku
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront, Azure Static Web Apps
- **Database**: Databricks (already configured)
- **File Storage**: SharePoint (already configured)

---

## 🤝 Contributing

This project was created for the Frontier Communications Hackathon. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Ensure all tests pass

---

## 📝 License

This project is proprietary to Frontier Communications and is intended for internal use only.

---

## 👥 Support

For questions, issues, or feature requests:

- **Technical Issues**: Contact IT Support
- **Feature Requests**: Submit via internal ticketing system
- **Documentation**: Refer to Frontier's internal wiki

---

## 🎉 Acknowledgments

- Inspired by Microsoft's Clippy virtual assistant
- Built with modern web technologies
- Designed for Frontier Communications agents
- Created during the Frontier Hackathon

---

## 📅 Version History

### Version 1.0.0 (2025-11-17)
- Initial release
- Core functionality implemented
- Three AIVA states
- Databricks integration
- SharePoint article linking
- Session management
- Responsive UI

---

<div align="center">
  <p><strong>Built with ❤️ for Frontier Communications</strong></p>
  <p>Improving customer service, one interaction at a time.</p>
</div>
