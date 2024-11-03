import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface Card {
  suit: string;
  rank: string;
}

interface GameState {
  playerHand: Card[];
  opponentHandCount: number;
  fieldCards: Card[];
  isMyTurn: boolean;
  roomId?: string;
  deckCount: number;
  trump?: Card;
  waitingForPeer: boolean;
  isReady: boolean;
  opponentReady: boolean;
  gameStarted: boolean;
}

interface GameContextType {
  createRoom: () => string;
  joinRoom: (roomId: string) => void;
  setReady: () => void;
  surrender: () => void;
  offerRematch: () => void;
  playCard: (card: Card) => void;
  gameState: GameState;
  isConnected: boolean;
  connectionError: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Определяем URL для WebSocket подключения
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = '8080';
  return `${protocol}//${host}:${port}/ws`;
};

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const MESSAGE_THROTTLE = 3000;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    opponentHandCount: 0,
    fieldCards: [],
    isMyTurn: false,
    deckCount: 36,
    waitingForPeer: true,
    isReady: false,
    opponentReady: false,
    gameStarted: false
  });

  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const currentRoomId = useRef<string>();
  const lastMessageTime = useRef<number>(0);

  const clearReconnectTimeout = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = undefined;
    }
  };

  const connect = useCallback((roomId: string) => {
    if (!roomId) return;

    const now = Date.now();
    if (now - lastMessageTime.current < MESSAGE_THROTTLE) {
      return;
    }
    lastMessageTime.current = now;

    try {
      if (socket?.readyState === WebSocket.OPEN && currentRoomId.current === roomId) {
        return;
      }

      if (socket) {
        socket.close();
      }

      currentRoomId.current = roomId;
      const wsUrl = `${getWebSocketUrl()}?room=${roomId}`;
      console.log('Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        clearReconnectTimeout();
        setGameState(prev => ({ ...prev, roomId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleGameUpdate(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event);
        setIsConnected(false);
        setSocket(null);

        if (!event.wasClean && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          setConnectionError(`Переподключение... Попытка ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS}`);
          
          clearReconnectTimeout();
          reconnectTimeout.current = setTimeout(() => {
            if (currentRoomId.current) {
              connect(currentRoomId.current);
            }
          }, RECONNECT_DELAY);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionError('Не удалось подключиться к серверу после нескольких попыток');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Ошибка подключения к серверу');
      };

      setSocket(ws);
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError('Не удалось установить соединение с сервером');
    }
  }, [socket]);

  const handleGameUpdate = (data: any) => {
    switch (data.type) {
      case 'gameState':
        setGameState(prev => ({
          ...prev,
          ...data.payload,
        }));
        break;
      case 'playerReady':
        setGameState(prev => ({
          ...prev,
          opponentReady: true
        }));
        break;
      case 'gameStarted':
        setGameState(prev => ({
          ...prev,
          gameStarted: true
        }));
        break;
      case 'error':
        setConnectionError(data.payload.message);
        break;
      case 'gameOver':
        console.log('Game over:', data.payload);
        break;
    }
  };

  const messageQueue = useRef<Array<{ type: string; payload?: any }>>([]);
  const isProcessingQueue = useRef(false);

  const processMessageQueue = useCallback(() => {
    if (!isProcessingQueue.current && messageQueue.current.length > 0 && socket?.readyState === WebSocket.OPEN) {
      const now = Date.now();
      if (now - lastMessageTime.current < MESSAGE_THROTTLE) {
        setTimeout(processMessageQueue, MESSAGE_THROTTLE - (now - lastMessageTime.current));
        return;
      }

      isProcessingQueue.current = true;
      const message = messageQueue.current.shift();
      
      if (message) {
        lastMessageTime.current = now;
        socket.send(JSON.stringify(message));
      }

      setTimeout(() => {
        isProcessingQueue.current = false;
        if (messageQueue.current.length > 0) {
          processMessageQueue();
        }
      }, MESSAGE_THROTTLE);
    }
  }, [socket]);

  const sendMessage = useCallback((type: string, payload?: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }

    messageQueue.current.push({ type, payload });
    processMessageQueue();
  }, [socket, processMessageQueue]);

  const createRoom = useCallback(() => {
    const roomId = Math.random().toString(36).substring(2, 9);
    connect(roomId);
    return roomId;
  }, [connect]);

  const joinRoom = useCallback((roomId: string) => {
    connect(roomId);
  }, [connect]);

  const setReady = useCallback(() => {
    sendMessage('ready');
    setGameState(prev => ({ ...prev, isReady: true }));
  }, [sendMessage]);

  const surrender = useCallback(() => {
    sendMessage('surrender');
  }, [sendMessage]);

  const offerRematch = useCallback(() => {
    sendMessage('rematch');
  }, [sendMessage]);

  const playCard = useCallback((card: Card) => {
    if (gameState.gameStarted) {
      sendMessage('playCard', { card });
    }
  }, [sendMessage, gameState.gameStarted]);

  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <GameContext.Provider value={{
      createRoom,
      joinRoom,
      setReady,
      surrender,
      offerRematch,
      playCard,
      gameState,
      isConnected,
      connectionError
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};