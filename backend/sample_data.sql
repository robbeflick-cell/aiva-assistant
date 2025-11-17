-- Sample SQL script to create and populate the fictitious customer data table
-- This should be run in Databricks to set up the demo data

CREATE TABLE IF NOT EXISTS hackathon.hackathon_hack_it.fictitious_customer_data_3 (
    btn STRING COMMENT 'Business Telephone Number / Account Number',
    customer_name STRING COMMENT 'Customer Full Name',
    balance_due DECIMAL(10,2) COMMENT 'Current Account Balance',
    date_of_previous_call DATE COMMENT 'Date of Most Recent Customer Contact',
    call_synopsis STRING COMMENT 'Brief description of previous call',
    resolution_status STRING COMMENT 'Whether issue was resolved or not'
)
COMMENT 'Fictitious customer interaction data for AIVA demo';

-- Insert sample data
INSERT INTO hackathon.hackathon_hack_it.fictitious_customer_data_3 VALUES
('2436476063', 'Veronica Phillips', 212.07, '2025-08-06', 
 'Veronica called in to request assistance with updating payment information after a failed auto-payment attempt. The payment information was updated and a payment was processed.',
 'resolved'),

('5528390088', 'Megan Bush', 260.66, '2025-08-21',
 'Megan called to dispute a late fee, claiming the payment was made on time and provided transaction details. The agent advised that the payment didn''t post until after the due date and the agent did not provide a credit for the late fee when the customer was eligible.',
 'not_resolved'),

('5310261793', 'Eric Robinson', 191.87, NULL,
 NULL,
 'no_previous_call'),

('8675309012', 'Jennifer Thompson', 145.50, '2025-09-10',
 'Jennifer contacted us regarding slow internet speeds. Troubleshooting revealed equipment needed replacement. New modem was shipped and issue resolved upon installation.',
 'resolved'),

('3035551234', 'Robert Martinez', 325.00, '2025-09-15',
 'Robert called about a billing error showing charges for services not subscribed to. Agent identified incorrect service code and issued credit for overcharge.',
 'resolved'),

('7185552020', 'Sarah Johnson', 98.75, '2025-09-18',
 'Sarah inquired about upgrading to fiber internet service. Agent confirmed availability at address and scheduled installation for next week.',
 'resolved'),

('4155559876', 'Michael Chen', 450.25, '2025-09-05',
 'Michael disputed charges for early termination fee after moving. Agent noted contract terms were explained but customer remained dissatisfied. No credit issued.',
 'not_resolved'),

('9725558888', 'Patricia Davis', 167.33, '2025-09-12',
 'Patricia called regarding intermittent phone service issues. Technician visit scheduled to check line quality and connection points.',
 'in_progress');
