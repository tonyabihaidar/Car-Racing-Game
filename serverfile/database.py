import sqlite3 
import re 
import bcrypt 
''' Delete before submission 
Here is a concise function list with their purposes and return formats:
USERNAME_VALIDATE(username)
    Checks if a username (email) exists.
    Returns: True (available) or False (exists).
USER_SIGNUP(email, password, name, country, date)
    Registers a new user in both tables.
    Returns: None.
USER_LOGIN(username, password)
    Validates login credentials.
    Returns: True (correct) or False (incorrect).
FETCH_USER_CREDENTIALS(username)
    Retrieves user details from user_credentials.
    Returns: Tuple (email, password, name, country, date).
FETCH_USER_STATISTICS(username)
    Retrieves user stats from user_statistics.
    Returns: Tuple (email, games_played, trophies, avg_win_time, games_lost, avg_loss_time, games_draw, avg_hits).
UPDATE_USER_STATS(username, trophy, wintime, lost, losttime, draw)
    Updates user statistics based on game results.
    Returns: None.
FETCH_LEADERSHIP_BOARD(country='worldwide')
    Retrieves the top 20 users sorted by trophies.
    Returns: List of tuples [(name, trophies), ...] (max 20).
RESET_USER_STATS(email):
    Resets stats of a user all to zero 
CHANGE_USER_NAME(email, name ):
    changes the name to something new. 
DELETE_USER(username):
    deletes the netries of a user from both tables

'''
db = sqlite3.connect("database.db")
cursor = db.cursor()
cursor.execute("""CREATE TABLE IF NOT EXISTS user_credentials(
    user_email text PRIMARY KEY,
    user_password text,
    user_name text, 
    user_country text,
    user_date text)
    """)
cursor.execute("""CREATE TABLE IF NOT EXISTS user_statistics(
    user_email text PRIMARY KEY, 
    user_games_played int, 
    user_trophies int, 
    user_avgwintime real, 
    user_games_lost int,
    user_avglosetime real,
    user_games_draw int, 
    user_hit_avg int 
    )
    """)
db.close()
def RESET_USER_STATS(em):
    print(em)
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("""UPDATE user_statistics SET 
                   user_games_played=?, user_trophies=? , user_avgwintime = ?, user_games_lost = ?, 
                    user_avglosetime = ? , user_games_draw = ?, user_hit_avg = ? 
                   WHERE user_email=?""",(0,0,0,0,0,0,0,em))
    db.commit()
    db.close()

def CHANGE_USER_NAME(em,name):
    print(em)
    
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("""UPDATE user_credentials SET 
                    user_name = ?
                   WHERE user_email=?""",(name,em))
    db.commit()
    db.close()
    
    
def stringize_players(list):
    s = ''
    d = []
    for player in list:
        # {"name": FETCH_NAME(username), "username" :username, "ip": ip_and_port[0] , "port": ip_and_port[1] }
        d.append(player["name"]+"&&&"+player["username"]+"&&&"+player["ip"]+"&&&"+player["port"])
    s+=d[0] 
    for i in range(1,len(d)):
        s+="***"+d[i]
    return s
                    
def validate_email_regex(e):

    pattern1 = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    pattern2 = r'^[\w\.-]+@[\w\.-]+[\w\.-]+\.\w+$'
    
    
    return  re.match(pattern1,e) or re.match(pattern2,e)    
def USERNAME_VALIDATE(username):
    # Use this function when
    # - checking if username is used upon signup. 
    # - validating the username on login. (you can not use it)
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("SELECT user_email FROM user_credentials WHERE user_email = ?", (username,))
    users = cursor.fetchall()
    print(users)
    db.close()
    
    return len(users)==0 
   
