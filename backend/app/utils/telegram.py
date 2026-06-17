import requests
from app.core.config import settings

def send_telegram_message(text: str, chat_id: str = None) -> bool:
    """
    Send a message to a Telegram chat.
    If chat_id is not provided, it sends to the default group chat.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    target_chat_id = chat_id or settings.TELEGRAM_GROUP_CHAT_ID
    
    if not token or not target_chat_id:
        print("Telegram Bot Token or Chat ID is not configured. Skipping message.")
        return False
        
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": target_chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")
        return False
