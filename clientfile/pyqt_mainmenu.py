import sys
import socket
from PyQt5.QtWidgets import QDesktopWidget, QMessageBox ,QApplication,QHBoxLayout,QFormLayout,QLabel,QPushButton,QLineEdit,QVBoxLayout,QWidget,QSizePolicy
from PyQt5.QtCore import Qt, QRect
import PyQt5.QtGui as qtg
from PyQt5.QtGui import QPixmap,QPalette,QBrush,QFont

def create_mainmenu_page(window, mainservercom, app, username):

    
    window.close()
    windownew = QWidget()
    pixmap = QPixmap("./images/bbackground1.png")
    windownew.setWindowTitle("Main Menu Page")
    
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

    # Add a title for the main menu
    title_label = QLabel("Neon Rush Main Menu")
    title_label.setFont(qtg.QFont("Arial", 32, QFont.Bold))    
    title_label.setAlignment(Qt.AlignCenter)
    title_label.setStyleSheet("color: black;")
    title_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
    def garage():
        from pyqt_garage import create_garage_page 
        create_garage_page(windownew, mainservercom, app, username, windownew.geometry())
        return
    
    def statistical():
        from pyqt_statistics import create_statistics_page 
        create_statistics_page(windownew, mainservercom, app, username, windownew.geometry())
        return
    
    def leadership():
        from pyqt_leaderboard import create_leaderboard_page 
        create_leaderboard_page(windownew, mainservercom, app, username, windownew.geometry())
        return
    
    def settings():
        from pyqt_settings import create_settings_page 
        create_settings_page(windownew, mainservercom, app, username, windownew.geometry())
        return
    
    Garage_button = QPushButton("Garage")
    Garage_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Garage_button.setMinimumWidth(200)
    
    Leadership_button = QPushButton("Leadership Board")
    Leadership_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Leadership_button.setMinimumWidth(200)
    
    Statistics_button = QPushButton("View My statistics")
    Statistics_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Statistics_button.setMinimumWidth(200)
    
    Settings_button = QPushButton("Settings")
    Settings_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Settings_button.setMinimumWidth(200)
    
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
    for i in [Settings_button,Garage_button,Statistics_button,Leadership_button]:
        i.setStyleSheet(style)
    # Function to update font sizes based on window width
    def update_font_sizes():
        window_width = windownew.width() 
        # Scale button font sizes
        button_size = max(10, min(16, int(window_width / 50)))
        
        # Update button fonts
        for button in [Garage_button, Leadership_button, Statistics_button, Settings_button]:
            font = button.font()
            font.setPointSize(button_size)
            button.setFont(font)
        
        # Adjust button widths based on window size
        button_width = min(600, max(200, int(window_width * 0.6)))
        
        # Set minimum widths
        for button in [Garage_button, Leadership_button, Statistics_button,Settings_button]:
            button.setMinimumWidth(button_width)
    
    # Set minimum heights for buttons
    for button in [Garage_button, Leadership_button, Statistics_button,Settings_button]:
        button.setMinimumHeight(50)
    
    # Create button container with responsive layout
    form_layout = QFormLayout()    
    form_layout.addRow(Garage_button)
    form_layout.addRow(Leadership_button)
    form_layout.addRow(Statistics_button)
    form_layout.addRow(Settings_button)
    
    # Create a container widget for the buttons
    button_container = QWidget()
    button_container.setLayout(form_layout)
    button_container.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
    
    Final_layout = QVBoxLayout()
    Final_layout.addStretch(1)
    Final_layout.addWidget(button_container)
    Final_layout.addStretch(1)

    Garage_button.clicked.connect(garage)
    Leadership_button.clicked.connect(leadership)
    Statistics_button.clicked.connect(statistical)
    Settings_button.clicked.connect(settings)
    
    windownew.setLayout(Final_layout)
    # windownew.setGeometry(prev_geometry if prev_geometry else QRect(100, 100, 800, 600))  # Initial window size or previous geometry
    
    # Apply initial font sizes
    update_font_sizes()
    
    windownew.show()
    
    return windownew