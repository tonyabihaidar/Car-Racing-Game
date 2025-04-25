# FIBERACE

## 📽️ Project Video

Watch the gameplay and features overview here: [https://youtu.be/GqratfctyAk](https://youtu.be/GqratfctyAk)

---

## 🧑‍🤝‍🧑 Team Members

| Name             | Email                  | ID        | Contribution |
|------------------|------------------------|-----------|--------------|
| Majd Aboul Hosn  | mga56@mail.aub.edu     | 202403227 | 25%          |
| Tony Abi Haidar  | tga22@mail.aub.edu     | 202400089 | 25%          |
| Samer Barakat    | srb13@mail.aub.edu     | 202401785 | 25%          |
| Serena Stephan   | sjs37@mail.aub.edu     | 202402011 | 25%          |

---

## 🕹️ Feature Overview

| Feature                 | Description                                                                 | Status |
|-------------------------|-----------------------------------------------------------------------------|--------|
| Health System           | Health varies based on collision, displayed on top                         | ✅     |
| Multiplayer View        | Two-player split-screen gameplay                                           | ✅     |
| Multiple Obstacles      | Obstacles with different damage levels                                     | ✅     |
| Aid Kit                 | Collectible to restore health                                              | ✅     |
| Background Music        | Looping music during gameplay                                              | ✅     |
| Car Movement            | Smooth control with A/D or arrow keys                                      | ✅     |
| Ammo Boxes              | Collect to increase bullet count                                           | ✅     |
| Game Difficulty         | Partially implemented speed scaling                                        | ⚠️     |
| Game Over Logic         | Displays win/loss conditions                                               | ✅     |
| Shooting                | Space to shoot and destroy obstacles                                       | ✅     |
| Sound of Collision      | Collision sound effect plays                                               | ✅     |
| Multiple Cars           | Choose from 16 car colors                                                  | ✅     |
| Choose Opponent         | Request online players to race                                             | ✅     |
| Email Verification      | Email verification via SMTP                                                | ✅     |
| Password Encryption     | Hashed with bcrypt                                                         | ✅     |
| Account Management      | Name change, reset stats, delete account                                   | ✅     |

---

## ⚙️ Implementation Details

### 1. Database and Programming Approach
- Functional programming style
- Server-only DB access for security
- Password hashing with `bcrypt`
- `database.py` handles DB functions like credential creation, stats, leaderboards, etc.

### 2. Server Architecture
- Uses custom string format with rare separator (`***`)
- Messages define logic flow and data transmission

### 3. Email Verification
- Uses Python’s `smtplib` with Gmail app password
- Verification via code sent on signup

### 4. Music Management
- Background music stops with `pygame.mixer.music.stop()` on game over

### 5. Opponent Selection
- List of available, pending, accepted/declined players with UI interactivity
- Peer-to-peer confirmation before starting game

### 6. Multiplayer View
- Split-screen layout with mirrored environment
- Health, names, and timer at top

### 7. Health System
- Each obstacle has damage ("poison") value
- Health deducted on collision
- `getpoison()` fetches damage
- Triggers `game_over()` when health ≤ 0

### 8. Car Movement
- Controlled via arrow keys or A/D
- Limits prevent car from leaving screen

### 9. Collision Sound
- `pygame.mixer.Sound()` plays effect upon collision

### 10. Shooting
- Press spacebar to shoot
- Bullets move upward and destroy obstacles

### 11. Ammo Boxes
- Spawned periodically
- Colliding adds 3 bullets

### 12. Game Difficulty
- Partially scales obstacle speed (n)

### 13. Game Over Logic
- Triggers when health=0 or timer ends
- Displays stats, winner logic, plays sound

### 14. Car Customization
- Garage page to choose car from 16 colors

### 15. Network Connections
- TCP peer-to-peer for game data
- Main server assigns roles and facilitates matchmaking

### 16. Real-Time Game State Sync
- Live player state sharing each frame
- Asset caching for performance

---

## 👥 Individual Contributions

### Majd Aboul Hosn
- PyQt GUI: Sign-in, Sign-up, Garage, Leaderboard, Main menu
- Online players page, shooting, ammo UI
- Project Report

### Serena Stephan
- PyQt page integration
- Server-client functions and peer-to-peer setup
- Game state communication

### Tony Abi Haidar
- Game logic: Music, movement, obstacles
- Email verification
- UI responsiveness
- Project video

### Samer Barakat
- Frontend UI styling (PyQt)
- Navigation and layout
- SQLite DB functions
- GameOver UI (pygame), stats, settings
- Bcrypt password encryption
- Integration and debugging