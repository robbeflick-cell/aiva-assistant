from flask import Flask, jsonify, request
from flask_cors import CORS
from databricks import sql
import os
from dotenv import load_dotenv
from datetime import datetime
import requests
from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.client_credential import ClientCredential

load_dotenv()

app = Flask(__name__)
CORS(app)

# Databricks Configuration
DATABRICKS_SERVER_HOSTNAME = os.getenv('DATABRICKS_SERVER_HOSTNAME')
DATABRICKS_HTTP_PATH = os.getenv('DATABRICKS_HTTP_PATH')
DATABRICKS_ACCESS_TOKEN = os.getenv('DATABRICKS_ACCESS_TOKEN')

# SharePoint Configuration
SHAREPOINT_SITE_URL = os.getenv('SHAREPOINT_SITE_URL')
SHAREPOINT_CLIENT_ID = os.getenv('SHAREPOINT_CLIENT_ID')
SHAREPOINT_CLIENT_SECRET = os.getenv('SHAREPOINT_CLIENT_SECRET')
SHAREPOINT_TENANT_ID = os.getenv('SHAREPOINT_TENANT_ID')


def get_customer_data(btn):
    """
    Query Databricks to retrieve customer interaction data
    """
    try:
        connection = sql.connect(
            server_hostname=DATABRICKS_SERVER_HOSTNAME,
            http_path=DATABRICKS_HTTP_PATH,
            access_token=DATABRICKS_ACCESS_TOKEN
        )
        
        cursor = connection.cursor()
        
        # Query the fictitious customer data table
        query = f"""
        SELECT 
            btn,
            customer_name,
            balance_due,
            date_of_previous_call,
            call_synopsis,
            resolution_status
        FROM hackathon.hackathon_hack_it.fictitious_customer_data_3
        WHERE btn = '{btn}'
        ORDER BY date_of_previous_call DESC
        LIMIT 1
        """
        
        cursor.execute(query)
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if result:
            return {
                'btn': result[0],
                'customer_name': result[1],
                'balance_due': float(result[2]) if result[2] else 0.00,
                'date_of_previous_call': str(result[3]) if result[3] else None,
                'call_synopsis': result[4],
                'resolution_status': result[5]
            }
        return None
        
    except Exception as e:
        print(f"Error querying Databricks: {str(e)}")
        return None


def search_sharepoint_articles(keywords):
    """
    Search SharePoint for relevant articles based on keywords
    Returns a list of relevant document URLs
    """
    try:
        # Authenticate to SharePoint
        credentials = ClientCredential(SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET)
        ctx = ClientContext(SHAREPOINT_SITE_URL).with_credentials(credentials)
        
        # Search for documents containing keywords
        search_query = ' OR '.join(keywords.split())
        
        # Get document library
        library = ctx.web.lists.get_by_title("Documents")
        items = library.items.get().execute_query()
        
        relevant_docs = []
        
        for item in items:
            # Check if item title or content matches keywords
            if any(keyword.lower() in str(item.properties.get('Title', '')).lower() 
                   for keyword in keywords.split()):
                doc_url = item.properties.get('FileRef', '')
                doc_title = item.properties.get('Title', '')
                doc_id = item.properties.get('UniqueId', '')
                
                if doc_url:
                    viewer_url = f"{SHAREPOINT_SITE_URL}/_layouts/15/viewer.aspx?sourcedoc={{{doc_id}}}"
                    relevant_docs.append({
                        'title': doc_title,
                        'url': viewer_url
                    })
        
        return relevant_docs[:3]  # Return top 3 matches
        
    except Exception as e:
        print(f"Error searching SharePoint: {str(e)}")
        # Return fallback articles based on common scenarios
        return get_fallback_articles(keywords)


def get_fallback_articles(keywords):
    """
    Return fallback article URLs based on common customer service scenarios
    """
    base_url = "https://frontiercorp1.sharepoint.com/sites/FoneRepository/_layouts/15/viewer.aspx?sourcedoc="
    
    # Map keywords to known article IDs
    article_map = {
        'payment': {
            'title': 'PaymentInquirySettingupAutoPay_aspx',
            'id': '{7ab3f3e1-377c-491c-a2d2-c1ede5b89def}'
        },
        'auto-payment': {
            'title': 'PaymentInquirySettingupAutoPay_aspx',
            'id': '{7ab3f3e1-377c-491c-a2d2-c1ede5b89def}'
        },
        'late fee': {
            'title': 'QuestioningCharge-DisputeLateFee_aspx',
            'id': '{d824f671-23e5-43bb-bf63-d90bc6521d30}'
        },
        'dispute': {
            'title': 'QuestioningCharge-DisputeLateFee_aspx',
            'id': '{d824f671-23e5-43bb-bf63-d90bc6521d30}'
        }
    }
    
    keywords_lower = keywords.lower()
    matched_articles = []
    
    for keyword, article in article_map.items():
        if keyword in keywords_lower:
            matched_articles.append({
                'title': article['title'],
                'url': base_url + article['id']
            })
    
    # Return at least one article if no matches
    if not matched_articles:
        matched_articles.append({
            'title': 'PaymentInquirySettingupAutoPay_aspx',
            'url': base_url + '{7ab3f3e1-377c-491c-a2d2-c1ede5b89def}'
        })
    
    return matched_articles


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})


@app.route('/api/customer/<btn>', methods=['GET'])
def get_customer_info(btn):
    """
    Retrieve customer information based on BTN/phone number
    """
    # Validate BTN format (10 digits)
    if not btn.isdigit() or len(btn) != 10:
        return jsonify({'error': 'Invalid BTN format. Please provide a 10-digit number.'}), 400
    
    # Get customer data from Databricks
    customer_data = get_customer_data(btn)
    
    if not customer_data:
        return jsonify({
            'found': False,
            'message': "I'm sorry I cannot find a recent call from the customer. Is there anything else I can help you find?"
        })
    
    # Search for relevant SharePoint articles
    search_keywords = customer_data.get('call_synopsis', '')
    articles = search_sharepoint_articles(search_keywords)
    
    # Format the response
    response = {
        'found': True,
        'btn': customer_data['btn'],
        'customer_name': customer_data['customer_name'],
        'balance_due': f"{customer_data['balance_due']:.2f}",
        'date_of_previous_call': customer_data['date_of_previous_call'],
        'previous_call_details': customer_data['call_synopsis'],
        'resolution_articles': articles
    }
    
    return jsonify(response)


@app.route('/api/greeting', methods=['GET'])
def get_greeting():
    """
    Return the greeting message for AIVA
    """
    return jsonify({
        'message': "Hello! My name is AIVA! I'm your Frontier AI Virtual Assistant. Which account can I help you with today?"
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
