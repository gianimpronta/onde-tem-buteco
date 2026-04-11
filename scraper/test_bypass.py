"""
Diagnóstico: testa diferentes métodos para acessar comidadibuteco.com.br
Roda no GitHub Actions para identificar qual abordagem bypassa o bloqueio.
"""
import sys
import time

URL = "https://comidadibuteco.com.br/butecos/page/1/"
SLUG_URL = "https://comidadibuteco.com.br/buteco/1-poco-loco/"


def test_curl_cffi():
    print("\n[1] curl-cffi chrome131...")
    try:
        from curl_cffi import requests as cffi_req
        r = cffi_req.get(URL, impersonate="chrome131", timeout=15)
        print(f"    status: {r.status_code} | size: {len(r.text)}")
        return r.status_code == 200
    except Exception as e:
        print(f"    ERRO: {e}")
        return False


def test_curl_cffi_session():
    print("\n[2] curl-cffi session (homepage -> butecos)...")
    try:
        from curl_cffi import requests as cffi_req
        s = cffi_req.Session()
        r1 = s.get("https://comidadibuteco.com.br/", impersonate="chrome131", timeout=15)
        print(f"    homepage: {r1.status_code}")
        time.sleep(1)
        r2 = s.get(URL, impersonate="chrome131",
                   headers={"Referer": "https://comidadibuteco.com.br/"}, timeout=15)
        print(f"    butecos: {r2.status_code} | size: {len(r2.text)}")
        return r2.status_code == 200
    except Exception as e:
        print(f"    ERRO: {e}")
        return False


def test_playwright():
    print("\n[3] Playwright headless chromium...")
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(URL, timeout=30000)
            status = page.evaluate("() => window.location.href")
            content = page.content()
            print(f"    url: {status} | size: {len(content)}")
            browser.close()
            return len(content) > 5000
    except Exception as e:
        print(f"    ERRO: {e}")
        return False


def test_playwright_stealth():
    print("\n[4] Playwright + stealth...")
    try:
        from playwright.sync_api import sync_playwright
        from playwright_stealth import stealth_sync
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            stealth_sync(page)
            page.goto(URL, timeout=30000)
            content = page.content()
            print(f"    size: {len(content)}")
            browser.close()
            return len(content) > 5000
    except Exception as e:
        print(f"    ERRO: {e}")
        return False


if __name__ == "__main__":
    results = {}
    results["curl_cffi"] = test_curl_cffi()
    results["curl_cffi_session"] = test_curl_cffi_session()
    results["playwright"] = test_playwright()
    results["playwright_stealth"] = test_playwright_stealth()

    print("\n=== RESULTADOS ===")
    for method, ok in results.items():
        print(f"  {'✓' if ok else '✗'} {method}")

    if any(results.values()):
        print("\nSolução encontrada!")
        sys.exit(0)
    else:
        print("\nNenhum método funcionou.")
        sys.exit(1)
