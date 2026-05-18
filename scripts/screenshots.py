"""Take screenshots of TreasureShare user frontend and admin panel."""
from playwright.sync_api import sync_playwright
import os, subprocess, json, urllib.request

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'screenshots')
os.makedirs(OUTPUT_DIR, exist_ok=True)

USER_URL = 'http://localhost:5173'
ADMIN_URL = 'http://localhost:1024'
BACKEND_URL = 'http://localhost:8080'

def screenshot(page, name):
    path = os.path.join(OUTPUT_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f'  Saved: {name}')

def get_admin_captcha():
    """Fetch captcha UUID and code from the backend."""
    try:
        req = urllib.request.Request(f'{BACKEND_URL}/captchaImage')
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        uuid = data.get('uuid', '')
        captcha_enabled = data.get('captchaEnabled', False)
        if not captcha_enabled:
            return '', ''
        # Get captcha code from Redis
        result = subprocess.run(
            ['redis-cli', 'GET', f'captcha_codes:{uuid}'],
            capture_output=True, text=True, timeout=5
        )
        code = result.stdout.strip()
        return code, uuid
    except Exception as e:
        print(f'  Captcha fetch error: {e}')
        return '', ''

def user_frontend(browser):
    """Login to user frontend and capture key pages."""
    print('\n[User Frontend]')
    context = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = context.new_page()

    # Login page screenshot first
    page.goto(f'{USER_URL}/login')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-login.png')

    # Perform login via API to get token
    login_resp = page.evaluate('''async () => {
        const res = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: 'admin', password: 'admin123'})
        });
        const data = await res.json();
        if (data.token) localStorage.setItem('token', data.token);
        return data.token ? 'ok' : JSON.stringify(data);
    }''')
    print(f'  Login: {login_resp}')

    # Discovery page (home)
    page.goto(f'{USER_URL}/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(800)
    screenshot(page, 'user-discovery.png')

    # Product Detail page
    page.goto(f'{USER_URL}/detail/1')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-product-detail.png')

    # Cart page
    page.goto(f'{USER_URL}/cart')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-cart.png')

    # Orders page
    page.goto(f'{USER_URL}/orders')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-orders.png')

    # Order Detail page
    page.goto(f'{USER_URL}/order/1')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-order-detail.png')

    # Rented Out page (seller view)
    page.goto(f'{USER_URL}/rented-out')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-rented-out.png')

    # Community page
    page.goto(f'{USER_URL}/community')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-community.png')

    # Messages page
    page.goto(f'{USER_URL}/messages')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-messages.png')

    # Profile page
    page.goto(f'{USER_URL}/profile')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'user-profile.png')

    context.close()

def admin_panel(browser):
    """Login to admin panel and capture key pages."""
    print('\n[Admin Panel]')
    context = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = context.new_page()

    # Navigate to admin login page first for screenshot
    page.goto(f'{ADMIN_URL}/login')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(800)
    screenshot(page, 'admin-login.png')

    # Get captcha and login via API
    code, uuid = get_admin_captcha()
    print(f'  Captcha enabled: {bool(code)}, code={code}, uuid={uuid[:8] if uuid else "N/A"}...')

    # Login via API and set Admin-Token cookie
    token = page.evaluate(f'''async () => {{
        const res = await fetch('/dev-api/login', {{
            method: 'POST',
            headers: {{'Content-Type': 'application/json'}},
            body: JSON.stringify({{username: 'admin', password: 'admin123', code: '{code}', uuid: '{uuid}'}})
        }});
        const data = await res.json();
        if (data.token) {{
            document.cookie = 'Admin-Token=' + data.token + '; path=/';
        }}
        return data.token || null;
    }}''')
    print(f'  Admin token: {"OK" if token else "FAILED"}')

    # Navigate to dashboard
    page.wait_for_timeout(500)
    page.goto(f'{ADMIN_URL}/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    screenshot(page, 'admin-dashboard.png')

    # Order management
    page.goto(f'{ADMIN_URL}/toy/order')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    screenshot(page, 'admin-orders.png')

    # Product management
    page.goto(f'{ADMIN_URL}/toy/product')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    screenshot(page, 'admin-products.png')

    # Category management
    page.goto(f'{ADMIN_URL}/toy/category')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'admin-categories.png')

    # Community management
    page.goto(f'{ADMIN_URL}/toy/community')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    screenshot(page, 'admin-community.png')

    context.close()

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            user_frontend(browser)
            admin_panel(browser)
        finally:
            browser.close()
    print('\nAll screenshots captured!')

if __name__ == '__main__':
    main()
