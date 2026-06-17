import sqlite3

def fix_nulls():
    conn = sqlite3.connect('arms.db')
    c = conn.cursor()
    c.execute("UPDATE documents SET reference_number = 'VR-UNKNOWN' WHERE reference_number IS NULL")
    conn.commit()
    print("Fixed null reference_number values in documents table:", c.rowcount)
    conn.close()

if __name__ == '__main__':
    fix_nulls()
