import sys
import socket
import time
import threading
from PyQt5.QtWidgets import QFormLayout , QSizePolicy , QListWidget, QListWidgetItem, QApplication, QLabel, QPushButton, QVBoxLayout, QWidget, QHBoxLayout, QStackedWidget
from PyQt5.QtCore import QSize, Qt, QTimer, QMetaObject, Q_ARG, QObject, pyqtSignal, pyqtSlot
from PyQt5.QtWidgets import QMessageBox
from PyQt5.QtGui import QFont

class RequestInvoker(QObject):
    update_player_signal = pyqtSignal(list)
    add_request_signal = pyqtSignal(dict)
    show_question_signal = pyqtSignal(str)
    update_requests_signal = pyqtSignal()

    @pyqtSlot(dict)
    def handle_add_request(self, request_info):
        _add_request(request_info)

    @pyqtSlot(list)
    def handle_player_update(self, players):
        update_online_players_list(players) 

    @pyqtSlot(str)
    def show_question_box(self, requesting_player):
        ask_if_still_want_to_play(requesting_player)
        

invoker_instance = RequestInvoker()
invoker_instance.add_request_signal.connect(invoker_instance.handle_add_request)

def update_online_players_list(players_list):
    online_players_list_widget.clear()  
    for player in players_list:
      if local_player_username!=player["username"]:
        item = QListWidgetItem()  
        rowwidget = QWidget()  
        item.setSizeHint(QSize(100, 60))  
        
        rowlayout = QHBoxLayout(rowwidget)  # Create a horizontal layout to arrange widgets
        rowlayout.setContentsMargins(5, 5, 5, 5)  # Set margins for the layout

        wins = player['games_played'] - player['games_lost'] - player['games_draw']
        
        stats_text = QLabel(f"{player['username']}\nWins:{wins} Losses:{player['games_lost']} Draws:{player['games_draw']} Trophies:{player['trophies']}")

        request_button = QPushButton("Request")
        request_button.setFixedHeight(35)  

        request_button.clicked.connect(lambda checked, username=player['username']: send_race_request(username))

        rowlayout.addWidget(stats_text)
        rowlayout.addWidget(request_button)  
        
        rowwidget.setLayout(rowlayout)

        online_players_list_widget.addItem(item)
        online_players_list_widget.setItemWidget(item, rowwidget)
  

def ask_if_still_want_to_play(requesting_player):
    global online_players_page_instance
    reply = QMessageBox.question(online_players_page_instance,"Confirm Play",f"{requesting_player} accepted your race request. Do you still want to play?", QMessageBox.Yes | QMessageBox.No)
    if reply == QMessageBox.Yes:
        main_server_socket.send(f"Confirm_Play {requesting_player}\n".encode('utf-8'))
    else:
        #automatically remove after 5 seconds if declined
        if requesting_player in sent_requests_status:
            sent_requests_status[requesting_player] = "Declined"
            message = f"Dont_Confirm {requesting_player}"
            print(message)
            main_server_socket.send(message.encode('utf-8'))
            invoker_instance.update_requests_signal.emit()

def _parse_online_players_message(message):
    players_list = []
    for line in message.strip().splitlines():
        player_info_str = line.strip()
        if player_info_str:
            parts = player_info_str.split()
            if len(parts) >= 7:
                    player_data = {
                        'username': parts[0],
                        'games_played': int(parts[1]),
                        'trophies': int(parts[2]),
                        'avg_win_time': float(parts[3]) if parts[3].replace('.', '', 1).isdigit() else 0.0,
                        'games_lost': int(parts[4]),
                        'avg_lose_time': float(parts[5]) if parts[5].replace('.', '', 1).isdigit() else 0.0,
                        'games_draw': int(parts[6]),
                        'request_states': {}
                    }
                    if len(parts) > 7:
                        request_states_str = parts[7].split(',')
                        for req_state in request_states_str:
                            if ":" in req_state:
                                req_user, state = req_state.split(":")
                                player_data['request_states'][req_user] = state
                    players_list.append(player_data)
            else:
                print(f"Incomplete player data received (parse_message): {parts}")
    return players_list


