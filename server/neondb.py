"""
SMM Service - Neon DB API
Serverless Python backend for SMM Service website
"""

import os
import json
import re
from datetime import datetime
from vercel import Vercel

# Try to import psycopg2, fallback to mock if not available
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PG = True
except ImportError:
    HAS_PG = False

# Environment variables
DATABASE_URL = os.environ.get('NEON_DATABASE_URL', '')

# CORS headers
HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
}

def get_db_connection():
    """Get database connection with SSL"""
    if not HAS_PG or not DATABASE_URL:
        return None
    
    return psycopg2.connect(DATABASE_URL, sslmode='require')

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Create settings table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                site_title VARCHAR(255) DEFAULT 'SMM Service',
                subtitle TEXT DEFAULT 'Your Trusted Social Media Partner',
                telegram_link VARCHAR(500) DEFAULT 'https://t.me/yourchannel',
                contact_email VARCHAR(255) DEFAULT 'support@smmservice.com',
                working_hours VARCHAR(100) DEFAULT '24/7 Available',
                prices JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create admin table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS admin (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) DEFAULT 'admin',
                password VARCHAR(255) DEFAULT 'admin123',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create services table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(100) DEFAULT 'star',
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                features TEXT,
                badge VARCHAR(50),
                color VARCHAR(20) DEFAULT '#6366f1',
                featured BOOLEAN DEFAULT FALSE,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create orders table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                service_id INTEGER REFERENCES services(id),
                service_name VARCHAR(255),
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert default settings if not exists
        cur.execute('SELECT COUNT(*) FROM settings')
        if cur.fetchone()[0] == 0:
            cur.execute('''
                INSERT INTO settings (site_title, subtitle, telegram_link, contact_email, working_hours)
                VALUES ('SMM Service', 'Your Trusted Social Media Partner', 'https://t.me/yourchannel', 'support@smmservice.com', '24/7 Available')
            ''')
        
        # Insert default admin if not exists
        cur.execute('SELECT COUNT(*) FROM admin')
        if cur.fetchone()[0] == 0:
            cur.execute('''
                INSERT INTO admin (username, password)
                VALUES ('admin', 'admin123')
            ''')
        
        # Insert default services if not exists
        cur.execute('SELECT COUNT(*) FROM services')
        if cur.fetchone()[0] == 0:
            default_services = [
                ('Instagram Followers', 'instagram', 9.99, 'High-quality Instagram followers', 'Real profiles,Fast delivery,24/7 support', 'Popular', '#E4405F', True),
                ('TikTok Views', 'play-circle', 4.99, 'Boost your TikTok video views', 'Instant start,High retention,Safe & secure', '', '#00F2EA', False),
                ('YouTube Subscribers', 'youtube', 19.99, 'Grow your YouTube channel', 'Real users,Gradual delivery,Money-back guarantee', 'Best', '#FF0000', True),
                ('Twitter Followers', 'twitter', 7.99, 'Increase Twitter presence', 'Quality accounts,Drop protection,Instant delivery', '', '#1DA1F2', False),
                ('Facebook Likes', 'facebook', 5.99, 'Get more Facebook engagement', 'Real likes,Fast delivery,Secure payment', '', '#1877F2', False),
                ('Telegram Members', 'telegram', 8.99, 'Grow your Telegram group', 'Active members,No bots,24/7 support', 'Hot', '#0088cc', False)
            ]
            for service in default_services:
                cur.execute('''
                    INSERT INTO services (name, icon, price, description, features, badge, color, featured)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', service)
        
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Database initialization error: {e}")
        if conn:
            conn.close()
        return False

def get_settings():
    """Get site settings"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT * FROM settings ORDER BY id DESC LIMIT 1')
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            if result:
                return {
                    'site_title': result['site_title'],
                    'subtitle': result['subtitle'],
                    'telegram_link': result['telegram_link'],
                    'contact_email': result['contact_email'],
                    'working_hours': result['working_hours'],
                    'prices': result['prices']
                }
        except Exception as e:
            print(f"Error getting settings: {e}")
            conn.close()
    
    # Return default settings
    return {
        'site_title': 'SMM Service',
        'subtitle': 'Your Trusted Social Media Partner',
        'telegram_link': 'https://t.me/yourchannel',
        'contact_email': 'support@smmservice.com',
        'working_hours': '24/7 Available',
        'prices': {}
    }

def update_settings(data):
    """Update site settings"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('''
                UPDATE settings 
                SET site_title = %s, subtitle = %s, telegram_link = %s, 
                    contact_email = %s, working_hours = %s, prices = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = (SELECT id FROM settings ORDER BY id DESC LIMIT 1)
            ''', (
                data.get('site_title', 'SMM Service'),
                data.get('subtitle', ''),
                data.get('telegram_link', ''),
                data.get('contact_email', ''),
                data.get('working_hours', ''),
                json.dumps(data.get('prices', {}))
            ))
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"Error updating settings: {e}")
            conn.close()
            return False
    
    return True

def get_admin():
    """Get admin credentials"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT username, password FROM admin LIMIT 1')
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            if result:
                return {
                    'username': result['username'],
                    'password': result['password']
                }
        except Exception as e:
            print(f"Error getting admin: {e}")
            conn.close()
    
    return {'username': 'admin', 'password': 'admin123'}

def update_admin(data):
    """Update admin credentials"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('''
                UPDATE admin 
                SET username = %s, password = %s
                WHERE id = 1
            ''', (
                data.get('username', 'admin'),
                data.get('password', 'admin123')
            ))
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"Error updating admin: {e}")
            conn.close()
            return False
    
    return True

def get_services():
    """Get all active services"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT * FROM services WHERE active = TRUE ORDER BY featured DESC, id ASC')
            results = cur.fetchall()
            cur.close()
            conn.close()
            
            return [{
                'id': r['id'],
                'name': r['name'],
                'icon': r['icon'],
                'price': float(r['price']),
                'description': r['description'],
                'features': r['features'],
                'badge': r['badge'],
                'color': r['color'],
                'featured': r['featured']
            } for r in results]
        except Exception as e:
            print(f"Error getting services: {e}")
            conn.close()
    
    # Return default services
    return [
        {'id': 1, 'name': 'Instagram Followers', 'icon': 'instagram', 'price': 9.99, 'description': 'High-quality followers', 'features': 'Real profiles,Fast delivery,24/7 support', 'badge': 'Popular', 'color': '#E4405F', 'featured': True},
        {'id': 2, 'name': 'TikTok Views', 'icon': 'play-circle', 'price': 4.99, 'description': 'Boost views', 'features': 'Instant start,High retention', 'badge': '', 'color': '#00F2EA', 'featured': False},
        {'id': 3, 'name': 'YouTube Subscribers', 'icon': 'youtube', 'price': 19.99, 'description': 'Grow channel', 'features': 'Real users,Money-back guarantee', 'badge': 'Best', 'color': '#FF0000', 'featured': True}
    ]

def get_service(service_id):
    """Get a single service by ID"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT * FROM services WHERE id = %s', (service_id,))
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            if result:
                return {
                    'id': result['id'],
                    'name': result['name'],
                    'icon': result['icon'],
                    'price': float(result['price']),
                    'description': result['description'],
                    'features': result['features'],
                    'badge': result['badge'],
                    'color': result['color'],
                    'featured': result['featured']
                }
        except Exception as e:
            print(f"Error getting service: {e}")
            conn.close()
    
    return None

def create_service(data):
    """Create a new service"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO services (name, icon, price, description, features, badge, color, featured)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                data.get('name'),
                data.get('icon', 'star'),
                data.get('price'),
                data.get('description', ''),
                data.get('features', ''),
                data.get('badge', ''),
                data.get('color', '#6366f1'),
                data.get('featured', False)
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return {'id': new_id, 'success': True}
        except Exception as e:
            print(f"Error creating service: {e}")
            conn.close()
            return {'error': str(e)}
    
    return {'id': 999, 'success': True}

def update_service(service_id, data):
    """Update an existing service"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('''
                UPDATE services 
                SET name = %s, icon = %s, price = %s, description = %s, 
                    features = %s, badge = %s, color = %s, featured = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                data.get('name'),
                data.get('icon', 'star'),
                data.get('price'),
                data.get('description', ''),
                data.get('features', ''),
                data.get('badge', ''),
                data.get('color', '#6366f1'),
                data.get('featured', False),
                service_id
            ))
            conn.commit()
            cur.close()
            conn.close()
            return {'success': True}
        except Exception as e:
            print(f"Error updating service: {e}")
            conn.close()
            return {'error': str(e)}
    
    return {'success': True}

