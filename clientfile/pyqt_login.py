import sys
import subprocess
import socket
from PyQt5.QtWidgets import QApplication, QDesktopWidget,QHBoxLayout,QFormLayout,QLabel,QPushButton,QLineEdit,QVBoxLayout,QWidget , QMessageBox, QSizePolicy
from PyQt5.QtCore import Qt
import PyQt5.QtGui as qtg
from PyQt5.QtGui import QPixmap,QPalette,QBrush,QFont
# from Garage_pyqt import create_garage_page

def denial_translation(s):
    if s=="missing_info":
        return "Missing Information Required"
    if s =="wrong_creds":
        return "Wrong Credentials"
def create_login_page(mainservercom,app):

    windownew = QWidget()
    windownew.setWindowTitle("Login Page")
    windownew = QWidget()
    pixmap = QPixmap("./images/bbackground1.png")
    windownew.setWindowTitle("Log-in Page")

    center_point = QDesktopWidget().availableGeometry().center()
    n=1.2
    image_size = (1024//n,1024//n)
    print(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]//2), int(image_size[1]//2))
    windownew.setGeometry(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]), int(image_size[1]))  # Default size
    
    palette = QPalette()
    palette.setBrush(QPalette.Window, QBrush(pixmap))
    windownew.setAutoFillBackground(True)
    windownew.setPalette(palette)

    def resize_background(event):
        scaled_pixmap = pixmap.scaled(windownew.size(), Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
        palette.setBrush(QPalette.Window, QBrush(scaled_pixmap))
        windownew.setPalette(palette)
        # Call font size update function when window is resized
        update_font_sizes()

    # Connect the resize event
    windownew.resizeEvent = resize_background

    Username = QLineEdit()
    Username.setPlaceholderText("Enter your email:")
    Username.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Username.setMinimumWidth(200)  # Minimum width instead of fixed
    
    Usernamestring = QLabel("Email:")
    Usernamestring.setStyleSheet("color: white;")
    Usernamestring.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
    
    Loging = QPushButton("Login")
    Loging.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Loging.setMinimumWidth(200)  # Minimum width instead of fixed
        
    SignUp = QPushButton("New ? Sign up !")
    SignUp.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    SignUp.setMinimumWidth(200)  # Minimum width instead of fixed

    Pass = QLineEdit()
    Pass.setPlaceholderText("Enter your password")
    Pass.setEchoMode(QLineEdit.Password)
    Pass.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Pass.setMinimumWidth(200)  # Minimum width instead of fixed
    
    Passstring = QLabel("Password:")
    Passstring.setStyleSheet("color:white;")
    Passstring.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)

    # Minimum height instead of fixed height
    Username.setMinimumHeight(40)
    Usernamestring.setMinimumHeight(40)
    Pass.setMinimumHeight(40)
    Passstring.setMinimumHeight(40)
    Loging.setMinimumHeight(40)
    SignUp.setMinimumHeight(40)
    
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
    for i in [Username,Usernamestring,Pass,Passstring,Loging,SignUp]:
        i.setStyleSheet(style)
    # Function to update font sizes based on window width
    def update_font_sizes():
        window_width = windownew.width()
        # Scale title font size based on window width
        title_size = max(20, min(65, int(window_width / 12)))
        
        # Scale label and input font sizes
        input_size = max(8, min(14, int(window_width / 60)))
        label_size = max(8, min(16, int(window_width / 55)))
        button_size = max(10, min(16, int(window_width / 50)))
        
        # Update label fonts
        for label in [Usernamestring, Passstring]:
            font = label.font()
            font.setPointSize(label_size)
            label.setFont(font)
            
        # Update input field fonts
        for field in [Username, Pass]:
            font = field.font()
            font.setPointSize(input_size)
            field.setFont(font)
            
        # Update button font
        font = Loging.font()
        font.setPointSize(button_size)
        Loging.setFont(font)

        font = SignUp.font()
        font.setPointSize(button_size)
        SignUp.setFont(font)
        
        
        # Adjust field widths based on window size
        field_width = min(500, max(200, int(window_width * 0.4)))
        button_width = min(300, max(200, int(window_width * 0.25)))
        
        # Set minimum widths
        Username.setMinimumWidth(field_width)
        Pass.setMinimumWidth(field_width)
        Loging.setMinimumWidth(button_width)
        SignUp.setMinimumWidth(button_width)
    
    def Log_In():#to log_in and send the credentials to the server
        email = Username.text().strip()  #getting the email from the input
        password = Pass.text().strip()   #getting the password from the input
        mainservercom.send("log_in".encode('utf-8'))
        credentials =email+" "+password
        mainservercom.send(credentials.encode('utf-8'))
        response = mainservercom.recv(1024).decode('utf-8')
        response = response.split()
        if response[1] =="log_in_denied":
            Warning = denial_translation(response[2])
            QMessageBox.warning(windownew, "Log in Failed", Warning, QMessageBox.Ok)
        if response[1] =="log_in_successful":
            from pyqt_mainmenu import create_mainmenu_page
            create_mainmenu_page(windownew,mainservercom,app,email)
    def Sign_Up():        
        from pyqt_signup import navigate
        windownew.close()
        navigate( mainservercom, app)
    

    
    # Create a container for the form with responsive layout
    flayout = QFormLayout()
    flayout.setSpacing(10)
    flayout.addRow(Usernamestring, Username)
    flayout.addRow(Passstring, Pass)
    
    # Create a container widget for the form
    form_container = QWidget()
    form_container.setLayout(flayout)
    form_container.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)

    form_layout = QVBoxLayout()
    form_layout.setSpacing(10)
    form_layout.addStretch(1)
    form_layout.addWidget(form_container)
    form_layout.addWidget(Loging, alignment=Qt.AlignCenter)
    form_layout.addWidget(SignUp, alignment=Qt.AlignCenter)
    form_layout.addStretch(1)

    Final_layout = QHBoxLayout()
    Final_layout.addStretch(1)
    Final_layout.addLayout(form_layout)
    Final_layout.addStretch(1)
    
    windownew.setLayout(Final_layout)
    # window.setGeometry(100, 100, 800, 600)  # Initial window size
    Loging.clicked.connect(Log_In)
    SignUp.clicked.connect(Sign_Up)
    
    # Apply initial font sizes
    update_font_sizes()
    
    windownew.show()
    
    return windownew