import socket

# Preserve the original getaddrinfo function
original_getaddrinfo = socket.getaddrinfo

def getaddrinfo_ipv4_only(host, port, family=0, type=0, proto=0, flags=0):
    """
    A modified version of getaddrinfo that filters out IPv6 addresses.
    This forces the connection to use IPv4.
    """
    # Request both IPv4 and IPv6, but we will filter later
    res = original_getaddrinfo(host, port, socket.AF_UNSPEC, type, proto, flags)
    
    # Filter for IPv4 addresses only
    ipv4_res = [r for r in res if r[0] == socket.AF_INET]
    
    if not ipv4_res:
        raise socket.gaierror(8, f"getaddrinfo failed for {host}: No IPv4 address found")
        
    return ipv4_res

# Monkey-patch the socket.getaddrinfo function
socket.getaddrinfo = getaddrinfo_ipv4_only

# Now, import the Flask app. Any subsequent network calls will use the patched function.
from main import app