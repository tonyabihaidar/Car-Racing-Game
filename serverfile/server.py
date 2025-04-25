import socket 
#from database import FETCH_NAME, stringize_players, validate_email_regex
from database import *
import threading
import re 
import time 
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

server_creds = (socket.gethostbyname(socket.gethostname()),8000)
print(server_creds)
dedicated_server= socket.socket(socket.AF_INET, socket.SOCK_STREAM)
dedicated_server.bind(server_creds)
dedicated_server.listen()

online_players = [ ]# (ip address, port number, username ,car ) for each user
busy_players = [] #usernames currently in a game
pending_requests = {}#key is the requested username; value is a list of the requesting usernames
request_states = {} # {requesting_username: {requested_username: state ('pending', 'accepted', 'declined', 'busy', 'disconnected')}}

print("Server is running!! ")
lock = threading.Lock() #lock to prevent other threads from accessing the shared resource

# Store pending verifications
pending_verifications = {}
#######################################################
#######################################################
#######################################################
                #Useful Funcitons #
#######################################################
#######################################################
#######################################################
def send_verification_email(email, code):
    try:
        sender_email = "neonrushcargame@gmail.com"
        sender_password = "cftmukrjlkzqjwdt"  # Replace with the App Password from Google
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "Verify your Neon Rush account"
        
        body = f"""
        <html>
        <body>
            <h2>Welcome to Neon Rush!</h2>
            <p>Your verification code is: <strong>{code}</strong></p>
            <p>Please enter this code to complete your registration.</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Using SSL for more secure connection
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print(f"Verification email sent successfully to {email}")  # Debug log
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def broadcast_online_players():#to send the updated list of online players and their request states to all connected clients."""
    online_list = []
    for player in online_players:
        if player["username"] in busy_players: #exclude busy players
            continue
        stats = FETCH_USER_STATISTICS(player["username"])
        if stats:
            state_info = {}
            if player["username"] in request_states:
                state_info = request_states[player["username"]]
            online_list.append({
                'username': player['username'],
                'games_played': stats[1],
                'trophies': stats[2],
                'avg_win_time': stats[3],
                'games_lost': stats[4],
                'avg_lose_time': stats[5],
                'games_draw': stats[6],
                'request_states': state_info
            })
    for player in online_players:
        player_data = "ONLINE_PLAYERS_UPDATE\n"
        for other_player_info in online_list:
            player_data += f"{other_player_info['username']} {other_player_info['games_played']} {other_player_info['trophies']} {other_player_info['avg_win_time']} {other_player_info['games_lost']} {other_player_info['avg_lose_time']} {other_player_info['games_draw']} "
            if other_player_info['username'] in player['username'] and other_player_info['username'] in request_states:
                for requested_user, state in request_states[other_player_info['username']].items():
                    player_data += f"{requested_user}:{state},"
            elif player['username'] in request_states and other_player_info['username'] in request_states[player['username']]:
                player_data += f"{other_player_info['username']}:{request_states[player['username']][other_player_info['username']]},"
            player_data += "\n"
            
        player['connection'].send(player_data.encode('utf-8'))
    print(f" Broadcasted online player updates")
#######################################################
#######################################################
#######################################################
                #START HERE #
