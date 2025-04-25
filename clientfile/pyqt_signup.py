import sys
from PyQt5.QtWidgets import  QStackedWidget , QApplication,QDesktopWidget, QHBoxLayout,QFormLayout,QLabel,QPushButton,QLineEdit,QVBoxLayout,QWidget,QComboBox,QMessageBox, QSizePolicy
from PyQt5.QtCore import Qt ,QDate
import PyQt5.QtGui as qtg
import time
from PyQt5.QtGui import QPixmap,QPalette,QBrush,QFont
from PyQt5.QtWidgets import QLabel, QGraphicsDropShadowEffect
from PyQt5.QtGui import QPainter, QLinearGradient, QBrush, QColor
from PyQt5.QtCore import Qt, QPropertyAnimation, QRect

def denial_translation(s):
    if s== "regex":
        return "Email is not valid"
    if s =="duplicate_email":
        return "An account already exists with this email"
    if s =="diffrent_passwords":
        return "different passwords"
    if s=="missing_info":
        return "Empty info needed "
def navigate(mainservercom,app):
    
    window = QWidget()
    stacked_widget = QStackedWidget()
    window.setWindowTitle("Sign-up Page")
    
    center_point = QDesktopWidget().availableGeometry().center()
    n=1.2
    image_size = (1024//n,1024//n)
    print(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]//2), int(image_size[1]//2))
    window.setGeometry(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]), int(image_size[1]))  # Default size
    
    pixmap = QPixmap("./images/background1.png")
    palette = QPalette()
    palette.setBrush(QPalette.Window, QBrush(pixmap))
    window.setAutoFillBackground(True)
    window.setPalette(palette)
    
    def resize_background(event):
        scaled_pixmap = pixmap.scaled(window.size(), Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
        palette.setBrush(QPalette.Window, QBrush(scaled_pixmap))
        window.setPalette(palette)
        # Call the font size update function when window is resized
        update_font_sizes()
    
    window.resizeEvent = resize_background
    
    # Create the title with responsive font
    Game_label = QLabel("Fiberace")
    Game_label.setFont(qtg.QFont("Arial", 50))
    Game_label.setAlignment(Qt.AlignCenter)
    Game_label.setStyleSheet("color:black")
    Game_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
    

    Game_label.setStyleSheet("""
    QLabel {
        color: qlineargradient(
            spread:pad,
            x1:0, y1:0,
            x2:1, y2:0,
            stop:0 rgba(136,74,67,1),
            stop:1 rgba(136,74,67,1)
        );
        font-size: 100px;
        font-style: italic;
        font-weight: bold , italic;
        font-family: 'Orbitron', 'Segoe UI', sans-serif;
        letter-spacing: 3px;
        padding: 20px;
        border: none;
        background: transparent;
        text-align: center;
    }
    """)

    # Function to update font sizes based on window width
    def update_font_sizes():
        window_width = window.width()
        # Scale title font size based on window width
        title_size = max(20, min(60, int(window_width / 14)))
        Game_label.setFont(qtg.QFont("Arial", title_size))
        
        # Scale label and input font sizes
        input_size = max(8, min(14, int(window_width / 60)))
        label_size = max(8, min(16, int(window_width / 55)))
        
        # Update label fonts
        for label in [usernamelabel, namelabel, Passlabel, Pass2label, Clabel]:
            font = label.font()
            font.setPointSize(label_size)
            label.setFont(font)
            
        # Update input field fonts
        for field in [Pass, Pass2, Useremail, Name]:
            font = field.font()
            font.setPointSize(input_size)
            field.setFont(font)
            
        # Update combo box font
        combo_font = my_box.font()
        combo_font.setPointSize(input_size)
        my_box.setFont(combo_font)
        
        # Update button fonts
        button_font_size = max(10, min(16, int(window_width / 55)))
        for button in [Signupbutton, HaveAnAccountbutton]:
            font = button.font()
            font.setPointSize(button_font_size)
            button.setFont(font)
    
        # Create form inputs with responsive sizing
    Pass = QLineEdit()
    Pass.setEchoMode(QLineEdit.Password)
    Pass.setPlaceholderText("Enter your password")
    Pass.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Pass.setMinimumWidth(200)  # Reduced minimum width to allow for smaller windows
    
    Pass2 = QLineEdit()
    Pass2.setEchoMode(QLineEdit.Password)
    Pass2.setPlaceholderText("Check your password")
    Pass2.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Pass2.setMinimumWidth(200)
    
    Useremail = QLineEdit()
    Useremail.setPlaceholderText("Enter your email")
    Useremail.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Useremail.setMinimumWidth(200)
    
    Name = QLineEdit()
    Name.setPlaceholderText("Enter your a name with no spaces")
    Name.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Name.setMinimumWidth(200)
    
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



    Signupbutton = QPushButton("Sign up")
    Signupbutton.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Signupbutton.setMinimumWidth(200)
    
    HaveAnAccountbutton = QPushButton("Already have an account ? Log in")
    HaveAnAccountbutton.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    HaveAnAccountbutton.setMinimumWidth(200)
    
    Signupbutton.setStyleSheet(style)
    HaveAnAccountbutton.setStyleSheet(style)
    
    my_box = QComboBox()
    my_box.addItems(["Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Bolivia", "Brazil", "Bulgaria", "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Greece", "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Japan", "Jordan", "Kenya", "Kuwait", "Lebanon", "Libya", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Palestine", "Peru", "Philippines", "Poland"])
    my_box.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    my_box.setMinimumWidth(200)
    
    usernamelabel = QLabel("Email:")
    usernamelabel.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
    
    namelabel = QLabel("Name:")
    namelabel.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
    
    Passlabel = QLabel("Password:")
    Passlabel.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
    
    Pass2label = QLabel("Check-Password:")
    Pass2label.setStyleSheet("color: black;")
    Pass2label.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
    
    Clabel = QLabel("Select your country:")
    Clabel.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
    
    for i in [Pass2label,Passlabel,Clabel,namelabel,usernamelabel]:
        i.setStyleSheet(style)
    for j in [Pass,Pass2,Useremail,Name,my_box]:
        j.setStyleSheet(style)
    # Create a form layout with responsive spacing
    form_layout = QFormLayout()
    form_layout.setSpacing(15)
    form_layout.setContentsMargins(20, 20, 20, 20)
    form_layout.addRow(usernamelabel, Useremail)
    form_layout.addRow(namelabel, Name)
    form_layout.addRow(Passlabel, Pass)
    form_layout.addRow(Pass2label, Pass2)
    form_layout.addRow(Clabel, my_box)
    form_layout.addRow(Signupbutton)
    form_layout.addRow(HaveAnAccountbutton)
    
    # Create a container for the form with responsive margins
    form_container = QWidget()
    form_container.setLayout(form_layout)
    form_container.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
    
    # Create vertical layout with responsive spacing
    form2_layout = QVBoxLayout()
    form2_layout.setSpacing(30)
    form2_layout.addStretch(1)
    form2_layout.addWidget(Game_label)
    form2_layout.addStretch(1)
    form2_layout.addWidget(form_container)
    form2_layout.addStretch(2)
    
    # Create horizontal layout with responsive margins
    Final_layout = QHBoxLayout()
    Final_layout.addStretch(1)
    Final_layout.addLayout(form2_layout)
    Final_layout.addStretch(1)
    
    def sign_up():#signing_up and sending to main server
        email_text = Useremail.text().strip()
        pass_text = Pass.text().strip()
        pass2_text = Pass2.text().strip()
        country_text = my_box.currentText()
        name_text = Name.text().strip()
        current_date = QDate.currentDate().toString("yyyy-MM-dd")

# Send signup request to the server
        mainservercom.send("sign_up".encode('utf-8'))
        data = email_text + " " + pass_text + " " + pass2_text + " " + name_text + " " + country_text + " " + current_date
        mainservercom.send(data.encode('utf-8'))
        
        # Wait for server response
        response = mainservercom.recv(1024).decode('utf-8').strip()
        response_parts = response.split()
        print(response_parts)
        if response_parts[1] == 'signup_denied':
            Warning = denial_translation(response_parts[2])
            QMessageBox.warning(window, "SignUp Failed", Warning, QMessageBox.Ok)
        elif response_parts[1] == 'verification_sent':
            QMessageBox.information(window, "Account Created", "A verification code has been sent to your email. Please verify your account.", QMessageBox.Ok)
            from pyqt_verification import create_verification_page
            create_verification_page(window, mainservercom, app, email_text)
        else:
            QMessageBox.warning(window, "SignUp Failed", "An unexpected error occurred. Please try again.", QMessageBox.Ok)
    
    def log_in():
        from pyqt_login import create_login_page 
        window.close()
        create_login_page(mainservercom,app)
    
    Signupbutton.clicked.connect(sign_up)
    HaveAnAccountbutton.clicked.connect(log_in)
    
    window.setLayout(Final_layout)
    
    # Apply initial font sizes
    update_font_sizes()
    
    
    window.show()
    app.exec_()
    return window

