"""
Network Utilities Module
Provides network-related OSINT and utility functions like IP lookup, domain info, etc.
"""

import json
import os
import socket  # For infoga to resolve hostname if IP is given
import subprocess  # For iplocation's curl fallback
import textwrap  # for godorker

import requests
from bs4 import BeautifulSoup  # For bypass_bitly and godorker
from lxml.html import fromstring  # For godorker title parsing

try:
    from googlesearch import search as google_search
except ImportError:
    google_search = None  # Make it optional
import logging

# Placeholder for color codes if direct printing is kept, otherwise remove.
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
WHITE = "\033[0m"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
}

# API URLs from E4GL30S1NT
IPINFO_API_URL = "https://ipinfo.io/{}/json"
API_HACKERTARGET = "https://api.hackertarget.com/{}/?q={}"
VERIPHONE_API_BASE_URL = "https://api.veriphone.io/v2/verify"


class NetworkUtilities:
    def __init__(self, config=None, logger=None):
        self.config = config if config is not None else {}
        self.logger = logger if logger is not None else logging.getLogger(__name__)
        if not logger:
            logging.basicConfig(
                level=logging.INFO,
                format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            )
            self.logger = logging.getLogger(__name__)

        self.veriphone_api_key = self.config.get("VERIPHONE_API_KEY")
        # HackerTarget does not require an API key for basic use through this script

    def get_ip_location(self, ip_address=None):
        """
        Retrieves and returns geolocation information for an IP address.
        If no IP is provided, it attempts to find the public IP of the current machine.
        """
        if not ip_address:
            try:
                # Attempt to get public IP using an external service via requests
                response = requests.get("https://api.ipify.org?format=json", timeout=5)
                response.raise_for_status()
                ip_address = response.json().get("ip")
                self.logger.info(f"Detected public IP: {ip_address}")
            except Exception as e_pub_ip:
                self.logger.warning(
                    f"Could not auto-detect public IP: {e_pub_ip}. Trying curl fallback."
                )
                # Fallback to curl if requests method fails (as in original E4GL30S1NT)
                try:
                    process = subprocess.run(
                        ["curl", "-s", "ifconfig.co"],
                        capture_output=True,
                        text=True,
                        check=True,
                        timeout=5,
                    )
                    ip_address = process.stdout.strip()
                    self.logger.info(f"Detected public IP (via curl): {ip_address}")
                except Exception as e_curl:
                    self.logger.error(
                        f"Error getting local public IP using curl: {e_curl}"
                    )
                    return {"error": "Could not determine public IP address."}

        if not ip_address:  # Should not happen if auto-detection worked.
            return {"error": "No IP address provided or detected."}

        self.logger.info(f"Fetching location for IP: {ip_address}")
        try:
            response = requests.get(
                IPINFO_API_URL.format(ip_address),
                headers=DEFAULT_HEADERS,
                timeout=self.config.get("ipinfo_timeout", 10),
            )
            response.raise_for_status()
            location_data = response.json()
            self.logger.info(
                f"Location data for {ip_address}: {location_data.get('city')}, {location_data.get('country')}"
            )
            return location_data
        except requests.exceptions.HTTPError as http_err:
            self.logger.error(
                f"IPInfo API HTTP error for {ip_address}: {http_err} - {response.text[:200]}"
            )
            return {
                "error": f"API error: {http_err.response.status_code}",
                "details": response.text[:200],
            }
        except requests.exceptions.RequestException as req_err:
            self.logger.error(f"IPInfo API request error for {ip_address}: {req_err}")
            return {"error": f"Request error: {req_err}"}
        except json.JSONDecodeError:
            self.logger.error(
                f"Failed to decode JSON from IPInfo API for {ip_address}."
            )
            return {"error": "JSON decode error"}

    def get_domain_info_hackertarget(self, target_domain_or_ip, scan_type):
        """
        Retrieves information from HackerTarget API.
        scan_type can be: dnslookup, whois, subnetcalc, hostsearch, mtr, reverseiplookup, pagelinks, httpheaders, findshareddns etc.
        See https://hackertarget.com/ip-tools/ for available tools.
        """
        if not target_domain_or_ip:
            self.logger.error(
                "Target domain or IP cannot be empty for HackerTarget scan."
            )
            return None

        # Resolve hostname to IP if an IP-like string is given but it's actually a hostname for some tools.
        # Some HackerTarget tools expect domain, some IP. This logic might need adjustment per tool.
        # For now, if it looks like an IP, we assume it is. If not, we try to resolve if scan_type needs IP.
        # This is simplified; E4GL30S1NT did socket.gethostbyname if target.split('.')[0].isnumeric() was false,
        # which is a bit confusing. Let's assume target is passed correctly for the scan_type.

        self.logger.info(
            f"Requesting '{scan_type}' for '{target_domain_or_ip}' from HackerTarget."
        )
        url = API_HACKERTARGET.format(scan_type, target_domain_or_ip)
        try:
            response = requests.get(
                url,
                headers=DEFAULT_HEADERS,
                timeout=self.config.get("hackertarget_timeout", 20),
            )  # Increased timeout
            response.raise_for_status()
            # HackerTarget API often returns plain text
            self.logger.info(
                f"Successfully fetched '{scan_type}' data for '{target_domain_or_ip}'."
            )
            return response.text
        except requests.exceptions.HTTPError as http_err:
            self.logger.error(
                f"HackerTarget API HTTP error for {scan_type} on {target_domain_or_ip}: {http_err} - {response.text[:200]}"
            )
        except requests.exceptions.RequestException as req_err:
            self.logger.error(
                f"HackerTarget API request error for {scan_type} on {target_domain_or_ip}: {req_err}"
            )
        return None

    def get_phone_info(self, phone_number, api_key=None):
        """Retrieves information about a phone number using Veriphone API."""
        key_to_use = api_key or self.veriphone_api_key
        if not key_to_use:
            self.logger.error("Veriphone API key not configured.")
            return {"error": "Veriphone API key not configured."}
        if not phone_number:
            self.logger.error("Phone number cannot be empty.")
            return {"error": "Phone number cannot be empty."}

        self.logger.info(f"Fetching info for phone number: {phone_number}")
        api_url = f"{VERIPHONE_API_BASE_URL}?phone={phone_number}&key={key_to_use}"
        try:
            response = requests.get(
                api_url,
                headers=DEFAULT_HEADERS,
                timeout=self.config.get("veriphone_timeout", 10),
            )
            response.raise_for_status()
            data = response.json()
            self.logger.info(f"Successfully fetched phone info for {phone_number}.")
            return data
        except requests.exceptions.HTTPError as http_err:
            self.logger.error(
                f"Veriphone API HTTP error for {phone_number}: {http_err} - {response.text[:200]}"
            )
            return {
                "error": f"API error: {http_err.response.status_code}",
                "details": response.text[:200],
            }
        except requests.exceptions.RequestException as req_err:
            self.logger.error(
                f"Veriphone API request error for {phone_number}: {req_err}"
            )
            return {"error": f"Request error: {req_err}"}
        except json.JSONDecodeError:
            self.logger.error(
                f"Failed to decode JSON from Veriphone API for {phone_number}."
            )
            return {"error": "JSON decode error"}

    def google_dork_search(self, dork_query, num_results=10):
        """Performs Google dorking and returns result URLs and titles."""
        if not google_search:
            self.logger.error(
                "Python library 'google' is not installed. Cannot perform Google Dork search."
            )
            return {"error": "Google search library not installed."}
        if not dork_query:
            self.logger.error("Dork query cannot be empty.")
            return {"error": "Dork query cannot be empty."}

        self.logger.info(
            f"Performing Google dork search for: '{dork_query}' (max {num_results} results)"
        )
        results = []
        try:
            # The 'googlesearch' library handles iteration internally.
            # It might make multiple HTTP requests, so can be slow or hit limits.
            for url in google_search(
                dork_query, num_results=num_results, sleep_interval=2, timeout=5
            ):  # Added sleep_interval
                title = "N/A"
                try:  # Try to fetch title, but don't let it break the dorking
                    page_response = requests.get(
                        url, headers=DEFAULT_HEADERS, timeout=5
                    )
                    page_response.raise_for_status()
                    # Using lxml.html.fromstring as in E4GL30S1NT for title
                    parsed_body = fromstring(page_response.content)
                    title_element = parsed_body.findtext(".//title")
                    if title_element:
                        title = textwrap.shorten(
                            title_element.strip(), width=100, placeholder="..."
                        )
                except Exception as title_e:
                    self.logger.debug(f"Could not fetch title for {url}: {title_e}")
                results.append({"url": url, "title": title})
                self.logger.debug(f"Found dork result: {title} - {url}")
            self.logger.info(
                f"Google dork search for '{dork_query}' complete. Found {len(results)} results."
            )
        except (
            Exception
        ) as e_search:  # Catch broad exceptions from the google search library
            self.logger.error(f"Error during Google dork search: {e_search}")
            # The library might raise its own specific errors for HTTP issues or blocks
            if "HTTP Error 429" in str(e_search):
                self.logger.warning(
                    "Google Dork search likely blocked due to too many requests (HTTP 429). Try again later or use a proxy/VPN."
                )
                return {"error": "Rate limited by Google.", "results_so_far": results}
            return {"error": str(e_search), "results_so_far": results}
        return {"query": dork_query, "results": results}

    def bypass_bitly_url(self, bitly_url):
        """Bypasses a Bitly URL shortener to find the original URL."""
        if not bitly_url or not ("bit.ly/" in bitly_url or "bitly.com/" in bitly_url):
            self.logger.error(f"Invalid Bitly URL provided: {bitly_url}")
            return {"error": "Invalid Bitly URL."}

        self.logger.info(f"Attempting to bypass Bitly URL: {bitly_url}")
        try:
            # allow_redirects=False is key here to get the Location header
            response = requests.get(
                bitly_url,
                headers=DEFAULT_HEADERS,
                timeout=self.config.get("bitly_timeout", 10),
                allow_redirects=False,
            )

            if (
                response.status_code in (301, 302, 307, 308)
                and "Location" in response.headers
            ):
                original_url = response.headers["Location"]
                self.logger.info(
                    f"Bitly URL {bitly_url} bypassed. Original URL: {original_url}"
                )
                return {"original_url": original_url, "bitly_url": bitly_url}
            else:  # If no redirect, try parsing HTML (less common for bit.ly itself)
                response_html = requests.get(
                    bitly_url, headers=DEFAULT_HEADERS, timeout=10, allow_redirects=True
                )  # Allow redirects this time
                soup = BeautifulSoup(response_html.text, "lxml")  # lxml is faster
                # This meta refresh or link finding is more for generic shorteners, bit.ly usually 301/302s
                meta_refresh = soup.find("meta", attrs={"http-equiv": "refresh"})
                if meta_refresh and meta_refresh.get("content"):
                    url_match = re.search(
                        r'url=[\'"]?([^\'" >]+)', meta_refresh["content"], re.IGNORECASE
                    )
                    if url_match:
                        original_url = url_match.group(1)
                        self.logger.info(
                            f"Bitly URL {bitly_url} bypassed (meta refresh). Original URL: {original_url}"
                        )
                        return {"original_url": original_url, "bitly_url": bitly_url}

                # Fallback for some structures if direct redirect fails
                links = soup.find_all("a", href=True)
                if links:  # This is very generic
                    self.logger.debug(
                        f"Trying to find original link in page content for {bitly_url} as direct redirect failed."
                    )
                    # This logic from E4GL30S1NT was "soup_parser.find_all("a", href=True)[0]["href"]"
                    # which is too naive. Bitly usually doesn't embed the link this way.
                    # For now, we'll rely on the redirect. If that fails, this method fails.

                self.logger.warning(
                    f"Could not bypass Bitly URL {bitly_url}. Status: {response.status_code}. Headers: {response.headers}"
                )
                return {
                    "error": "Could not resolve Bitly URL via redirect.",
                    "status_code": response.status_code,
                }

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error bypassing Bitly URL {bitly_url}: {e}")
            return {"error": f"Request error: {e}"}


