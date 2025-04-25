import sys
from PyQt5.QtWidgets import QDesktopWidget, QMessageBox, QApplication, QHBoxLayout, QFormLayout, QLabel, QPushButton, QLineEdit, QVBoxLayout, QWidget, QSizePolicy, QGroupBox
from PyQt5.QtCore import Qt
import PyQt5.QtGui as qtg
from PyQt5.QtGui import QPixmap, QPalette, QBrush, QFont

def create_statistics_page(window, mainservercom, app, username,prev_geometry=None):
    windownew = QWidget()
    pixmap = QPixmap("./images/bbackground1.png")
    windownew.setWindowTitle("Statistics Page")

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
        update_font_sizes()
    windownew.resizeEvent = resize_background

    mainservercom.send("stats".encode('utf-8'))
    mainservercom.send(username.encode('utf-8'))
    my_stats = mainservercom.recv(1024).decode("utf-8")
    name = mainservercom.recv(1024).decode("utf-8")
    
    my_stats = my_stats.split("***")
    user_name    = my_stats[0]
    games_played = int(my_stats[1])
    trophs       = int(my_stats[2])
    avgwintime   = float(my_stats[3])
    lost         = int(my_stats[4])
    avglosetime  = float(my_stats[5])
    draw         = int(my_stats[6])
    hitavg       = float(my_stats[7])
    

    header_label = QLabel("Statistics for " + name)
    header_label.setAlignment(Qt.AlignCenter)
    header_label.setFont(QFont("Arial", 24, QFont.Bold))
    header_label.setStyleSheet("color: white;")
    header_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
    header_label.setMinimumHeight(50)
    
    stats_layout = QFormLayout()
    stats_font = QFont("Arial", 16)
    def back_to_menu():
        from pyqt_mainmenu import create_mainmenu_page
        create_mainmenu_page(windownew,mainservercom,app,username)
    
    def create_stat_row(label_text, value_text):
        label = QLabel(label_text)
        label.setFont(stats_font)
        label.setStyleSheet("color: white;")
        label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
        
        value = QLabel(value_text)
        value.setFont(stats_font)
        value.setStyleSheet("color: white;")
        value.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
        return label, value

    rows = [
        ("Username:", user_name),
        ("Games played:", str(games_played)),
        ("Trophies:", str(trophs)),
        ("Average Win Time:", str(avgwintime)),
        ("Lost:", str(lost)),
        ("Average Loss Time:", str(avglosetime)),
        ("Draws:", str(draw)),
        ("Hit Average:", str(hitavg))
    ]
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
    header_label.setStyleSheet("""
    QLabel {
        color: qlineargradient(
            spread:pad,
            x1:0, y1:0,
            x2:1, y2:0,
            stop:0 rgba(136,74,67,1),
            stop:1 rgba(136,74,67,1)
        );
        font-size: 60px;
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
    for label_text, value_text in rows:
        label, value = create_stat_row(label_text, value_text)
        label.setStyleSheet(style)
        stats_layout.addRow(label, value)
    
    stats_box = QGroupBox()
    stats_box.setLayout(stats_layout)
    stats_box.setStyleSheet(
        "QGroupBox { border: 2px solid white; border-radius: 5px; margin-top: 10px; }"
        "QGroupBox::title { subcontrol-origin: margin; left: 10px; padding: 0 3px 0 3px; color: white; }"
    )
    stats_box.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)

    def update_font_sizes():
        window_width = windownew.width()
        header_size = max(16, min(32, int(window_width / 25)))
        stats_size = max(10, min(20, int(window_width / 40)))
        button_size = max(10, min(16, int(window_width / 50)))
        
        header_font = QFont("Arial", header_size, QFont.Bold)
        header_label.setFont(header_font)
        
        stats_font = QFont("Arial", stats_size)
        for i in range(stats_layout.rowCount()):
            label_item = stats_layout.itemAt(i, QFormLayout.LabelRole)
            field_item = stats_layout.itemAt(i, QFormLayout.FieldRole)
            if label_item and label_item.widget():
                label_item.widget().setFont(stats_font)
            if field_item and field_item.widget():
                field_item.widget().setFont(stats_font)
                
        button_width = min(500, max(200, int(window_width * 0.4)))
        Back_button.setMinimumWidth(button_width)
        Back_button.setStyleSheet(style)

    main_layout = QVBoxLayout()
    main_layout.addStretch(1) 
    main_layout.addStretch(1) 
    main_layout.addWidget(header_label)
    
    Back_button = QPushButton("Back to Menu")
    Back_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    Back_button.setMinimumWidth(200)
    Back_button.setMinimumHeight(50)
    Back_button.setStyleSheet(style)
    
    h_layout = QHBoxLayout()
    h_layout.addStretch(1)
    h_layout.addWidget(stats_box)
    h_layout.addStretch(1)
    
    form2_layout = QFormLayout()
    form2_layout.addRow(Back_button)
    
    main_layout.addLayout(h_layout)
    main_layout.addStretch(1) 
    main_layout.addLayout(form2_layout)
    Back_button.clicked.connect(back_to_menu)
    windownew.setLayout(main_layout)
    
    update_font_sizes()
    
    windownew.show()
        
    window.close()
    return windownew