def _add_request(request_info):
    global requests_list_widget
    player = request_info['player']
    item = QListWidgetItem()
    rowwidget = QWidget()
    item.setSizeHint(QSize(100, 60))
    rowlayout = QHBoxLayout(rowwidget)
    rowlayout.setContentsMargins(5, 5, 5, 5)

    wins = player['games_played'] - player['games_lost'] - player['games_draw']
    stats_text = QLabel(f"{player['username']}\nWins:{wins} Losses:{player['games_lost']} Draws:{player['games_draw']} Trophies:{player['trophies']}")
    accept_button = QPushButton("Accept")
    decline_button = QPushButton("Decline")

    accept_button.setFixedHeight(35)
    decline_button.setFixedHeight(35)

    rowlayout.addWidget(stats_text)
    rowlayout.addWidget(accept_button)
    rowlayout.addWidget(decline_button)

    rowwidget.setLayout(rowlayout)
    requests_list_widget.addItem(item)
    requests_list_widget.setItemWidget(item, rowwidget)

    accept_button.clicked.connect(lambda _, req_player=player: handle_accept(req_player))
    decline_button.clicked.connect(lambda _, req_player=player: handle_decline(req_player))

def send_race_request(username):
    global main_server_socket, local_player_username, sent_requests_status

    message = f"Race_Request {username}"
    print(f"Sending race request to {username}")
    main_server_socket.send(message.encode('utf-8'))
    sent_requests_status[username] = "Pending"
    _update_your_requests_display()

def _update_your_requests_display():
    requested_players_display_widget.clear()
    for username, status in sent_requests_status.items():
        item = QListWidgetItem()
        rowwidget = QWidget()
        item.setSizeHint(QSize(100, 60))
        rowlayout = QHBoxLayout(rowwidget)
        rowlayout.setContentsMargins(5, 5, 5, 5)

        stats_label = QLabel(f"{username}\nStatus: {status}")
        stats_label.setWordWrap(True)
        rowlayout.addWidget(stats_label)
        rowwidget.setLayout(rowlayout)

        requested_players_display_widget.addItem(item)
        requested_players_display_widget.setItemWidget(item, rowwidget)

        #automatically remove after 5 seconds if declined
        if status == "Declined" or status=="Disconnected" :
            QTimer.singleShot(5000, lambda u=username: _remove_sent_request(u))
def _remove_sent_request(username):
    if username in sent_requests_status and (sent_requests_status[username] == "Declined" or sent_requests_status[username] == "Disconnected") :
        del sent_requests_status[username]
        _update_your_requests_display()

def handle_accept(player):
    global main_server_socket
    message = f"Accept {player['username']}"
    main_server_socket.send(message.encode('utf-8'))
    _remove_incoming_request(player["username"])
    print(f"Accepted race request from {player['username']}")

def handle_decline(player):
    global main_server_socket
    message = f"Decline {player['username']}"
    main_server_socket.send(message.encode('utf-8'))
    print(f"Declined race request from {player['username']}")
    _remove_incoming_request(player['username'])

