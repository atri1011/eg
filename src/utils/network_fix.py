"""
Network connectivity fixes for Vercel deployment.
This module provides IPv4-only network connection fixes to resolve
IPv6 connectivity issues in Vercel's environment.
"""

import socket
import os
from urllib.parse import urlparse, urlunparse


def force_ipv4_connections():
    """
    Apply comprehensive IPv4-only network connection patches.
    Must be called before any network operations.
    """
    # Patch socket.getaddrinfo
    original_getaddrinfo = socket.getaddrinfo
    
    def getaddrinfo_ipv4_only(host, port, family=0, type=0, proto=0, flags=0):
        """Force IPv4-only connections for all network operations."""
        # Always use IPv4 family
        family = socket.AF_INET
        
        try:
            res = original_getaddrinfo(host, port, family, type, proto, flags)
            # Filter to only IPv4 results as safety measure
            ipv4_res = [r for r in res if r[0] == socket.AF_INET]
            if ipv4_res:
                return ipv4_res
        except socket.gaierror:
            pass
        
        # Final fallback
        try:
            return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
        except socket.gaierror as e:
            raise socket.gaierror(8, f"IPv4 connection failed for {host}: {e}")
    
    socket.getaddrinfo = getaddrinfo_ipv4_only
    
    # Patch psycopg2 specifically
    try:
        import psycopg2
        original_connect = psycopg2.connect
        
        def connect_ipv4(*args, **kwargs):
            """Ensure psycopg2 database connections use IPv4."""
            if 'host' in kwargs and kwargs['host']:
                host = kwargs['host']
                try:
                    # Resolve to IPv4 address
                    result = socket.getaddrinfo(host, None, socket.AF_INET)
                    if result:
                        kwargs['host'] = result[0][4][0]
                except Exception:
                    pass  # Use original host if resolution fails
            
            return original_connect(*args, **kwargs)
        
        psycopg2.connect = connect_ipv4
    except ImportError:
        pass  # psycopg2 not installed
    
    # Patch requests library for HTTP connections
    try:
        import requests.adapters
        from urllib3.util.connection import create_connection
        
        original_create_connection = create_connection
        
        def ipv4_create_connection(address, timeout=None, source_address=None, socket_options=None):
            """Force urllib3/requests to use IPv4 connections."""
            host, port = address
            
            # Try to resolve host to IPv4 first
            try:
                result = socket.getaddrinfo(host, port, socket.AF_INET)
                if result:
                    ipv4_address = result[0][4][0]
                    address = (ipv4_address, port)
            except Exception:
                pass  # Use original address if resolution fails
            
            return original_create_connection(address, timeout, source_address, socket_options)
        
        # Apply the patch
        import urllib3.util.connection
        urllib3.util.connection.create_connection = ipv4_create_connection
        
    except ImportError:
        pass  # requests/urllib3 not available yet


def resolve_database_url_to_ipv4(database_url):
    """
    Resolve database URL hostname to IPv4 address.
    
    Args:
        database_url (str): Original database URL
        
    Returns:
        str: Database URL with hostname resolved to IPv4 address
    """
    if not database_url:
        return database_url
    
    try:
        # Handle postgres:// to postgresql:// conversion
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        parsed = urlparse(database_url)
        if parsed.hostname:
            try:
                # Resolve hostname to IPv4
                result = socket.getaddrinfo(parsed.hostname, None, socket.AF_INET)
                if result:
                    ipv4_addr = result[0][4][0]
                    # Replace hostname with IPv4 address
                    netloc = parsed.netloc.replace(parsed.hostname, ipv4_addr)
                    parsed = parsed._replace(netloc=netloc)
                    resolved_url = urlunparse(parsed)
                    print(f"[INFO] Database URL resolved: {parsed.hostname} -> {ipv4_addr}")
                    return resolved_url
            except Exception as e:
                print(f"[WARN] Could not resolve database hostname '{parsed.hostname}' to IPv4: {e}")
    except Exception as e:
        print(f"[ERROR] Error processing database URL: {e}")
    
    return database_url


def apply_network_fixes():
    """Apply all network connectivity fixes."""
    print("[INFO] Applying IPv4-only network connectivity fixes...")
    force_ipv4_connections()
    print("[INFO] Network fixes applied successfully")