import sys
from PyQt5.QtWidgets import QDesktopWidget, QApplication, QHBoxLayout, QFormLayout, QLabel, QPushButton, QLineEdit, QVBoxLayout, QWidget, QMessageBox, QSizePolicy
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPixmap, QPalette, QBrush, QFont

# names are not meaningful here 
def create_changename_page(window, mainservercom, app, email):

    window.close()
    window = QWidget()
    pixmap = QPixmap("./images/bbackground1.png")
    window.setWindowTitle("Change Name")
    
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
    def back_to_menu():
        from pyqt_mainmenu import create_mainmenu_page
        create_mainmenu_page(window,mainservercom,app,email)
    # Create main verification message
    message_label = QLabel("Your new name")
    message_label.setAlignment(Qt.AlignCenter)
    message_label.setFont(QFont("Arial", 16))
    message_label.setStyleSheet("color: white;")
    message_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)

    # Create code input
    code_input = QLineEdit()
    code_input.setPlaceholderText("Type it here, with no spaces")
    code_input.setMaxLength(30)
    code_input.setFont(QFont("Arial", 16))
    code_input.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    code_input.setMinimumWidth(600)
    code_input.setMinimumHeight(50)

    # Create verify button
    verify_button = QPushButton("Change Name")
    verify_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    verify_button.setMinimumWidth(200)
    verify_button.setMinimumHeight(40)
    
    back_to_menu_button = QPushButton("Back to menu ")
    back_to_menu_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    back_to_menu_button.setMinimumWidth(200)

    def update_font_sizes():
        
        button_width = 500
        verify_button.setMinimumWidth(button_width)

    def change_name():
        entered_name = code_input.text().strip()   +"***"+ email  
        mainservercom.send("name".encode("utf-8"))
        mainservercom.send(entered_name.encode("utf-8"))
        QMessageBox.warning(window, "Name change successful ! ", f"You have successfully changed you name to{code_input.text().strip()}", QMessageBox.Ok)

    verify_button.clicked.connect(change_name)
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
    for i in [message_label,code_input,verify_button,back_to_menu_button]:
        i.setStyleSheet(style)
    # Layout setup
    layout = QVBoxLayout()
    layout.addStretch(1)
    layout.addWidget(message_label)
    layout.addSpacing(20)
    layout.addWidget(code_input, alignment=Qt.AlignCenter)
    layout.addSpacing(20)
    layout.addWidget(verify_button, alignment=Qt.AlignCenter)
    layout.addStretch(2)
    layout.addWidget(back_to_menu_button)

    back_to_menu_button.clicked.connect(back_to_menu)

    window.setLayout(layout)
    update_font_sizes()
    window.show()
    return window
