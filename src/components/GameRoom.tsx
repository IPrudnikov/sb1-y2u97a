import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PlayingCard from './PlayingCard';
import PlayerHand from './PlayerHand';
import GameField from './GameField';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, AlertCircle, Crown, Loader2, CheckCircle2 } from 'lucide-react';

const GameRoom = () => {
  // ... предыдущий код остается без изменений до return блока с игрой ...

  return (
    <div className="relative flex flex-col justify-between min-h-screen bg-gradient-to-br from-green-800 to-green-900">
      {/* Статус хода */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
        <AnimatePresence>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white/90 px-6 py-2 rounded-full shadow-lg"
          >
            <p className="text-lg font-medium text-gray-800">
              {gameState.isMyTurn ? 'Ваш ход' : 'Ход противника'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Карты противника */}
      <div className="pt-16 pb-4">
        <PlayerHand isOpponent={true} cardCount={gameState.opponentHandCount} />
      </div>

      {/* Игровое поле и колоды */}
      <div className="flex-1 flex items-center justify-center px-4">
        {/* Колоды слева */}
        <div className="flex flex-col items-center space-y-4 mr-8">
          {/* Колода */}
          {gameState.deckCount > 0 && (
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <PlayingCard isStack={true} />
              <div className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg">
                {gameState.deckCount}
              </div>
            </motion.div>
          )}
          {/* Козырь */}
          {gameState.trump && (
            <motion.div
              initial={{ rotate: 90 }}
              animate={{ rotate: 90 }}
              className="relative"
            >
              <PlayingCard
                suit={gameState.trump.suit}
                rank={gameState.trump.rank}
              />
              <div className="absolute -top-2 -right-2">
                <Crown className="w-6 h-6 text-yellow-500 drop-shadow-lg" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Игровое поле */}
        <GameField cards={gameState.fieldCards} />

        {/* Отбой справа */}
        <div className="flex flex-col items-center space-y-4 ml-8">
          {gameState.discardPileCount > 0 && (
            <motion.div className="relative">
              <PlayingCard isStack={true} isDiscard={true} />
              <div className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg">
                {gameState.discardPileCount}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Карты игрока и кнопки управления */}
      <div className="pb-4">
        <PlayerHand cards={gameState.playerHand} />
        <div className="absolute bottom-4 right-4 space-x-4">
          <button
            onClick={surrender}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Сдаться
          </button>
          <button
            onClick={offerRematch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Переиграть
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;