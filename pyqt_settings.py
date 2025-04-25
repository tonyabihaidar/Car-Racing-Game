import sys
from PyQt5.QtWidgets import QDesktopWidget, QComboBox  , QListWidget, QListWidgetItem,  QMessageBox, QApplication, QHBoxLayout, QFormLayout, QLabel, QPushButton, QLineEdit, QVBoxLayout, QWidget, QSizePolicy, QGroupBox
from PyQt5.QtCore import Qt , QRect
import PyQt5.QtGui as qtg
from PyQt5.QtGui import QPixmap, QPalette, QBrush, QFont

def create_settings_page(window,mainservercom,app,username,prev_geometry=None):
    
    window.close()
    windownew = QWidget()
    pixmap = QPixmap("./images/bbackground1.png")
    windownew.setWindowTitle("Main Menu Page")
    
    center_point = QDesktopWidget().availableGeometry().center()
    n=1.2
    image_size = (1024//n,1024//n)
    print(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]//2), int(image_size[1]//2))
    window.setGeometry(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]), int(image_size[1]))  # Default size
    
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
    
    def changename():
        from pyqt_name import create_changename_page
        create_changename_page(windownew, mainservercom, app, username)
    def resetstats():
        reply = QMessageBox.question(windownew,"Confirm choice","Are you sure you want to reset your statistics ?!", QMessageBox.Yes | QMessageBox.No)
        if reply == QMessageBox.Yes:
            m = "reset" 
            mainservercom.send(m.encode("utf-8"))
            mainservercom.send(username.encode("utf-8"))
            QMessageBox.warning(window, "Reset successful ! ", "You have successfully reset your statistics!", QMessageBox.Ok)

    def deleteacc():
        from pyqt_deleteacc import create_deleteacc_page
        create_deleteacc_page(windownew, mainservercom, app, username)
        
    def back_to_menu():
        from pyqt_mainmenu import create_mainmenu_page
        create_mainmenu_page(windownew,mainservercom,app,username)
    
    resetstats_button = QPushButton("Reset my statistics")
    resetstats_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    resetstats_button.setMinimumWidth(200)
    
    deleteacc_button = QPushButton("Delete my account ")
    deleteacc_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    deleteacc_button.setMinimumWidth(200)
    
    changename_button = QPushButton("Change name")
    changename_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    changename_button.setMinimumWidth(200)

    back_to_menu_button = QPushButton("Back to menu ")
    back_to_menu_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    back_to_menu_button.setMinimumWidth(200)
    # Function to update font sizes based on window width
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
    for i in [changename_button,resetstats_button,deleteacc_button,back_to_menu_button]:
        i.setStyleSheet(style)
    def update_font_sizes():
        window_width = windownew.width() 
        # Scale button font sizes
        button_size = max(10, min(16, int(window_width / 50)))
        
        # Update button fonts
        for button in [resetstats_button,deleteacc_button,changename_button,back_to_menu_button]: #friends_button,search_button,
            font = button.font()
            font.setPointSize(button_size)
            button.setFont(font)
        
        # Adjust button widths based on window size
        button_width = min(600, max(200, int(window_width * 0.6)))
        
        # Set minimum widths
        for button in [resetstats_button,deleteacc_button,changename_button,back_to_menu_button]:  #friends_button,search_button,
            button.setMinimumWidth(button_width)
    
    # Set minimum heights for buttons
    for button in [resetstats_button,deleteacc_button,changename_button,back_to_menu_button]:  #friends_button,search_button,
        button.setMinimumHeight(50)
    
    # Create button container with responsive layout
    form_layout = QFormLayout()    

    form_layout.addRow(changename_button)
    form_layout.addRow(resetstats_button)
    form_layout.addRow(deleteacc_button)
    form_layout.addRow(back_to_menu_button)
    
    # Create a container widget for the buttons
    button_container = QWidget()
    button_container.setLayout(form_layout)
    button_container.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
    
    Final_layout = QVBoxLayout()
    Final_layout.addStretch(1)
    Final_layout.addWidget(button_container)
    Final_layout.addStretch(1)

    changename_button.clicked.connect(changename)
    resetstats_button.clicked.connect(resetstats)
    deleteacc_button.clicked.connect(deleteacc)
    back_to_menu_button.clicked.connect(back_to_menu)
    
    windownew.setLayout(Final_layout)
    windownew.setGeometry(prev_geometry if prev_geometry else QRect(100, 100, 800, 600))  # Initial window size or previous geometry
    
    # Apply initial font sizes
    update_font_sizes()

    windownew.show()
    
    return windownew