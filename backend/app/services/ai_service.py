import os
import google.generativeai as genai
from typing import Optional

# Initialize Gemini
API_KEY = os.environ.get("GEMINI_API_KEY", "dummy_key_for_now")
genai.configure(api_key=API_KEY)

# Use the recommended model for text generation
model = genai.GenerativeModel('gemini-1.5-pro-latest')

def generate_executive_summary(report_data: dict) -> str:
    """
    Generate an executive summary based on the provided report data.
    """
    prompt = f"""
    You are an AI assistant for an Automated Report Management System.
    Please generate a concise Executive Summary based on the following report data:
    {report_data}
    
    The summary should be professional, highlight key metrics, and be written in a formal tone.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def generate_narrative(current_value: float, previous_value: float, metric_name: str, language: str = "Khmer") -> str:
    """
    Generate a narrative comparing current and previous values.
    """
    prompt = f"""
    Write a short narrative comparing the {metric_name}.
    Current value: {current_value}
    Previous value: {previous_value}
    Calculate the percentage change and state if it increased or decreased.
    Write the response in {language}.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating narrative: {str(e)}"

def translate_text(text: str, target_language: str) -> str:
    """
    Translate the provided text into the target language.
    """
    prompt = f"""
    Translate the following text to {target_language}.
    Return ONLY the translated text without any conversational filler.
    
    Text to translate:
    {text}
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error translating text: {str(e)}"

def enhance_text(text: str) -> str:
    """
    Enhance short informal text into formal administrative Khmer language.
    """
    if not text.strip():
        return ""
        
    if API_KEY == "dummy_key_for_now":
        # Mock logic if no real API key is available
        if len(text) < 20:
            return f"ជាបឋម សូមគោរពជម្រាបជូនថា {text} ដែលជារឿងមួយចាំបាច់ត្រូវយកចិត្តទុកដាក់។"
        else:
            return f"តាងនាមឱ្យក្រុមការងារ ខ្ញុំបាទ/នាងខ្ញុំសូមគោរពរាយការណ៍ជូនថា៖ {text}។ អាស្រ័យហេតុនេះ សូមមេត្តាជ្រាប និងចាត់វិធានការតាមការគួរ។"

    prompt = f"""
    You are a professional administrative assistant for a Cambodian institution.
    Please rewrite the following short, informal Khmer text into formal, polite, 
    and highly professional administrative Khmer language (Khmer Formal/Official Tone).
    Do NOT add any greetings or closing remarks unless necessary. Just rewrite the content.
    
    Original text:
    {text}
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return text # Fallback to original text on error
