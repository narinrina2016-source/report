import sqlite3

def main():
    conn = sqlite3.connect('arms.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO documents (type, reference_number, title, institution, document_date, status, notes)
        SELECT 'Incoming', COALESCE(letter_number, 'VR-' || SUBSTR(tracking_token, 1, 8)), 'សំណើសុំទស្សនកិច្ចពី ' || school_name, school_name, created_at, 'Pending', 'ប្រភេទអ្នកមកទស្សនា៖ ' || visitor_type || char(10) || 'គោលបំណង៖ ' || purpose || char(10) || 'ថ្ងៃទស្សនកិច្ច៖ ' || visit_date
        FROM visit_requests 
        WHERE NOT EXISTS (SELECT 1 FROM documents d WHERE d.institution = visit_requests.school_name AND d.title LIKE '%សំណើសុំទស្សនកិច្ច%')
    ''')
    conn.commit()
    print("Migrated existing visit requests to documents. Count:", c.rowcount)
    conn.close()

if __name__ == '__main__':
    main()
