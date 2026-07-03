"""
NeonDB - Database Module with Website Logs Feature
Handles all database operations including services, settings, credentials, and website logs
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any

# File paths for JSON-based storage
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# File paths
SERVICES_FILE = os.path.join(DATA_DIR, 'services.json')
SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
CREDENTIALS_FILE = os.path.join(DATA_DIR, 'credentials.json')
LOGS_FILE = os.path.join(DATA_DIR, 'website_logs.json')


def _load_json(filepath: str, default: Any = None) -> Any:
    """Load JSON data from file"""
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
        return default if default is not None else []
    except (json.JSONDecodeError, IOError):
        return default if default is not None else []


def _save_json(filepath: str, data: Any) -> bool:
    """Save JSON data to file"""
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=4, default=str)
        return True
    except IOError:
        return False


class Database:
    """Main database class for managing all data operations"""
    
    def __init__(self):
        self.services = self._load_services()
        self.settings = self._load_settings()
        self.credentials = self._load_credentials()
        self.logs = self._load_logs()
    
    # ==================== Services ====================
    
    def _load_services(self) -> List[Dict]:
        """Load services from file"""
        return _load_json(SERVICES_FILE, [])
    
    def get_services(self) -> List[Dict]:
        """Get all services"""
        return self.services
    
    def get_service(self, service_id: int) -> Optional[Dict]:
        """Get a single service by ID"""
        for service in self.services:
            if service.get('id') == service_id:
                return service
        return None
    
    def add_service(self, service_data: Dict) -> Dict:
        """Add a new service"""
        service_id = int(datetime.now().timestamp() * 1000)
        service = {
            'id': service_id,
            'name': service_data.get('name', ''),
            'price': float(service_data.get('price', 0)),
            'description': service_data.get('description', ''),
            'icon': service_data.get('icon', '📦'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.services.append(service)
        self._save_services()
        return service
    
    def update_service(self, service_id: int, service_data: Dict) -> Optional[Dict]:
        """Update an existing service"""
        for i, service in enumerate(self.services):
            if service.get('id') == service_id:
                self.services[i].update(service_data)
                self.services[i]['updated_at'] = datetime.now().isoformat()
                self._save_services()
                return self.services[i]
        return None
    
    def delete_service(self, service_id: int) -> bool:
        """Delete a service"""
        initial_len = len(self.services)
        self.services = [s for s in self.services if s.get('id') != service_id]
        if len(self.services) < initial_len:
            self._save_services()
            return True
        return False
    
    def _save_services(self):
        """Save services to file"""
        _save_json(SERVICES_FILE, self.services)
    
    # ==================== Settings ====================
    
    def _load_settings(self) -> Dict:
        """Load settings from file"""
        return _load_json(SETTINGS_FILE, {
            'title': 'SMM Services',
            'subtitle': 'Premium Social Media Marketing',
            'telegram': '',
            'sliteText': 'Welcome to our SMM panel',
            'welcomeMessage': 'Welcome to our premium SMM services platform.',
            'updated_at': ''
        })
    
    def get_settings(self) -> Dict:
        """Get all settings"""
        return self.settings
    
    def update_settings(self, settings_data: Dict) -> Dict:
        """Update settings"""
        self.settings.update(settings_data)
        self.settings['updated_at'] = datetime.now().isoformat()
        _save_json(SETTINGS_FILE, self.settings)
        return self.settings
    
    # ==================== Credentials ====================
    
    def _load_credentials(self) -> Dict:
        """Load admin credentials from file"""
        return _load_json(CREDENTIALS_FILE, {
            'username': 'admin',
            'password': '',  # hashed password
            'updated_at': ''
        })
    
    def get_credentials(self) -> Dict:
        """Get admin credentials"""
        return self.credentials
    
    def update_credentials(self, username: str, password: str = None) -> Dict:
        """Update admin credentials"""
        self.credentials['username'] = username
        if password:
            # In production, hash the password before storing
            # self.credentials['password'] = hash_password(password)
            self.credentials['password'] = password
        self.credentials['updated_at'] = datetime.now().isoformat()
        _save_json(CREDENTIALS_FILE, self.credentials)
        return self.credentials
    
    def verify_credentials(self, username: str, password: str) -> bool:
        """Verify admin credentials"""
        creds = self.credentials
        return (creds.get('username') == username and 
                creds.get('password') == password)
    
    # ==================== Website Logs ====================
    
    def _load_logs(self) -> List[Dict]:
        """Load website logs from file"""
        return _load_json(LOGS_FILE, [])
    
    def get_logs(self, page: str = None, limit: int = 100) -> List[Dict]:
        """Get website logs with optional filtering"""
        logs = self.logs
        
        if page:
            logs = [log for log in logs if log.get('page') == page]
        
        # Sort by timestamp descending (newest first)
        logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return logs[:limit]
    
    def add_log(self, log_data: Dict) -> Dict:
        """Add a new website log entry"""
        log = {
            'id': len(self.logs) + 1,
            'page': log_data.get('page', '/'),
            'timestamp': log_data.get('timestamp', datetime.now().isoformat()),
            'referrer': log_data.get('referrer', 'direct'),
            'user_agent': log_data.get('user_agent', 'Unknown'),
            'ip': log_data.get('ip', None),
            'country': log_data.get('country', None),
            'city': log_data.get('city', None),
            'device': log_data.get('device', 'Unknown'),
            'browser': log_data.get('browser', 'Unknown'),
            'os': log_data.get('os', 'Unknown')
        }
        self.logs.append(log)
        self._save_logs()
        return log
    
    def log_visit(self, request=None, response=None) -> Dict:
        """Log a page visit from request object"""
        log_data = {
            'page': '/',
            'timestamp': datetime.now().isoformat(),
            'referrer': 'direct',
            'user_agent': 'Unknown'
        }
        
        if request:
            log_data['page'] = getattr(request, 'path', '/')
            log_data['referrer'] = request.headers.get('Referer', 'direct')
            log_data['user_agent'] = request.headers.get('User-Agent', 'Unknown')
            log_data['ip'] = getattr(request, 'remote_addr', None)
            
            # Parse user agent for device info
            ua = log_data['user_agent']
            log_data['device'] = self._parse_device(ua)
            log_data['browser'] = self._parse_browser(ua)
            log_data['os'] = self._parse_os(ua)
        
        return self.add_log(log_data)
    
    def _parse_device(self, user_agent: str) -> str:
        """Parse device type from user agent"""
        ua = user_agent.lower()
        if 'mobile' in ua or 'android' in ua:
            return 'Mobile'
        elif 'tablet' in ua or 'ipad' in ua:
            return 'Tablet'
        return 'Desktop'
    
    def _parse_browser(self, user_agent: str) -> str:
        """Parse browser from user agent"""
        ua = user_agent.lower()
        if 'chrome' in ua and 'edg' not in ua:
            return 'Chrome'
        elif 'firefox' in ua:
            return 'Firefox'
        elif 'safari' in ua and 'chrome' not in ua:
            return 'Safari'
        elif 'edg' in ua:
            return 'Edge'
        elif 'opera' in ua or 'opr' in ua:
            return 'Opera'
        return 'Unknown'
    
    def _parse_os(self, user_agent: str) -> str:
        """Parse OS from user agent"""
        ua = user_agent.lower()
        if 'windows' in ua:
            return 'Windows'
        elif 'mac os' in ua or 'macos' in ua:
            return 'macOS'
        elif 'linux' in ua and 'android' not in ua:
            return 'Linux'
        elif 'android' in ua:
            return 'Android'
        elif 'ios' in ua or 'iphone' in ua or 'ipad' in ua:
            return 'iOS'
        return 'Unknown'
    
    def get_log_stats(self) -> Dict:
        """Get statistics about website logs"""
        if not self.logs:
            return {
                'total': 0,
                'today': 0,
                'unique_pages': 0,
                'devices': {},
                'browsers': {},
                'referrers': {}
            }
        
        today = datetime.now().date().isoformat()
        pages = set()
        devices = {}
        browsers = {}
        referrers = {}
        
        for log in self.logs:
            # Count by date
            log_date = log.get('timestamp', '')[:10]
            
            # Count unique pages
            page = log.get('page', '/')
            if page:
                pages.add(page)
            
            # Count devices
            device = log.get('device', 'Unknown')
            devices[device] = devices.get(device, 0) + 1
            
            # Count browsers
            browser = log.get('browser', 'Unknown')
            browsers[browser] = browsers.get(browser, 0) + 1
            
            # Count referrers
            referrer = log.get('referrer', 'direct')
            referrers[referrer] = referrers.get(referrer, 0) + 1
        
        return {
            'total': len(self.logs),
            'today': len([l for l in self.logs if l.get('timestamp', '')[:10] == today]),
            'unique_pages': len(pages),
            'devices': devices,
            'browsers': browsers,
            'referrers': referrers
        }
    
    def clear_logs(self) -> bool:
        """Clear all logs"""
        self.logs = []
        return self._save_logs()
    
    def delete_log(self, log_id: int) -> bool:
        """Delete a specific log entry"""
        initial_len = len(self.logs)
        self.logs = [l for l in self.logs if l.get('id') != log_id]
        if len(self.logs) < initial_len:
            self._save_logs()
            return True
        return False
    
    def _save_logs(self) -> bool:
        """Save logs to file"""
        return _save_json(LOGS_FILE, self.logs)
    
    # ==================== Utility Methods ====================
    
    def export_logs_csv(self) -> str:
        """Export logs as CSV string"""
        if not self.logs:
            return ''
        
        headers = ['ID', 'Page', 'Timestamp', 'Referrer', 'User Agent', 'IP', 'Device', 'Browser', 'OS']
        rows = [','.join(headers)]
        
        for log in self.logs:
            row = [
                str(log.get('id', '')),
                log.get('page', ''),
                log.get('timestamp', ''),
                log.get('referrer', ''),
                log.get('user_agent', ''),
                log.get('ip', ''),
                log.get('device', ''),
                log.get('browser', ''),
                log.get('os', '')
            ]
            rows.append(','.join(f'"{r}"' for r in row))
        
        return '\n'.join(rows)
    
    def to_dict(self) -> Dict:
        """Convert database state to dictionary"""
        return {
            'services': self.services,
            'settings': self.settings,
            'credentials': self.credentials,
            'logs': self.logs,
            'log_stats': self.get_log_stats()
        }


# Global database instance
db = Database()


# Flask middleware for automatic logging
def log_request(request):
    """Middleware function to log requests"""
    db.log_visit(request)


# API helper functions
def get_all_services():
    """Get all services for API"""
    return db.get_services()


def create_service(data):
    """Create new service for API"""
    return db.add_service(data)


def update_service_by_id(service_id, data):
    """Update service for API"""
    return db.update_service(service_id, data)


def delete_service_by_id(service_id):
    """Delete service for API"""
    return db.delete_service(service_id)


def get_all_settings():
    """Get all settings for API"""
    return db.get_settings()


def update_settings_by_id(data):
    """Update settings for API"""
    return db.update_settings(data)


def get_all_logs(page=None, limit=100):
    """Get logs for API"""
    return db.get_logs(page, limit)


def get_logs_stats():
    """Get log statistics for API"""
    return db.get_log_stats()


def clear_all_logs():
    """Clear all logs for API"""
    return db.clear_logs()


if __name__ == '__main__':
    # Initialize database with sample data
    print("Initializing database...")
    
    # Add sample services
    sample_services = [
        {'name': 'Instagram Followers', 'price': 9.99, 'description': 'High quality Instagram followers', 'icon': '📸'},
        {'name': 'TikTok Views', 'price': 4.99, 'description': 'Real TikTok views', 'icon': '🎵'},
        {'name': 'YouTube Subscribers', 'price': 14.99, 'description': 'Active YouTube subscribers', 'icon': '▶️'},
        {'name': 'Twitter Followers', 'price': 7.99, 'description': 'Premium Twitter followers', 'icon': '🐦'},
        {'name': 'Telegram Members', 'price': 5.99, 'description': 'Real Telegram group members', 'icon': '✈️'}
    ]
    
    for service in sample_services:
        db.add_service(service)
    
    print(f"Added {len(sample_services)} sample services")
    print("Database initialized successfully!")
