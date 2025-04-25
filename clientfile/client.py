import socket
import sys
import time
from PyQt5.QtWidgets import (
    QApplication, QStackedWidget, QWidget
)
from pyqt_signup import navigate

#################### NETWORK SETUP ####################


# Get local IP (you can use 127.0.0.1 for same-machine testing)
local_ip = socket.gethostbyname(socket.gethostname())
peer_port = 9942 # Make sure this is open and not in use

peer_listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
peer_listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
peer_listener.bind(("0.0.0.0", peer_port))
peer_listener.listen(1)  # Start listening
print(f"[INFO] Listening for peer connections on {local_ip}:{peer_port}")

mainserver_address = socket.gethostbyname(socket.gethostname())
mainserver_port = 8000

mainservercom = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
mainservercom.connect((mainserver_address, mainserver_port))

mainservercom.send(f"{local_ip} {peer_port}".encode('utf-8'))
############### START APP ####################

app = QApplication(sys.argv)

# Launch the rest of the app
navigate(mainservercom, app)