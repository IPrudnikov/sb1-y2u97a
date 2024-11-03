import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/room/:roomId" element={<GameRoom />} />
          </Routes>
        </div>
      </div>
    </GameProvider>
  );
}

export default App;