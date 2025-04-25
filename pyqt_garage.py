import sys
from PyQt5.QtWidgets import QDesktopWidget, QMessageBox, QApplication,QFormLayout,QLabel,QPushButton,QLineEdit,QVBoxLayout,QWidget,QSpinBox,QHBoxLayout,QSizePolicy,QStackedWidget
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPixmap,QPalette,QBrush,QFont
import PyQt5.QtGui as qtg

# for every page, a function has to be closed, a window closed and a window opened, passing on mainsever communication socket, app , and email (username)

def create_garage_page(window, mainservercom, app, username, prev_geometry=None):
    window.close()
    window = QWidget()
    window.setWindowTitle("Garage")
    
    center_point = QDesktopWidget().availableGeometry().center()
    n=1.2
    image_size = (1024//n,1024//n)
    print(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]//2), int(image_size[1]//2))
    window.setGeometry(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]), int(image_size[1]))  # Default size
    
    palette = QPalette()
    palette.setBrush(QPalette.Window, QBrush(QPixmap("bbackground1.png")))
    window.setPalette(palette)
    pixmap = QPixmap("./images/bbackground1.png")
    palette2 = QPalette()
    palette2.setBrush(QPalette.Window, QBrush(pixmap))
    window.setAutoFillBackground(True)
    window.setPalette(palette2)
    
    def resize_background(event):
        scaled_pixmap = pixmap.scaled(window.size(), Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
        palette2.setBrush(QPalette.Window, QBrush(scaled_pixmap))
        window.setPalette(palette2)
        # Call font size update function when window is resized
        update_font_sizes()
        # Update image size when window is resized
        update_image_size()
        
    window.resizeEvent = resize_background
    
    # Add title label
    title_label = QLabel("Garage - Choose Your Car")
    title_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
    
    images=["./images/car(1).png","./images/car(2).png","./images/car(3).png","./images/car(4).png","./images/car(5).png","./images/car(6).png","./images/car(7).png","./images/car(8).png","./images/car(9).png","./images/car(11).png","./images/car(12).png","./images/car(13).png","./images/car(14).png","./images/car(15).png","./images/car(16).png","./images/car(17).png","./images/car(18).png"]
    index=[0]
    image_label=QLabel()
    image_label.setAlignment(Qt.AlignCenter)
    image_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
    
    # Function to update image size based on window size
    def update_image_size():
        window_width = window.width()
        window_height = window.height()
        # Scale image proportionally to window size
        image_size = min(int(window_width * 0.4), int(window_height * 0.5))
        if index[0] < len(images):
            pixmap = QPixmap(images[index[0]])
            if not pixmap.isNull():
                image_label.setPixmap(pixmap.scaled(image_size, image_size, Qt.KeepAspectRatio))
    
    def switch_image():
        pixmap=QPixmap(images[index[0]])
        if pixmap.isNull():
            print(f"Failed to load image: {images[index[0]]}")
        else:
            # Use the current window size to determine image size
            window_width = window.width()
            window_height = window.height()
            image_size = min(int(window_width * 0.4), int(window_height * 0.5))
            image_label.setPixmap(pixmap.scaled(image_size, image_size, Qt.KeepAspectRatio))
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

    left_button=QPushButton("Previous")
    left_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    left_button.setMinimumHeight(40)
    
    right_button=QPushButton("Next")
    right_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    right_button.setMinimumHeight(40)

    def switch_left():
        if index[0]>0:
            index[0]-=1
            switch_image()

    def switch_right():
        if index[0]<len(images)-1:
            index[0]+=1
            switch_image()

    left_button.clicked.connect(switch_left)
    right_button.clicked.connect(switch_right)

    Players_button=QPushButton("Look for opponent")
    Players_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Players_button.setMinimumWidth(200)
    Players_button.setMinimumHeight(50)
    
    Back_button=QPushButton(" Back to Menu")
    Back_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Back_button.setMinimumWidth(200)
    Back_button.setMinimumHeight(50)
    
    # Function to update font sizes based on window width
    def update_font_sizes():
        window_width = window.width()
        # Scale title font size based on window width
        title_size = max(20, min(42, int(window_width / 20)))
        title_label.setFont(QFont("Arial", title_size, QFont.Bold))
        
        # Scale button font sizes
        nav_button_size = max(12, min(24, int(window_width / 40)))  # Arrow buttons
        button_size = max(10, min(16, int(window_width / 50)))  # Regular buttons
        
        # Update button fonts
        left_button.setFont(QFont("Arial", nav_button_size))
        right_button.setFont(QFont("Arial", nav_button_size))
        Players_button.setFont(QFont("Arial", button_size))
        Back_button.setFont(QFont("Arial", button_size))
        
        # Adjust button widths based on window size
        nav_button_width = min(150, max(80, int(window_width * 0.1)))
        button_width = min(600, max(200, int(window_width * 0.6)))
        
        # Set minimum widths
        left_button.setMinimumWidth(nav_button_width)
        right_button.setMinimumWidth(nav_button_width)
        Players_button.setMinimumWidth(button_width)
        Back_button.setMinimumWidth(button_width)
        
    def back_to_menu():
        from pyqt_mainmenu import create_mainmenu_page
        create_mainmenu_page(window, mainservercom, app, username)
    selected_car = None
    def players(): # play is the transition key 
        from pyqt_players import create_online_players_page
        nonlocal selected_car
        selected_car = images[index[0]]  # Store the chosen car's image filename
        mainservercom.send(("Carchoice"+" "+selected_car).encode('utf-8'))
        online_page = create_online_players_page(window, mainservercom, app, username, prev_geometry )
        return
    
    for i in [right_button,left_button,Back_button,Players_button]:
        i.setStyleSheet(style)
    form_layout=QFormLayout()    
    form_layout.addRow(Players_button)
    
    horizlayout=QHBoxLayout()
    horizlayout.addStretch(1)
    horizlayout.addWidget(left_button)
    horizlayout.addStretch(1)
    horizlayout.addWidget(right_button)
    horizlayout.addStretch(1)
    
    form2_layout = QFormLayout()
    form2_layout.addRow(Back_button)
    
    verticalayout=QVBoxLayout()
    verticalayout.addWidget(title_label)
    verticalayout.addStretch(1)
    verticalayout.addWidget(image_label)
    verticalayout.addStretch(1)
    verticalayout.addLayout(horizlayout)
    verticalayout.addStretch(1)
    verticalayout.addLayout(form_layout)
    verticalayout.addLayout(form2_layout)
    verticalayout.addStretch(1)
    
    Players_button.clicked.connect(players)
    Back_button.clicked.connect(back_to_menu)
    window.setLayout(verticalayout)
    
    # Initialize with proper sizes
    update_font_sizes()
    switch_image()
    
    window.show()
    return window
#window = create_garage_page(stacked_widget)
#stacked_widget.addWidget(window)

#window.show()
#sys.exit(app.exec_())
#sys.exit(app.exec_())