def USER_SIGNUP(email,password,name,country,date):
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    pswrd_b = password.encode('utf-8') # b"string" 
    hashed_password = bcrypt.hashpw(pswrd_b,bcrypt.gensalt())
    
    cursor.execute("INSERT INTO user_credentials values(?,?,?,?,?)",(email,hashed_password,name,country,date))
    db.commit()
    cursor.execute("INSERT INTO user_statistics values(?,?,?,?,?,?,?,?)",(email,0,0,0,0,0,0,0,))
    db.commit()
    db.close()
    return 
def DELETE_USER(em):
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("DELETE FROM user_credentials WHERE  user_email = ?",(em,))
    cursor.execute("DELETE FROM user_statistics WHERE  user_email = ?",(em,))
    db.commit()
    db.close()
def USER_LOGIN(username,password): # here make sure to validate username before 
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("SELECT user_password FROM user_credentials WHERE user_email = ?",(username,)) 
    p = cursor.fetchone()
    db.close()
    
    if (bcrypt.checkpw(password.encode('utf-8'),p[0])): # I assume here, that if the user inputs an invalid username or password, the answer won't specify the issue. 
        return True # access allowed 
    return False # access denied 

def FETCH_NAME(username):
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("SELECT user_name FROM user_credentials WHERE user_email = ?",(username,))
    r = cursor.fetchone() # return as tuple
    db.close()
    return r
def FETCH_USER_CREDENTIALS(username):
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("SELECT * FROM user_credentials WHERE user_email = ?",(username,))
    r = cursor.fetchone() # return as tuple
    db.close()
    return r 
def FETCH_USER_STATISTICS(username):
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("SELECT * FROM user_statistics WHERE user_email = ?",(username,))
    r = cursor.fetchone() # return as tuple
    db.close()
    return r 
def UPDATE_USER_STATS(username, trophy, wintime, lost,  losttime, draw, hits ):
    db = sqlite3.connect("database.db")
    cursor = db.cursor()
    cursor.execute("""SELECT * FROM user_statistics WHERE user_email = ?""",(username,))
    stats = cursor.fetchone()
    upgamesplayed =  stats[1]+1
    uptrophies = stats[2]
    upavgwintime  = stats[3]
    uplost = stats[4]
    uplosetime = stats[5]
    updraws = stats[6]
    uphits =(stats[1]*stats[7] + hits )/upgamesplayed
    if trophy!=0: # change these only if you have won (avoiding zerodivision in first game)
        uptrophies  = stats[2]+trophy
        upavgwintime  = ((stats[3]*stats[2])+wintime)/uptrophies # new average win time = ((oldavg*oldwins)+newwintime)/newwins
    if lost!=0 : # change these only if you have lost (avoiding zerodivision in first game)
        uplost = stats[4]+lost
        uplosetime = ((stats[4]*stats[5])+losttime)/uplost
    updraws = stats[6]+draw 
    cursor.execute("""UPDATE user_statistics SET 
                   user_games_played=?, user_trophies=? , user_avgwintime = ?, user_games_lost = ?, 
                    user_avglosetime = ? , user_games_draw = ?, user_hit_avg = ? 
                   WHERE user_email=?""",(upgamesplayed,uptrophies,upavgwintime,uplost,uplosetime,updraws,uphits,username))
    db.commit()
    db.close()
    return 
def FETCH_LEADERSHIP_BOARD(country):
    db = sqlite3.connect("database.db")
    cursor = db.cursor()    
    if country=='WorldWide':
        cursor.execute("""
            SELECT u.user_name, s.user_trophies
            FROM user_credentials u
            INNER JOIN user_statistics s 
                ON u.user_email = s.user_email
            ORDER BY s.user_trophies DESC
            LIMIT 20
        """)
        top20 = cursor.fetchall()
        db.close()
        return top20
    cursor.execute("""
        SELECT u.user_name, s.user_trophies
        FROM user_credentials u
        INNER JOIN user_statistics s 
            ON u.user_email = s.user_email
        WHERE u.user_country = ? 
        ORDER BY s.user_trophies DESC
        LIMIT 20
    """, (country,))
    top20 = cursor.fetchall()
    db.close()
    return top20
    
