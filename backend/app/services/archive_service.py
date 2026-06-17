import os
import shutil
import zipfile
from datetime import datetime

ARCHIVE_DIR = "archives"
os.makedirs(ARCHIVE_DIR, exist_ok=True)

def archive_reports(report_paths: list[str], archive_name: str = None) -> str:
    """
    Zip multiple generated report files into an archive.
    """
    if not archive_name:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        archive_name = f"reports_archive_{timestamp}.zip"
        
    archive_path = os.path.join(ARCHIVE_DIR, archive_name)
    
    with zipfile.ZipFile(archive_path, 'w') as zipf:
        for file_path in report_paths:
            if os.path.exists(file_path):
                # Add file to zip without directory structure
                zipf.write(file_path, os.path.basename(file_path))
                
    return archive_path
