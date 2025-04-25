import pygame
import random
import socket
import pyqt_players
def get_poison(ob): # decides on the damage level depending on the obstavle name which is identified by file path 
    obstacles = ["./images/hole.png", "./images/road-barrier.png", "./images/bush (1).png", "./images/bush.png", "./images/bushes.png", "./images/road.png"]
    poisons = [20, 15, 5, 5, 5, 10]
    for i in range(len(obstacles)):
        if ob == obstacles[i]:
            return poisons[i]

obstacle_images = {}
def load_obstacle_image(path): 
    if path not in obstacle_images:
        obstacle = pygame.image.load(path).convert_alpha()
        obstacle_images[path] = pygame.transform.scale(obstacle, (obstacle.get_width() / 10, obstacle.get_height() / 10))
    return obstacle_images[path]

aid_kit_image = None
def load_aid_kit_image():
    global aid_kit_image
    if aid_kit_image is None:
        aid_kit = pygame.image.load("./images/first_aid.png").convert_alpha()
        aid_kit_image = pygame.transform.scale(aid_kit, (aid_kit.get_width()/10, aid_kit.get_height()/10))
    return aid_kit_image

def create_obstacle(screen_width):
    obstacles = ["./images/hole.png", "./images/road-barrier.png", "./images/bush (1).png", "./images/bush.png", "./images/bushes.png", "./images/road.png"]
    choice = random.choice(obstacles)
    obstacle_image = load_obstacle_image(choice)
    poison = get_poison(choice)
    obstacle_position = obstacle_image.get_rect(center=(random.randint(60, int(screen_width / 2 - obstacle_image.get_width() - 60)), 35))
    return obstacle_image, obstacle_position, poison, choice #returning the choice as the name of the pic so that it is easier to send the data

def create_aid_kit(screen_width):
    aid_kit_img = load_aid_kit_image()
    aid_kit_position = aid_kit_img.get_rect(center=(random.randint(50, int(screen_width/2 - aid_kit_img.get_width())), -30))
    return aid_kit_img, aid_kit_position