def check_server_messages(message=None):
    global main_server_socket, invoker_instance
    main_server_socket.setblocking(False)
    message = ""
    while True:
        try:
            chunk = main_server_socket.recv(4096).decode('utf-8')
            if not chunk:
                time.sleep(0.1)
                continue
            message += chunk
            print(message)
            while message:
                processed = False
                if message.startswith("ONLINE_PLAYERS_UPDATE\n"):
                  header, rest = message.split('\n', 1)
                  players_list = _parse_online_players_message(rest)
                  if players_list:
                      invoker_instance.update_player_signal.emit(players_list)  # Emit players_list instead of players_dict

                  message = ""
                  processed = True  

                elif "Race_Request_Pending" in message:
                    parts = message.split('\n', 1)
                    if parts and parts[0]:
                        message_line = parts[0]
                        message_parts = message_line.split()
                        if len(message_parts) >= 2 and message_parts[0] == "Race_Request_Pending":
                            requester_username = message_parts[1]
                            requester_player = {
                                'username': requester_username,
                                'games_played': int(message_parts[2]) if len(message_parts) > 2 else 0,
                                'trophies': int(message_parts[3]) if len(message_parts) > 3 else 0,
                                'avg_win_time': float(message_parts[4]) if len(message_parts) > 4 else 0.0,
                                'games_lost': int(message_parts[5]) if len(message_parts) > 5 else 0,
                                'avg_lose_time': float(message_parts[6]) if len(message_parts) > 6 else 0.0,
                                'games_draw': int(message_parts[7]) if len(message_parts) > 7 else 0
                            }
                            invoker_instance.add_request_signal.emit({'player': requester_player})

                            message = message[len(message_line) + 1:]
                            processed = True
                        else:
                            print(f"Invalid Race_Request_Pending format: {message_line}")
                            message = message[len(message_line) + 1:]
                            processed = True
                    else:
                        break
                elif "Race_Disconnected" in message:
                    parts = message.split('\n', 1)
                    message_line = parts[0]
                    message_parts = message_line.split()
                    if len(message_parts) >= 2:
                        disconnected_username = message_parts[1]
                        if disconnected_username in sent_requests_status:
                            sent_requests_status[disconnected_username] = "Disconnected"
                            invoker_instance.update_requests_signal.emit()
                    message = message[len(message_line) + 1:]
                    
                elif message.startswith("Do_you_still_want_to_play_with "):
                    line = message.split('\n', 1)[0]
                    parts = line.split()
                    requesting_player = parts[1]
                    QMetaObject.invokeMethod(
                        invoker_instance,
                        "show_question_box",
                        Qt.QueuedConnection,
                        Q_ARG(str, requesting_player))
                    message = message[len(line) + 1:]
                    processed = True

                elif message.startswith("Race_Declined "):
                   parts = message.split('\n', 1)
                   message_line = parts[0]
                   message_parts = message_line.split()
                   if len(message_parts) >= 2:
                       decliner_username = message_parts[1]
                       if decliner_username in sent_requests_status:
                           sent_requests_status[decliner_username] = "Declined"
                           invoker_instance.update_requests_signal.emit()
                   message = message[len(message_line) + 1:]
                elif message.startswith("Request_Accepted "):
                    parts = message.split('\n', 1)
                    if parts and parts[0]:
                        message_line = parts[0]
                        accepting_player = message_line.split()[1]
                        requesting_player = message_line.split()[2]
                        print(f"{accepting_player} accepted your race request. Waiting for final confirmation.")
                        if accepting_player in sent_requests_status:
                            sent_requests_status[accepting_player] = "Accepted"
                            invoker_instance.update_requests_signal.emit() 
                        QTimer.singleShot(3000, peer_to_peer_setup)
                        message = message[len(message_line) + 1:]
                        processed = True
                    else:
                        break
                elif message.startswith("Acknowledge_Request "):
                    parts = message.split('\n', 1)
                    if parts and parts[0]:
                        message_line = parts[0]
                        acknowledging_player = message_line.split()[1]
                        print(f"Received Acknowledge_Request from server to acknowledge {acknowledging_player}'s acceptance.")
                        message = message[len(message_line) + 1:]
                        processed = True
                    else:
                        break

                elif message.startswith("SERVER ") or message.startswith("CLIENT "):
                   parts = message.split('\n', 1)
                   if parts and parts[0]:
                       message_line = parts[0]
                       print(f"Received game setup message: '{message_line}'")
                       L = message_line.split()
                       gusername = L[6]
                       if gusername in sent_requests_status:
                               del sent_requests_status[gusername]  # Remove the entry
                               invoker_instance.update_requests_signal.emit()
                       peer_to_peer_setup(message_line)
                       message = message[len(message_line) + 1:]
                       processed = True
                   else:
                       break
                else:
                    break

                time.sleep(0.01)
        except BlockingIOError:
            time.sleep(0.1)

def _remove_incoming_request(requester_username):
    global requests_list_widget
    if requests_list_widget:
        for i in reversed(range(requests_list_widget.count())):
            item = requests_list_widget.item(i)
            widget = requests_list_widget.itemWidget(item)
            stats_label=widget.findChild(QLabel)
            if stats_label and requester_username in stats_label.text():
                    requests_list_widget.takeItem(i)
