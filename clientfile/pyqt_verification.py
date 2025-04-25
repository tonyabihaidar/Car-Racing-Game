import sys
from PyQt5.QtWidgets import QDesktopWidget, QApplication, QHBoxLayout, QFormLayout, QLabel, QPushButton, QLineEdit, QVBoxLayout, QWidget, QMessageBox, QSizePolicy
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPixmap, QPalette, QBrush, QFont

def create_verification_page(window, mainservercom, app, email):
    window.close()
    window = QWidget()
    pixmap = QPixmap("./images/bbackground1.png")
    window.setWindowTitle("Email Verification")

    center_point = QDesktopWidget().availableGeometry().center()
    n=1.2
    image_size = (1024//n,1024//n)
    window.setGeometry(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]), int(image_size[1]))  # Default size
    
    palette = QPalette()
    palette.setBrush(QPalette.Window, QBrush(pixmap))
    window.setAutoFillBackground(True)
    window.setPalette(palette)

    def resize_background(event):
        scaled_pixmap = pixmap.scaled(window.size(), Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
        palette.setBrush(QPalette.Window, QBrush(scaled_pixmap))
        window.setPalette(palette)
        update_font_sizes()
        
    window.resizeEvent = resize_background

    # Create main verification message
    message_label = QLabel(f"A verification code has been sent to\n{email}")
    message_label.setAlignment(Qt.AlignCenter)
    message_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)

    # Create code input
    code_input = QLineEdit()
    code_input.setPlaceholderText("Enter 6-digit code")
    code_input.setMaxLength(6)
    code_input.setAlignment(Qt.AlignCenter)
    code_input.setMinimumWidth(200)
    code_input.setMinimumHeight(50)

    # Create verify button
    verify_button = QPushButton("Verify")
    verify_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    verify_button.setMinimumWidth(200)
    verify_button.setMinimumHeight(40)

    style = """
    QLineEdit , QComboBox {
        background-color:  rgba(252,249,210,0.6);
        color: color;
        border: 2px solid black;
        border-radius: 10px;
        padding: 10px 15px;
        font-size: 18px;
        font-family: 'Segoe UI', 'Arial', sans-serif;
        selection-background-color: #00c6ff;
    }

    QLineEdit:focus {
        border: 2px solid black ;
        background-color: rgba(252,249,210,0.6);
    }
    QLabel{
        background-color: rgba(252,249,210,0.66);  
        color: black;
        border: 2px solid black;
        padding: 8px;
        border-radius: 8px;
        
    }
    QPushButton {
        background-color: rgba(113,143,151,255);  
        color: black;
        border: 2px solid black;
        padding: 8px;
        border-radius: 8px;
    }
    QPushButton:hover {
        background-color: rgba(113,143,151,0.7);  
    }
    """
    for i in [message_label,verify_button,code_input]:
        i.setStyleSheet(style)
    def update_font_sizes():
        window_width = window.width()
        message_size = max(14, min(24, int(window_width / 40)))
        button_size = max(10, min(16, int(window_width / 50)))
        
        message_label.setFont(QFont("Arial", message_size))
        verify_button.setFont(QFont("Arial", button_size))
        
        button_width = min(400, max(200, int(window_width * 0.3)))
        verify_button.setMinimumWidth(button_width)

    def verify_code():
        entered_code = code_input.text().strip()
        
        mainservercom.send("verify_code".encode('utf-8'))
        verification_data = f"{email} {entered_code}"
        
        mainservercom.send(verification_data.encode('utf-8'))
        response = mainservercom.recv(1024).decode('utf-8')
        
        if response == 'verify_success':
            QMessageBox.information(window, "Success", 
                                  "Your account has been created successfully!", 
                                  QMessageBox.Ok)
            window.close()
            from pyqt_login import create_login_page
            create_login_page(mainservercom, app)
        else:
            QMessageBox.warning(window, "Verification Failed", 
                              "Invalid verification code. Please try again.", 
                              QMessageBox.Ok)

    verify_button.clicked.connect(verify_code)

    # Layout setup
    layout = QVBoxLayout()
    layout.addStretch(1)
    layout.addWidget(message_label)
    layout.addSpacing(20)
    layout.addWidget(code_input, alignment=Qt.AlignCenter)
    layout.addSpacing(20)
    layout.addWidget(verify_button, alignment=Qt.AlignCenter)
    layout.addStretch(2)

    window.setLayout(layout)
    update_font_sizes()
    window.show()
    return window
