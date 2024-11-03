// ... остальной код остается без изменений ...

func startGame(game *Game) {
    game.mu.Lock()
    defer game.mu.Unlock()

    log.Println("Starting new game")
    
    // Сбрасываем состояние игры
    game.GameStarted = true
    game.Field = make([]Card, 0)
    game.Deck = createDeck()
    
    // Перемешиваем колоду
    rand.Shuffle(len(game.Deck), func(i, j int) {
        game.Deck[i], game.Deck[j] = game.Deck[j], game.Deck[i]
    })

    // Определяем козырь
    game.Trump = game.Deck[len(game.Deck)-1]
    log.Printf("Trump card: %v %v", game.Trump.Suit, game.Trump.Rank)

    // Раздаем по 6 карт каждому игроку
    for conn, player := range game.Players {
        player.Hand = make([]Card, 0)
        for i := 0; i < 6; i++ {
            if len(game.Deck) > 0 {
                card := game.Deck[0]
                game.Deck = game.Deck[1:]
                player.Hand = append(player.Hand, card)
            }
        }
        log.Printf("Player hand: %v", player.Hand)
    }

    // Выбираем случайного первого игрока
    players := make([]*websocket.Conn, 0, len(game.Players))
    for conn := range game.Players {
        players = append(players, conn)
    }
    game.TurnPlayer = players[rand.Intn(len(players))]

    // Отправляем обновленное состояние всем игрокам
    for conn := range game.Players {
        sendGameState(game, conn)
    }

    log.Println("Game started successfully")
}

func handleMessage(game *Game, conn *websocket.Conn, msg Message) {
    game.mu.Lock()
    defer game.mu.Unlock()

    switch msg.Type {
    case "ready":
        game.ReadyPlayers[conn] = true
        log.Printf("Player ready in room. Ready players: %d/%d", countReadyPlayers(game), len(game.Players))
        
        // Сначала отправляем обновление о готовности
        broadcastGameState(game)

        // Проверяем условия для начала игры
        if len(game.Players) == 2 && allPlayersReady(game) && !game.GameStarted {
            log.Printf("All players ready, starting game")
            game.mu.Unlock()
            startGame(game)
            game.mu.Lock()
        }

    // ... остальные case остаются без изменений ...
    }
}

func sendGameState(game *Game, conn *websocket.Conn) {
    player := game.Players[conn]
    var opponentCount int
    var opponentReady bool
    
    for c, p := range game.Players {
        if c != conn {
            opponentCount = len(p.Hand)
            opponentReady = game.ReadyPlayers[c]
            break
        }
    }

    state := GameState{
        PlayerHand:      player.Hand,
        OpponentCount:   opponentCount,
        FieldCards:      game.Field,
        IsMyTurn:        conn == game.TurnPlayer,
        DeckCount:       len(game.Deck),
        Trump:           game.Trump,
        WaitingForPeer:  len(game.Players) < 2,
        IsReady:         game.ReadyPlayers[conn],
        OpponentReady:   opponentReady,
        GameStarted:     game.GameStarted,
    }

    err := conn.WriteJSON(Message{
        Type:    "gameState",
        Payload: state,
    })
    if err != nil {
        log.Printf("Error sending game state: %v", err)
    } else {
        log.Printf("Sent game state to player. GameStarted: %v, IsMyTurn: %v, Cards in hand: %d", 
            state.GameStarted, state.IsMyTurn, len(state.PlayerHand))
    }
}

// ... остальной код остается без изменений ...