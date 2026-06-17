import os
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm
from datetime import datetime

# Directory to store generated reports
REPORTS_DIR = "generated_reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_docx_report(template_path: str, context: dict, report_id: int, include_signature: bool = False) -> str:
    """
    Generate a DOCX report from a template and context data.
    """
    doc = DocxTemplate(template_path)
    
    if include_signature:
        sig_path = os.path.join("app", "assets", "mock_signature.png")
        if os.path.exists(sig_path):
            context["Signature"] = InlineImage(doc, sig_path, width=Mm(40))
            
    # Render the template with the provided data context
    doc.render(context)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"report_{report_id}_{timestamp}.docx"
    output_path = os.path.join(REPORTS_DIR, output_filename)
    
    doc.save(output_path)
    return output_path

def convert_docx_to_pdf(docx_path: str) -> str:
    """
    Convert a DOCX file to PDF using docx2pdf.
    """
    try:
        import pythoncom
        from docx2pdf import convert
        
        pdf_path = docx_path.replace(".docx", ".pdf")
        # Initialize COM for multithreaded environment (FastAPI)
        pythoncom.CoInitialize()
        try:
            convert(os.path.abspath(docx_path), os.path.abspath(pdf_path))
        finally:
            pythoncom.CoUninitialize()
            
        return pdf_path
    except Exception as e:
        print(f"PDF conversion error: {e}")
        # Return original docx if conversion fails
        return docx_path