def game_over(screen, car_health, gcar_health, username, gusername, elapsed_time, hit, ghit, result, mainserver_socket): # Added mainserver_socket
    ############### UPDATING STATS ####################
    # everyone sends the data for himself
    if car_health < gcar_health:
        string = f"{username}**0**{str(elapsed_time)}**1**{str(elapsed_time)}**0**{str(hit)}"
        mainserver_socket.send("updates".encode('utf-8'))
        mainserver_socket.send(string.encode('utf-8'))
    elif car_health > gcar_health:
        string = f"{username}**1**{str(elapsed_time)}**0**{str(elapsed_time)}**0**{str(hit)}"
        mainserver_socket.send("updates".encode('utf-8'))
        mainserver_socket.send(string.encode('utf-8'))
    else : 
        string = f"{username}**0**{str(elapsed_time)}**0**{str(elapsed_time)}**1**{str(hit)}"
        mainserver_socket.send("updates".encode('utf-8'))
        mainserver_socket.send(string.encode('utf-8'))
    ###################################################
    #stop the music
    pygame.mixer.music.stop()
    gameover_sound = pygame.mixer.Sound("./music/game-over-arcade-6435.mp3")
    gameover_sound.play()
    #display game over
    f = './fonts/VCR_OSD_MONO_1.001.ttf'
    game_over_font = pygame.font.Font(f, 72)
    gameover_text = game_over_font.render("GAME OVER!", True, (255, 0, 0))# Red Colo Text
    gameover_rect = gameover_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 4))

    font = pygame.font.Font(f, 24)
    #declare stats and update database
    tab = 50
    spacing = 45

    if result == "WIN": # Use the received result
        state_text = font.render("YOU WON!", True, (255, 0, 0))
    elif result == "LOSE":
        state_text = font.render("YOU LOST!", True, (255, 0, 0))
    else:
        state_text = font.render("TIE!", True, (255, 0, 0))
    state_rect = state_text.get_rect(topleft=(tab, (screen.get_height() // 4) + spacing))

    name_text = font.render(username, True, (255, 0, 0))
    name_rect = name_text.get_rect(topleft=(tab, (screen.get_height() // 4) + 2 * spacing))

    health_text = font.render(f"Health : {car_health}", True, (255, 0, 0))
    health_rect = health_text.get_rect(topleft=(tab, (screen.get_height() // 4) + 3 * spacing))

    hit_text = font.render(f"Hits: {hit}", True, (255, 0, 0))
    hit_rect = hit_text.get_rect(topleft=(tab, (screen.get_height() // 4) + 4 * spacing))

    time_text = font.render(f"Elapsed Time : {elapsed_time}", True, (255, 0, 0))
    time_rect = time_text.get_rect(topleft=(tab + screen.get_width() // 2, (screen.get_height() // 4) + spacing))

    gname_text = font.render(gusername, True, (255, 0, 0))
    gname_rect = gname_text.get_rect(topleft=(tab + screen.get_width() // 2, (screen.get_height() // 4) + 2 * spacing))

    ghealth_text = font.render(f"Health : {gcar_health}", True, (255, 0, 0))
    ghealth_rect = ghealth_text.get_rect(topleft=(tab + screen.get_width() // 2, (screen.get_height() // 4) + 3 * spacing))

    ghit_text = font.render(f"Hits: {ghit}", True, (255, 0, 0))
    ghit_rect = ghit_text.get_rect(topleft=(tab + screen.get_width() // 2, (screen.get_height() // 4) + 4 * spacing))

    lobby_text = font.render(f"Press ENTER to go to lobby !! ", True, (255, 0, 0))
    lobby_rect = lobby_text.get_rect(topleft=(tab, (screen.get_height() // 4) + 5 * spacing))

    screen.fill((0, 0, 0))
    screen.blit(gameover_text, gameover_rect)
    screen.blit(state_text, state_rect)
    screen.blit(time_text, time_rect)
    screen.blit(name_text, name_rect)
    screen.blit(health_text, health_rect)
    screen.blit(hit_text, hit_rect)
    screen.blit(health_text, health_rect)
    screen.blit(gname_text, gname_rect)
    screen.blit(ghit_text, ghit_rect)
    screen.blit(ghealth_text, ghealth_rect)
    screen.blit(lobby_text, lobby_rect)
    pygame.display.flip()

    # Pause for 3 seconds so the player can see the game over screen
    pygame.time.wait(3000)
    mainserver_socket.send(f"Game_Finished {username} {gusername}\n".encode('utf-8'))
    pygame.quit()
    return True

def shift(n, pos):
    return (n + pos[0], pos[1])

def create_bullet(x, y):
    return {
        "rect": pygame.Rect(x - 5, y - 7, 10, 15),
        "speed": -10,
        "color": (255, 100, 0)
    }

def update_bullets(bullets):
    for bullet in bullets[:]:
        #This loop goes through each bullet in a copy of the bullets list. The [:] is used to safely remove bullets while looping.
        bullet["rect"].y += bullet["speed"]
        #This line moves the bullet up by changing its y position using the speed value.
        #Since speed is -10, the bullet moves upward.
        if bullet["rect"].bottom < 0:
            bullets.remove(bullet)
            #If the bullet is off-screen, it gets removed from the list so it’s no longer drawn or updated.

def draw_bullets(screen, bullets):
    for bullet in bullets:
        #This function draws all bullets on the screen.
        #screen is the game window where everything is shown.
        pygame.draw.rect(screen, bullet["color"], bullet["rect"])

def send_data(connection, car_pos, obstacles, aidkits, car_health, hit, invisible_timer, bullets, game_over_info=None, game_started=False, game_ended=False):
    data = {
        "car_pos_x": car_pos.x,
        "car_pos_y": car_pos.y,
        "obstacles": [],
        "aidkits":[],
        "health": car_health,
        "hits": hit,
        "game_over": game_over_info,
        "bullets": [],
        "invisible_timer": invisible_timer,
        "game_started": game_started,
        "game_ended": game_ended
    }
    for obstacle_image, obstacle_position, poison,choice in obstacles:
        data['obstacles'].append({
            "choice":choice,
            "pos_x": obstacle_position.x,
            "pos_y": obstacle_position.y,
            "width": obstacle_image.get_width(),
            "height":obstacle_image.get_height(),
            "poison": poison
        })
    for aidkit_image, aidkit_position in aidkits:
        data['aidkits'].append({
            "choice": "./images/first_aid.png",
            "pos_x": aidkit_position.x,
            "pos_y": aidkit_position.y,
            "width": aidkit_image.get_width(),
            "height": aidkit_image.get_height()
        })
    for bullet in bullets:
        data['bullets'].append({
            "x": bullet["rect"].x,
            "y": bullet["rect"].y,
            "width": bullet["rect"].width,
            "height": bullet["rect"].height,
            "speed": bullet["speed"],
            "color": bullet["color"]
        })
    message = "data:" + repr(data)#use repr instead of str bcz it serializes the dictionary into a string that preserves Python syntax
    try:
        connection.sendall(message.encode('utf-8'))
        return True
    except (socket.error, ConnectionResetError, BrokenPipeError):
        return False

def receive_data(connection):
    try:
        message = connection.recv(4096).decode('utf-8')
        if not message or not message.startswith("data:"):
            return None  #ignore non-gameplay messages
        return message.split("data:", 1)[1]
    except (socket.error, ConnectionResetError, BrokenPipeError):
        return None

ammo_image = None
def load_ammo_image():
    global ammo_image
    if ammo_image is None:
        ammo_image = pygame.image.load("./images/boxofamo.png").convert_alpha()
        ammo_image = pygame.transform.scale(ammo_image, (ammo_image.get_width() / 3, ammo_image.get_height() / 3))
    return ammo_image


car_images = {}
def load_car_image(path, scale=5):
    if path not in car_images:
        img = pygame.image.load(path).convert_alpha()
        car_images[path] = pygame.transform.scale(img, (img.get_width() / scale, img.get_height() / scale))
    return car_images[path]

gcar_images = {}
def load_gcar_image(path, scale=5):
    if path not in gcar_images:
        img = pygame.image.load(path).convert_alpha()
        gcar_images[path] = pygame.transform.scale(img, (img.get_width() / scale, img.get_height() / scale))
    return gcar_images[path]

background_img = None
def load_background_image(path, scale=2.3):
    global background_img
    if background_img is None:
        background = pygame.image.load(path)
        image_width, image_height = background.get_width(), background.get_height()
        background_img = pygame.transform.scale(background, (int(image_width / scale), int(image_height / scale)))
    return background_img

def start_race(connection, is_server, car, gcar, username, gusername, mainserver_socket):
    pygame.init()
    pygame.mixer.init()
    # background
    n = 2.3
    background_image_path = './images/bushroad.png'
    background = load_background_image(background_image_path, n)
    image_width = background.get_width()
    image_height = background.get_height()
    screen = pygame.display.set_mode((2 * image_width + 40, image_height + 40))
    pygame.display.set_caption("Neon Rush")

    # font
    f = './fonts/VCR_OSD_MONO_1.001.ttf'
    font = pygame.font.Font(f, 24)

    # music
    pygame.mixer.music.load("./music/retro-game-arcade-236133.mp3")
    pygame.mixer.music.play(-1)
    collision_sound = pygame.mixer.Sound("./music/retro-select-236670.mp3")
    aidkit_sound = pygame.mixer.Sound("./music/health_pickup_retro.wav")

    # time
    total_time = 120
    start_ticking = pygame.time.get_ticks()
    screen_width, screen_height = screen.get_size()
    difficulty_level = 2
    car_speed = 7
    car_health = 100


    bullet_count = 10
    drop_ammo_timer = 0
    ammo_boxes = []  # Also move ammo_boxes here


    #metrics
    bullets = []
    onscreen_obstacles = []
    choices=[]#to facilitate sending data
    drop_obstacle_timer = 0
    drop_obstacle_interval = 3 / difficulty_level# seconds
    onscreen_aidkit=[]
    drop_aid_kit_timer = 0
    drop_aid_kit_interval = 5*difficulty_level

    running = True
    clock = pygame.time.Clock()
    delta_time = 0.1
    hit = 0

    #other user metrics
    gcar_health = 100
    gonscreen_obstacles = []
    gonscreen_aidkit = []
    gbullets = []

    car_img = load_car_image(car)
    gcar_img = load_gcar_image(gcar)

    car_pos = car_img.get_rect(center=(int(screen_width / 4), int(screen_height - car_img.get_height())))
    gcar_pos = (20, 30)
    ghit = 0
    elapsed_time = 0

    game_over_sent = False # flag to prevent double sending of game over data

    invisible_timer = 0
    ginvisible_timer = 0

    ammo_image_loaded = load_ammo_image()
    drop_ammo_interval = 4


    # Send initial game started signal to the opponent (optional, but can be useful)
    send_data(connection, car_pos, onscreen_obstacles, onscreen_aidkit, car_health, hit, invisible_timer,bullets, game_started=True)
    while running:
        # main player screen
        screen_width, screen_height = screen.get_size()
        screen.fill((0, 0, 0))
        screen.blit(background, (0, 35))

        ### Other players updates ###
        screen.blit(background, (screen_width // 2, 35))
        if ginvisible_timer <= 0:
            screen.blit(gcar_img, shift(screen_width // 2, gcar_pos))
        for gaidkit_img_path, gaidkit_position in gonscreen_aidkit[:]:
            gaidkit_img = load_aid_kit_image() # Load the aid kit image
            gaidkit_position.y += 5 * difficulty_level  # Move aidkit downward

            if gaidkit_position.top > screen_height:  # If it goes off screen, remove it
                gonscreen_aidkit.remove((gaidkit_img_path, gaidkit_position))
            else:
                screen.blit(gaidkit_img, shift(screen_width // 2, gaidkit_position))
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and bullet_count > 0:
                    bullets.append(create_bullet(car_pos.centerx, car_pos.top))
                    bullet_count -= 1
        for gbullet in gbullets[:]:
            #pygame.draw.rect(screen, gbullet["color"], shift(screen_width // 2, gbullet["rect"]))
            offset_rect = gbullet["rect"].copy()
            offset_rect.x += screen_width // 2
            pygame.draw.rect(screen, gbullet["color"], offset_rect)
            #added
            gbullet["rect"].y += gbullet["speed"]
            if gbullet["rect"].bottom < 0:
                    gbullets.remove(gbullet)

        for gobstacle_path, gobstacle_position, gpoison in gonscreen_obstacles:#no need to use gpoison because we are already sending ghealth
            gobstacle_img = load_obstacle_image(gobstacle_path) # Load the obstacle image
            screen.blit(gobstacle_img, shift(screen_width // 2, gobstacle_position))

        # quiting
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        #player movement
        car_pos.y = screen_height - 1.15 * car_img.get_height()
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and car_pos.x > 40:
            car_pos.x -= car_speed
        if keys[pygame.K_RIGHT] and car_pos.x < (screen_width / 2) - 50 - car_img.get_width():
            car_pos.x += car_speed
            drop_obstacle_timer += delta_time #keep counting up how long it has been since we last dropped an ammo box
        if keys[pygame.K_a]:
           if car_pos.x > 40:
            car_pos.x -= car_speed
        if keys[pygame.K_d]:
          if car_pos.x < (screen_width/2) - 50 - car_img.get_width():
            car_pos.x += car_speed
        if drop_obstacle_timer >= drop_obstacle_interval:

            drop_obstacle_timer = 0
            new_obstacle, new_obstacle_position, new_poison, new_choice = create_obstacle(screen_width)
            onscreen_obstacles.append((new_obstacle, new_obstacle_position, new_poison, new_choice))

        drop_ammo_timer += delta_time #keep counting up how long it has been since we last dropped an ammo box
        if drop_ammo_timer >= drop_ammo_interval:
             #if the time reaches or passes the 5 seonds , we are ready to drop a new ammo box
             drop_ammo_timer = 0
             ammo_rect = ammo_image_loaded.get_rect(center=(random.randint(60, int(screen_width / 2 - 60)), 0))
             # This chooses a random x between 60 and half of the screen minus 60 to make sure that it doesn go too far off to the sides
             # This sets the y position to 0 , meaning the ammo starts at the top of the screen
             ammo_boxes.append((ammo_image_loaded, ammo_rect))


        update_bullets(bullets)
        for bullet in bullets[:]:
            for obstacle_img, obstacle_position, poison, choice in onscreen_obstacles[:]:
             if bullet["rect"].colliderect(obstacle_position):
                 bullets.remove(bullet)
                 onscreen_obstacles.remove((obstacle_img, obstacle_position, poison, choice))
                 break
            #whenever it collides the bullet disappear and the obstacle does too
        # spawning obstacles
        drop_obstacle_timer += delta_time
        if drop_obstacle_timer >= drop_obstacle_interval:
            drop_obstacle_timer = 0
            new_obstacle, new_obstacle_position, new_poison, new_choice = create_obstacle(screen_width)
            onscreen_obstacles.append((new_obstacle, new_obstacle_position, new_poison, new_choice))
        drop_aid_kit_timer += delta_time
        if drop_aid_kit_timer >= drop_aid_kit_interval:
            drop_aid_kit_timer = 0
            new_aid_kit, new_aid_kit_position = create_aid_kit(screen_width)
            onscreen_aidkit.append((new_aid_kit, new_aid_kit_position))

        # moving obstacles and checking for collision
        for obstacle_img, obstacle_position, poison, choice in onscreen_obstacles[:]:
            obstacle_position.y += 5 * difficulty_level
            if car_pos.colliderect(obstacle_position):
                car_health -= poison
                hit += 1
                collision_sound.play()
                collision_sound.set_volume(1)
                onscreen_obstacles.remove((obstacle_img, obstacle_position, poison, choice))
                invisible_timer = 0.5
                if car_health <= 0 and not game_over_sent:
                    game_over_sent = True
                    if car_health > gcar_health:
                        result = "LOSE"
                    elif car_health < gcar_health:
                        result = "WIN"
                    else:
                        result = "TIE"
                    game_over_info = {'car_health': car_health, 'gcar_health': gcar_health, 'username':username,'gusername':gusername, 'elapsed_time': elapsed_time, 'hit': hit, 'ghit': ghit, 'result': result} # Added result
                    send_data(connection, car_pos, onscreen_obstacles,onscreen_aidkit, car_health, hit,invisible_timer, bullets, game_over_info=game_over_info, game_ended=True)
                    if game_over(screen, car_health, gcar_health, username, gusername, elapsed_time, hit, ghit, result, mainserver_socket):
                        running = False
                        break
            elif obstacle_position.top > screen_height: # Remove obstacle if it goes off-screen
                onscreen_obstacles.remove((obstacle_img, obstacle_position, poison, choice))

        for aidkit_img, aidkit_position in onscreen_aidkit[:]:
            aidkit_position.y += 5*difficulty_level
            if car_pos.colliderect(aidkit_position):
                car_health += 10
                aidkit_sound.play()
                aidkit_sound.set_volume(1)
                onscreen_aidkit.remove((aidkit_img, aidkit_position))
                if car_health > 100:
                    car_health = 100
            elif aidkit_position.top > screen_height: # Remove aid kit if it goes off-screen
                onscreen_aidkit.remove((aidkit_img, aidkit_position))
        for ammo, ammo_rect in ammo_boxes[:]:
            ammo_rect.y += difficulty_level * 4
            screen.blit(ammo, ammo_rect)
            if car_pos.colliderect(ammo_rect):
                bullet_count += 3
                ammo_boxes.remove((ammo, ammo_rect))
            elif ammo_rect.top > screen_height: # Remove ammo box if it goes off-screen
                ammo_boxes.remove((ammo, ammo_rect))
        if not running:
            break

        # objects position updates
        if invisible_timer <= 0:
            screen.blit(car_img, car_pos)
        else:
            invisible_timer -= delta_time
        for obstacle_img, obstacle_position, poison, choice in onscreen_obstacles:
            screen.blit(obstacle_img, obstacle_position)
        for aidkit_img, aidkit_position in onscreen_aidkit:
            screen.blit(aidkit_img, aidkit_position)
        draw_bullets(screen, bullets)
        name1_text = font.render(f"{username} {car_health}", True, (255, 255, 255))
        name2_text = font.render(f"{gusername} {gcar_health}", True, (255, 255, 255))
        screen.blit(name1_text, (10, 10))
        screen.blit(name2_text, (screen_width // 2, 10))

        # time analysis
        delta_time = clock.tick(60) / 1000
        delta_time = max(0.001, min(0.1, delta_time))
        current_time = pygame.time.get_ticks()
        elapsed_time = (current_time - start_ticking) / 1000
        remaining_time = max(0, total_time - elapsed_time)
        if remaining_time <= 0 and not game_over_sent:
            game_over_sent = True
            if car_health > gcar_health:
                    result = "WIN"
            elif car_health < gcar_health:
                    result = "LOSE"
            else:
                    result = "TIE"
            ggame_over_info = {'car_health': car_health, 'gcar_health': gcar_health, 'username':username, 'gusername':gusername ,'elapsed_time': elapsed_time, 'hit': hit, 'ghit': ghit, 'result': result}
            send_data(connection, car_pos, onscreen_obstacles,onscreen_aidkit, car_health, hit,invisible_timer, gbullets, True)
            if game_over(screen, car_health, gcar_health, username, gusername,elapsed_time, hit, ghit, result,mainserver_socket):
                running = False
                break

        # time display
        timer_text = font.render(f"Time: {int(remaining_time)}", True, (255, 255, 255))
        screen.blit(timer_text, (screen_width - 130, 10))
        pygame.display.flip()

        send_data(connection, car_pos, onscreen_obstacles,onscreen_aidkit, car_health, hit,invisible_timer, bullets, False)
        message = receive_data(connection)
        if message is None:
            running = False
            game_over(screen, 0, gcar_health, username, gusername, elapsed_time, 0, ghit, "WIN", mainserver_socket)
            break

        elif message:
            import ast
            try:
                message = ast.literal_eval(message)
            except Exception as e:
                print("Peer-to-peer setup failed:", e)
                print("Bad message received:", message)
                continue  # Skip this frame and wait for the next good message

            if message.get("game_over"):
                game_over(screen, message["game_over"]["car_health"],
                                    message["game_over"]["gcar_health"],
                                    message["game_over"]["username"],
                                    message["game_over"]["gusername"],
                                    message["game_over"]["elapsed_time"],
                                    message["game_over"]["hit"],
                                    message["game_over"]["ghit"],
                                    message["game_over"]["result"],
                                    mainserver_socket)
                running = False
                continue

            gcar_pos = (message["car_pos_x"], message["car_pos_y"])
            gcar_health = message["health"]
            ghit = message["hits"]
            ginvisible_timer = message["invisible_timer"]
            gonscreen_obstacles = []
            for i in message["obstacles"]:
                image = i["choice"]
                position = pygame.Rect(i["pos_x"], i["pos_y"], i["width"], i["height"])
                poison = i["poison"]
                gonscreen_obstacles.append((image, position, poison))
            gonscreen_aidkit = []
            for i in message["aidkits"]:
                image = i["choice"]
                position = pygame.Rect(i["pos_x"], i["pos_y"], i["width"], i["height"])
                gonscreen_aidkit.append((image, position))
            gbullets = []
            for i in message.get("bullets", []):
                 gbullets.append({
                     "rect": pygame.Rect(i["x"], i["y"], i["width"], i["height"]),
                     "speed": i["speed"],
                     "color": tuple(i["color"])
                 })

    connection.close()
    return