def delete_service(service_id):
    """Delete a service (soft delete)"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('UPDATE services SET active = FALSE WHERE id = %s', (service_id,))
            conn.commit()
            cur.close()
            conn.close()
            return {'success': True}
        except Exception as e:
            print(f"Error deleting service: {e}")
            conn.close()
            return {'error': str(e)}
    
    return {'success': True}

def get_orders():
    """Get all orders"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT * FROM orders ORDER BY created_at DESC')
            results = cur.fetchall()
            cur.close()
            conn.close()
            
            return [{
                'id': r['id'],
                'service_id': r['service_id'],
                'service_name': r['service_name'],
                'customer_name': r['customer_name'],
                'customer_email': r['customer_email'],
                'amount': float(r['amount']),
                'status': r['status'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None
            } for r in results]
        except Exception as e:
            print(f"Error getting orders: {e}")
            conn.close()
    
    return []

def create_order(data):
    """Create a new order"""
    conn = get_db_connection()
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO orders (service_id, service_name, customer_name, customer_email, amount, status)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                data.get('service_id'),
                data.get('service_name'),
                data.get('customer_name', ''),
                data.get('customer_email', ''),
                data.get('amount'),
                data.get('status', 'pending')
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return {'id': new_id, 'success': True}
        except Exception as e:
            print(f"Error creating order: {e}")
            conn.close()
            return {'error': str(e)}
    
    return {'id': 1000, 'success': True}

def update_prices(data):
    """Update pricing data"""
    settings = get_settings()
    settings['prices'] = data.get('prices', {})
    return update_settings(settings)

def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not text:
        return ''
    # Remove HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    # Escape special characters
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
    return text.strip()

def handler(event, context):
    """Main request handler"""
    # Initialize database on first request
    init_db()
    
    path = event.get('path', '/')
    method = event.get('method', 'GET')
    body = event.get('body', '{}')
    
    try:
        data = json.loads(body) if body else {}
    except:
        data = {}
    
    # Route handling
    if path == '/api/settings':
        if method == 'GET':
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(get_settings())}
        elif method == 'POST':
            sanitized_data = {
                'site_title': sanitize_input(data.get('site_title', '')),
                'subtitle': sanitize_input(data.get('subtitle', '')),
                'telegram_link': sanitize_input(data.get('telegram_link', '')),
                'contact_email': sanitize_input(data.get('contact_email', '')),
                'working_hours': sanitize_input(data.get('working_hours', '')),
                'prices': data.get('prices', {})
            }
            if update_settings(sanitized_data):
                return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}
            return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'Failed to update settings'})}
    
    elif path == '/api/admin':
        if method == 'GET':
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(get_admin())}
        elif method == 'POST':
            admin_data = {
                'username': sanitize_input(data.get('username', 'admin')),
                'password': data.get('password', 'admin123')  # In production, hash this!
            }
            if update_admin(admin_data):
                return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}
            return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'Failed to update admin'})}
    
    elif path == '/api/services':
        if method == 'GET':
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(get_services())}
        elif method == 'POST':
            service_data = {
                'name': sanitize_input(data.get('name', '')),
                'icon': sanitize_input(data.get('icon', 'star')),
                'price': float(data.get('price', 0)),
                'description': sanitize_input(data.get('description', '')),
                'features': sanitize_input(data.get('features', '')),
                'badge': sanitize_input(data.get('badge', '')),
                'color': data.get('color', '#6366f1'),
                'featured': bool(data.get('featured', False))
            }
            result = create_service(service_data)
            if 'error' in result:
                return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps(result)}
            return {'statusCode': 201, 'headers': HEADERS, 'body': json.dumps(result)}
    
    elif path.startswith('/api/services/') and method == 'GET':
        service_id = path.split('/')[-1]
        if service_id.isdigit():
            service = get_service(int(service_id))
            if service:
                return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(service)}
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Service not found'})}
    
    elif path.startswith('/api/services/') and method == 'POST':
        parts = path.split('/')
        service_id = parts[-1] if parts[-1].isdigit() else parts[-2]
        if service_id.isdigit():
            service_data = {
                'name': sanitize_input(data.get('name', '')),
                'icon': sanitize_input(data.get('icon', 'star')),
                'price': float(data.get('price', 0)),
                'description': sanitize_input(data.get('description', '')),
                'features': sanitize_input(data.get('features', '')),
                'badge': sanitize_input(data.get('badge', '')),
                'color': data.get('color', '#6366f1'),
                'featured': bool(data.get('featured', False))
            }
            result = update_service(int(service_id), service_data)
            if 'error' in result:
                return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps(result)}
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(result)}
    
    elif path.startswith('/api/services/') and method == 'DELETE':
        parts = path.split('/')
        service_id = parts[-1] if parts[-1].isdigit() else parts[-2]
        if service_id.isdigit():
            result = delete_service(int(service_id))
            if 'error' in result:
                return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps(result)}
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}
    
    elif path == '/api/orders':
        if method == 'GET':
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(get_orders())}
        elif method == 'POST':
            order_data = {
                'service_id': data.get('service_id'),
                'service_name': sanitize_input(data.get('service_name', '')),
                'customer_name': sanitize_input(data.get('customer_name', '')),
                'customer_email': sanitize_input(data.get('customer_email', '')),
                'amount': float(data.get('amount', 0)),
                'status': data.get('status', 'pending')
            }
            result = create_order(order_data)
            if 'error' in result:
                return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps(result)}
            return {'statusCode': 201, 'headers': HEADERS, 'body': json.dumps(result)}
    
    elif path == '/api/prices' and method == 'POST':
        result = update_prices(data)
        if result:
            return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'success': True})}
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'Failed to update prices'})}
    
    # Health check
    elif path == '/api/health':
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'status': 'ok', 'timestamp': datetime.now().isoformat()})}
    
    # 404 for unknown routes
    return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Not found'})}