if __name__ == "__main__":
    test_config = {
        "log_level": "DEBUG",
        "VERIPHONE_API_KEY": os.environ.get(
            "VERIPHONE_API_KEY_TEST"
        ),  # Needs env var for full test
    }
    test_logger = logging.getLogger("NetworkUtilsTest")
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - [%(funcName)s] - %(message)s",
    )

    net_utils = NetworkUtilities(config=test_config, logger=test_logger)

    test_logger.info("--- Testing IP Location ---")
    # Test with a known IP or let it auto-detect
    # location = net_utils.get_ip_location(ip_address="8.8.8.8")
    location_auto = net_utils.get_ip_location()
    # test_logger.info(f"Location for 8.8.8.8: {location.get('city')}, {location.get('country')}, ISP: {location.get('org')}")
    test_logger.info(f"Auto-detected IP Location: {location_auto}")

    test_logger.info("\n--- Testing HackerTarget Domain Info ---")
    dns_info = net_utils.get_domain_info_hackertarget("google.com", "dnslookup")
    if dns_info:
        test_logger.info(
            f"DNS Info for google.com (first 100 chars):\n{dns_info[:100]}..."
        )
    else:
        test_logger.error("Failed to get DNS info for google.com.")

    whois_info = net_utils.get_domain_info_hackertarget("google.com", "whois")
    if whois_info:
        test_logger.info(
            f"WHOIS Info for google.com (first 100 chars):\n{whois_info[:100]}..."
        )
    else:
        test_logger.error("Failed to get WHOIS info for google.com.")

    test_logger.info("\n--- Testing Phone Info ---")
    if net_utils.veriphone_api_key:
        # Replace with a testable phone number if you have one for Veriphone
        # phone_data = net_utils.get_phone_info("+14158586273") # Example number
        phone_data = net_utils.get_phone_info(
            os.environ.get("TEST_PHONE_NUMBER", "+12000000000")
        )  # Use env var or placeholder
        if phone_data and not phone_data.get("error"):
            test_logger.info(
                f"Phone info: Country - {phone_data.get('country')}, Type - {phone_data.get('phone_type')}"
            )
        else:
            test_logger.warning(
                f"Could not get phone info or error occurred: {phone_data}"
            )
    else:
        test_logger.warning("Skipping Phone Info test as VERIPHONE_API_KEY is not set.")

    test_logger.info("\n--- Testing Google Dork Search ---")
    if google_search:
        dork_results = net_utils.google_dork_search(
            "inurl:admin.php site:example.com", num_results=3
        )
        if dork_results and "results" in dork_results:
            test_logger.info(f"Dork results for 'inurl:admin.php site:example.com':")
            for res in dork_results["results"]:
                test_logger.info(f"  Title: {res['title']}, URL: {res['url']}")
        elif dork_results and "error" in dork_results:
            test_logger.warning(f"Google Dork search error: {dork_results['error']}")
        else:
            test_logger.error(
                "Google Dork search failed to return expected results structure."
            )
    else:
        test_logger.warning(
            "Skipping Google Dork test as 'google' library is not installed."
        )

    test_logger.info("\n--- Testing Bitly Bypass ---")
    # Use a known, working Bitly link for testing
    # Example: bit.ly link that redirects to google.com (you might need to create one for a stable test)
    # test_bitly_url = "https://bit.ly/3xTz0Xj" # Replace with a real, stable bitly link for testing
    test_bitly_url = "https://bit.ly/2VwLqM8"  # Example, may become inactive
    bypassed_info = net_utils.bypass_bitly_url(test_bitly_url)
    if bypassed_info and "original_url" in bypassed_info:
        test_logger.info(
            f"Bypassed {test_bitly_url} -> {bypassed_info['original_url']}"
        )
    else:
        test_logger.error(
            f"Failed to bypass Bitly URL {test_bitly_url}. Info: {bypassed_info}"
        )

    test_logger.info("\n--- Network Utilities Tests Completed ---")
