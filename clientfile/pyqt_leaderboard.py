import sys
from PyQt5.QtWidgets import QComboBox  ,QDesktopWidget, QListWidget, QListWidgetItem,  QMessageBox, QApplication, QHBoxLayout, QFormLayout, QLabel, QPushButton, QLineEdit, QVBoxLayout, QWidget, QSizePolicy, QGroupBox
from PyQt5.QtCore import Qt 
import PyQt5.QtGui as qtg
from PyQt5.QtGui import QPixmap, QPalette, QBrush, QFont
def unstringize_players(st): # for un packing communication message content 
    s = st.split("***")
    for i in range(len(s)):
        s[i]= s[i].split("&&&")
    return s 
# for every page, a function has to be closed, a window closed and a window opened, passing on mainsever communication socket, app , and email (username)
def create_leaderboard_page(window,mainservercom,app,username,prev_geometry=None):
    window.close()
    windownew = QWidget()
    pixmap = QPixmap("./images/bbackground1.png")
    windownew.setWindowTitle("Leaderboard")
    
    center_point = QDesktopWidget().availableGeometry().center()
    n=1.2
    image_size = (1024//n,1024//n)
    windownew.setGeometry(int(center_point.x()-image_size[0]//2), int(center_point.y()-image_size[1]//2), int(image_size[0]), int(image_size[1]))  # Default size
    
    palette = QPalette()
    palette.setBrush(QPalette.Window, QBrush(pixmap))
    windownew.setAutoFillBackground(True)
    windownew.setPalette(palette)

    def resize_background(event):
        scaled_pixmap = pixmap.scaled(windownew.size(), Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
        palette.setBrush(QPalette.Window, QBrush(scaled_pixmap))
        windownew.setPalette(palette)
    windownew.resizeEvent = resize_background
    def refresh_list():
        nonlocal list 
        c = my_box.currentText()
        mainservercom.send("leaderboard".encode('utf-8'))
        mainservercom.send(c.encode('utf-8'))
        board = mainservercom.recv(1024).decode("utf-8")
        list.clear()
        if (board!="No players in this country!!"):     
            board = unstringize_players(board)
            list.clear()
            for player in board:
                list.addItem(player[0] + ":" + player[1])
        else : 
            list.clear()
            list.addItem(board)
    def back_to_menu():
        from pyqt_mainmenu import create_mainmenu_page
        create_mainmenu_page(windownew,mainservercom,app,username)
    Clabel=QLabel("Select your country:")
    Clabel.setStyleSheet("color: pink;")
    list = QListWidget()
    
    get_leaderboard=QPushButton("Get Leaderboard")
    get_leaderboard.setMinimumWidth(500)
    Back_button=QPushButton(" Back to Menu")
    Back_button.setMinimumWidth(500)
    
    my_box=QComboBox()
    my_box.addItems(["WorldWide","Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Bolivia", "Brazil", "Bulgaria", "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Greece", "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Japan", "Jordan", "Kenya", "Kuwait", "Lebanon", "Libya", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Palestine", "Peru", "Philippines", "Poland"])
    my_box.setMinimumWidth(500)

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
    for i in [Clabel,my_box,get_leaderboard]:
        i.setStyleSheet(style)
    
    
    #form layout for the country selection and list widget
    form_layout = QFormLayout()
    form_layout.addRow(Clabel, my_box)
    form_layout.addRow("", list)
    form_layout.addRow("", get_leaderboard)
    form_layout.addRow("", Back_button)
    
    #create a main vertical layout with custom margins to center content
    layout_main = QVBoxLayout()
    layout_main.addStretch(1)  # add stretch to push content to center vertically
    layout_main.addLayout(form_layout)
    layout_main.addStretch(1)
    #set margins (left, top, right, bottom) to narrow the layout area, making it appear more centered.
    layout_main.setContentsMargins(100, 50, 100, 50)
    
    #Place th e vertical layout in a horizontal layout for horizontal centering.
    layout_final = QHBoxLayout()
    layout_final.addStretch(1)
    layout_final.addLayout(layout_main)
    layout_final.addStretch(1)
    windownew.setLayout(layout_final)
    windownew.setGeometry(100, 100, 800, 600)  # Initial window size
    Back_button.clicked.connect(back_to_menu)
    get_leaderboard.clicked.connect(refresh_list)

    windownew.show()
    
    return windownew