def peer_to_peer_setup(message):
    global main_server_socket
    try:
        main_server_socket.send("received".encode('utf-8'))
        L = message.split()
        ip = L[1]
        port = L[2]
        gcar = L[3]
        car = L[4]
        username = L[5]
        gusername = L[6]
        main_server_socket.send(f"Game_Started\n".encode('utf-8'))
        if "SERVER" in message:
            print(message)
            listen_port = int(port)
            listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            listen_socket.bind(("0.0.0.0", listen_port))
            listen_socket.listen(1)
            print("Server is listening for peer connection")
            connection, address = listen_socket.accept()
            main_server_socket.send("done".encode('utf-8'))
            print("Server connected to client for race")
            import gameflow
            gameflow.start_race(connection, True, car, gcar, username, gusername, main_server_socket)

        elif "CLIENT" in message:
            print(message)
            connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            time.sleep(0.5)
            connection.connect((ip, int(port)))
            print("Client connected to server for race")
            import gameflow
            gameflow.start_race(connection, False, car, gcar, username, gusername, main_server_socket)

    except Exception as e:
        print(f"Peer-to-peer setup failed: {e}")

def create_online_players_page( window, mainservercom, app, local_username, prev_geometry=None):
    window.close()
    global online_players_list_widget, requests_list_widget, requested_players_display_widget
    global online_players_data_dict, local_player_username,sent_requests_status
    global main_server_socket, online_players_page_instance,local_player_username
    def back_to_menu():
        from pyqt_mainmenu import create_mainmenu_page
        create_mainmenu_page(window,mainservercom,app,local_username)
    sent_requests_status = {}  

    window = QWidget()
    window.setWindowTitle("Available Players List")
    window.setGeometry(100, 100, 800, 600)  
    layout = QVBoxLayout()

    online_players_page_instance = window 

    online_players_list_widget = QListWidget()
    requests_list_widget = QListWidget()
    requested_players_display_widget = QListWidget()
    online_players_data_dict = {}
    local_player_username = local_username
    main_server_socket = mainservercom

    invoker_instance.update_player_signal.connect(update_online_players_list)
    invoker_instance.update_requests_signal.connect(_update_your_requests_display)

    back_to_menu_button = QPushButton("Back to Menu ")
    back_to_menu_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    back_to_menu_button.setMinimumWidth(200)
    # Create vertical layouts for each section
    onlinelayout = QVBoxLayout()
    requestslayout = QVBoxLayout()
    requestedlayout = QVBoxLayout()

    title1 = QLabel("Available Players")
    title1.setAlignment(Qt.AlignCenter)
    title1.setFont(QFont("Bold", 18))

    title2 = QLabel("Incoming Requests")
    title2.setAlignment(Qt.AlignCenter)
    title2.setFont(QFont("Bold", 18))

    title3 = QLabel("Your Requests")
    title3.setAlignment(Qt.AlignCenter)
    title3.setFont(QFont("Bold", 18))

    onlinelayout.addWidget(title1)
    onlinelayout.addWidget(online_players_list_widget)

    requestslayout.addWidget(title2)
    requestslayout.addWidget(requests_list_widget)

    requestedlayout.addWidget(title3)
    requestedlayout.addWidget(requested_players_display_widget)

    # Combine all three into a horizontal layout
    lists_layout = QHBoxLayout()
    lists_layout.addLayout(onlinelayout)
    lists_layout.addLayout(requestslayout)
    lists_layout.addLayout(requestedlayout)
    lists_layout.setStretch(0, 3)
    lists_layout.setStretch(1, 2)
    lists_layout.setStretch(2, 2)

    # Place everything into the main vertical layout
    main_layout = QVBoxLayout()
    main_layout.addLayout(lists_layout)

    # Add spacing and the button at the bottom
    button_container = QWidget()
    button_layout = QHBoxLayout()
    button_layout.addStretch()
    button_layout.addWidget(back_to_menu_button)
    button_layout.addStretch()
    button_container.setLayout(button_layout)

    main_layout.addSpacing(20)
    main_layout.addWidget(button_container)

    # Apply the layout to the window
    layout = QVBoxLayout()
    layout.addLayout(main_layout)

    window.setLayout(layout)
    back_to_menu_button.clicked.connect(back_to_menu)

    thread = threading.Thread(target=check_server_messages, daemon=True)
    thread.start()
    mainservercom.send("GetOnlinePlayers".encode('utf-8'))
    window.show()
    window.closeEvent = lambda event: on_window_close(main_server_socket, local_player_username)
    
    return window
def on_window_close(main_server_socket, local_player_username):
            disconnect_message = f"LOGOUT {local_player_username}\n".encode('utf-8')
            main_server_socket.send(disconnect_message)