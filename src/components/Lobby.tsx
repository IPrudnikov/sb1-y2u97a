import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';

const Lobby = () => {
  const [joinLink, setJoinLink] = useState('');
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useGame();

  const handleCreateRoom = () => {
    const roomId = createRoom();
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const roomId = joinLink.split('/').pop() || joinLink;
    if (roomId) {
      joinRoom(roomId);
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Дурак</h1>
        
        <div className="space-y-6">
          <button
            onClick={handleCreateRoom}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users size={20} />
            Создать комнату
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">или</span>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                Присоединиться по ссылке
              </label>
              <input
                type="text"
                id="link"
                value={joinLink}
                onChange={(e) => setJoinLink(e.target.value)}
                placeholder="Вставьте TEST TEST TEST ссылку или ID комнаты"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Присоединиться
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Lobby;