#######################################################
#######################################################
#######################################################
def handle_user(p,a):
    # first message that should be sent identifies the task of the server
    client_info = p.recv(1024).decode('utf-8').strip()
    ip_and_port = client_info.split() # transport and network layer creds
    global online_players 
    
    while True : 
      try:
        # recurrent status message
        message=p.recv(1024).decode('utf-8').strip()
        print(message)
        
        if message =="updates": # when updating user statistics after game ends 
            info = p.recv(1024).decode('utf-8').strip()
            info = info.split("**")
            username=info[0]
            for i in range(1,len(info)):
                info[i] = int(info[i])
            UPDATE_USER_STATS(username, info[1], info[2], info[3],  info[4], info[5], info[6] )
        if message =="stats": # for statistics page 
            print(message)
            username = p.recv(1024).decode("utf-8")
            my_stats = FETCH_USER_STATISTICS(username)
            my_stats = "***".join( str(x) for x in my_stats)
            p.send(my_stats.encode("utf-8"))
            creds = FETCH_USER_CREDENTIALS(username)
            p.send(creds[2].encode("utf-8"))
        if message =="name": # when the user wants to change his name in settings 
            email_name = p.recv(1024).decode('utf-8').strip()
            email_name = email_name.split("***")
            username = email_name[1]
            CHANGE_USER_NAME(email_name[1],email_name[0])
        if message =="reset": # when the user wants to reset his stats in settings
            username= p.recv(1024).decode('utf-8').strip()
            RESET_USER_STATS(username) 
        if message== "sign_up": # sign up logic 
            data = p.recv(1024).decode('utf-8').strip()#receive from pyqt
            username, password1,password2, name, country, date = data.split()
            check_regex = validate_email_regex(username)
            check_duplicate = USERNAME_VALIDATE(username)
            check_same_pass = (password1==password2)
            check_missings = username=="" or  password1=="" or password2=="" or name=="" or country =="" or date=="" 
            if not check_regex : # errors are checked by the server because it has all the credentials
                p.send('sign_up signup_denied regex'.encode('utf-8'))
            elif not check_duplicate :
                p.send('sign_up signup_denied duplicate_email'.encode('utf-8'))
            elif not check_same_pass:
                p.send('sign_up signup_denied diffrent_passwords'.encode('utf-8'))
            elif check_missings :
                p.send('sign_up signup_denied missing_info'.encode('utf-8'))
            else :
                # Generate verification code
                verification_code = ''.join(random.choices(string.digits, k=6))
                
                # Store pending verification
                pending_verifications[username] = {
                    'code': verification_code,
                    'data': {
                        'password': password1,
                        'name': name,
                        'country': country,
                        'date': date
                    }
                }
                
                # Send verification email
                if send_verification_email(username, verification_code):
                    p.send(f'sign_up verification_sent'.encode('utf-8'))#{verification_code}
                else:
                    p.send('sign_up signup_denied email_failed'.encode('utf-8'))
                    
        elif message == "verify_code": # for verifying code logic 
            data = p.recv(1024).decode('utf-8').strip()
            username, code = data.split()
            
            if username in pending_verifications and pending_verifications[username]['code'] == code:
                # Complete signup with stored data
                user_data = pending_verifications[username]['data']
                USER_SIGNUP(username, user_data['password'], user_data['name'], 
                          user_data['country'], user_data['date'])
                
                # Clean up verification data
                del pending_verifications[username]
                
                p.send('verify_success'.encode('utf-8'))
            else:
                p.send('verify_failed'.encode('utf-8'))

        elif message == "log_in": #the user is considered online in the game only when he enters  the garage. 
            data = p.recv(1024).decode('utf-8').strip()#receive from pyqt
            username, password= data.split() # creds to validate 
            if data=="" or username =="" :
                p.send('log_in log_in_denied missing_info'.encode('utf-8')) 
            elif USERNAME_VALIDATE(username) or not USER_LOGIN(username,password):
                p.send('log_in log_in_denied wrong_creds'.encode('utf-8')) # failed login dont specifiy the problem (wrong username or password), adding a layer of security 
            else :
                p.send('log_in log_in_successful'.encode('utf-8'))
                online_players.append( {"connection":p,"name": FETCH_NAME(username), "username" :username, "ip": ip_and_port[0] , "port": ip_and_port[1] })
            # the loop will run again and he will keep trying to log in 
        elif message[:6]=="delacc":
            username= message.split("***")[1] # the username is recieved 
            DELETE_USER(username) # database function
            
        elif "Decline" in message: # declining other player's request 
                L = message.split()
                if username in pending_requests and any(req == L[1] for req, ts in pending_requests[username]):
                    pending_requests[username] = [
                        (req, ts)
                        for req, ts in pending_requests[username]
                        if req != L[1]
                    ]
                    if L[1] not in request_states:
                        request_states[L[1]] = {}
                    request_states[L[1]][username] = 'declined'
                    for player in online_players:
                        if player["username"] == L[1]:
                            player["connection"].send(
                                f"Race_Declined {username} declined your request.\n".encode()
                            )
                            break
                    broadcast_online_players()
        elif "Carchoice" in message: # choosing the car , it is stored with player info, to be sent to other player.
                    L = message.split()
                    car_choice = L[1]
                    for player in online_players:
                        if player["username"] == username:
                            player["car"] = car_choice
                            chosen_car = car_choice
                            break
        elif message == "GetOnlinePlayers": # for listing players 
            broadcast_online_players() # implemented above
        elif message =="leaderboard":
            c = p.recv(1024).decode('utf-8')
            leads = FETCH_LEADERSHIP_BOARD(c)
            strleads = []
            if len(leads)==0: 
                p.send("No players in this country!!".encode('utf-8'))
            else : 
                for someone in leads: 
                    strleads.append(someone[0]+"&&&"+str(someone[1]))
                strleads="***".join(strleads)
                p.send(strleads.encode('utf-8'))
                
        elif "Race_Request" in message: # handling global changes for when a user requests to play with another player 
            L = message.split()
            requested_player = L[1]
            if requested_player not in pending_requests:
                    pending_requests[requested_player] = []
            if username not in [req for req, ts in pending_requests[requested_player]]: # Avoid duplicate requests
                    pending_requests[requested_player].append((username, time.time()))
                    print(f"[Race request from {username} to {requested_player}. Pending requests: {pending_requests}")
                    for player in online_players:
                        if player["username"] == requested_player:
                            stats = FETCH_USER_STATISTICS(username)
                            player_data = f"Race_Request_Pending {username} {str(stats[1])} {str(stats[2])} {str(stats[3])} {str(stats[4])} {str(stats[5])} {str(stats[6])}\n"
                            player["connection"].send(player_data.encode('utf-8'))
                            break
                    broadcast_online_players()
        elif "Dont_Confirm" in message:
            L = message.split()
            other_player_username = L[1]

            print(f"{username} didnt confirm play with {other_player_username}")

            for player in online_players:
                print(p)
                if player["username"] == username:
                    player1 = player
                elif player["username"] == other_player_username:
                    player2 = player
            if other_player_username in pending_requests:
                pending_requests[other_player_username] = [(req, ts) for req, ts in pending_requests[other_player_username] if req != username]
                if not pending_requests[other_player_username]:
                    del pending_requests[other_player_username]

            if username in pending_requests:
                pending_requests[username] = [(req, ts) for req, ts in pending_requests[username] if req != other_player_username]
                if not pending_requests[username]:
                    del pending_requests[username]
            if username in request_states:
                del request_states[username]
            
        elif message.startswith("Confirm_Play "): # handling global changes for when a user decides to play with other person 
             L = message.split()
             accepted_player_username = L[1]
             print(L[1])
             print(username)
             current_player_username = username # The confirming player (original requester)

             print(f"{current_player_username} confirmed play with {accepted_player_username}")

             for player in online_players:
                 print(p)
                 if player["username"] == current_player_username:
                     player1 = player
                 elif player["username"] == accepted_player_username:
                     player2 = player
             if player1 and player2 and player1["car"] and player2["car"]:
                 port = 50002
                 ip1 = player1["ip"]
                 ip2 = player2["ip"]
                 player1["connection"].send( f"CLIENT {ip2} {port} {player2['car']} {player1['car']} {current_player_username} {accepted_player_username}\n".encode('utf-8'))
                 player2["connection"].send( f"SERVER {ip1} {port} {player1['car']} {player2['car']} {accepted_player_username} {current_player_username}\n".encode('utf-8'))

                 #remove pending requests
                 if accepted_player_username in pending_requests:
                     pending_requests[accepted_player_username] = [(req, ts) for req, ts in pending_requests[accepted_player_username] if req != current_player_username]
                     if not pending_requests[accepted_player_username]:
                         del pending_requests[accepted_player_username]

                 if current_player_username in pending_requests:
                     pending_requests[current_player_username] = [(req, ts) for req, ts in pending_requests[current_player_username] if req != accepted_player_username]
                     if not pending_requests[current_player_username]:
                         del pending_requests[current_player_username]

                 #update busy players. in the pyqt page, busy players dont appear as available players
                 if current_player_username not in busy_players:
                     busy_players.append(current_player_username)
                 if accepted_player_username not in busy_players:
                     busy_players.append(accepted_player_username)
                 broadcast_online_players()

        elif message.startswith("Game_Finished "): # handling game end logic 
           _, user1, user2 = message.split()
           #remove both players from busy list
           for u in (user1, user2):
                   if u in busy_players:
                       busy_players.remove(u)
           broadcast_online_players()
        elif "LOGOUT" in message:
             #when the logged-out user is the requested player 
             if username in pending_requests:
                 # Notify all requesters that the requested user (logged-out) disconnected
                 for req, ts in pending_requests[username]:
                     for player in online_players:
                         if player["username"] == req:
                             player["connection"].send(f"Race_Disconnected {username}\n".encode('utf-8'))
                             print(f"Sent Race_Disconnected to {req} because {username} logged out.")
                 del pending_requests[username]

             # when the logged-out user is a requester 
             for requested_user, requesters in list(pending_requests.items()):
                 updated_requesters = []
                 for req, ts in requesters:
                     if req == username:
                         # notify the requested user that the requester (logged-out) disconnected
                         for player in online_players:
                             if player["username"] == requested_user:
                                     player["connection"].send(f"Race_Disconnected {username}\n".encode('utf-8'))
                                     print(f"Sent Race_Disconnected to {requested_user} because requester {username} logged out.")
                     else:
                         updated_requesters.append((req, ts))
                 if updated_requesters:
                     pending_requests[requested_user] = updated_requesters
                 else:
                     del pending_requests[requested_user]
        elif  message.startswith("Accept "):
            L = message.split()
            other_player_username = L[1] # The player whose request is being accepted
            current_player_username = username # The player sending the accept

            print(f"{current_player_username} accepted request from {other_player_username}. Pending requests: {pending_requests}")

            # Check if there's a pending request from the 'other_player_username' to the 'current_player_username'
            if current_player_username in pending_requests:
                for req, ts in pending_requests[current_player_username]:
                    if req == other_player_username:
                        break
            for player in online_players:#ask the original requesting player if they still want to play
                if player["username"] == other_player_username:
                    player["connection"].send(f"Do_you_still_want_to_play_with {current_player_username}\n".encode('utf-8'))
                    print(f"Sent Do_you_still_want_to_play_with to {other_player_username} for {current_player_username}")
                    if other_player_username not in request_states:
                        request_states[other_player_username] = {}
                    broadcast_online_players()
                    break
      except (ConnectionResetError, BrokenPipeError) as e:
                # NoTE TO SERENA : Is username already defined all the time ? 
                print(f"Client {username} disconnected abruptly: {e}")
                break
    
    online_players = [player for player in online_players if player["username"] != username]
    # Update request states for all players upon disconnection
    for requester, requests in request_states.items():
        if username in requests:
            request_states[requester][username] = 'disconnected'
    if username in pending_requests:
        del pending_requests[username]  # Explicitly remove requests where the disconnected user was the target
    for requester, requested_list in pending_requests.items():
        pending_requests[requester] = [(req, ts) for req, ts in requested_list if req != username]
    if username in busy_players:
        busy_players.remove(username)
    broadcast_online_players()
    p.close()
    
while True:
    player, address = dedicated_server.accept()
    print("A new player has joined the game!")
    thread = threading.Thread(target=handle_user, args=(player, address))
    thread.start()
