import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayingCard from './PlayingCard';
import { useGame } from '../context/GameContext';

interface PlayerHandProps {
  isOpponent?: boolean;
  cards?: Array<{ suit: string; rank: string }>;
  cardCount?: number;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ isOpponent, cards = [], cardCount }) => {
  const { playCard, gameState } = useGame();

  const handleCardPlay = (card: { suit: string; rank: string }) => {
    if (!isOpponent && gameState.isMyTurn) {
      playCard(card);
    }
  };

  return (
    <div className="relative">
      <motion.div 
        className="flex space-x-[-2rem]"
        initial={{ y: isOpponent ? -100 : 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {isOpponent
            ? Array.from({ length: cardCount || 0 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlayingCard isOpponent={true} />
                </motion.div>
              ))
            : cards.map((card, index) => (
                <motion.div
                  key={`${card.suit}-${card.rank}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ originX: 0.5, originY: 1 }}
                >
                  <PlayingCard
                    suit={card.suit}
                    rank={card.rank}
                    isDraggable={gameState.isMyTurn}
                    onClick={() => handleCardPlay(card)}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PlayerHand;