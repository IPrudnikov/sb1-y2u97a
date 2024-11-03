import React from 'react';
import { motion } from 'framer-motion';
import PlayingCard from './PlayingCard';

interface GameFieldProps {
  cards: Array<{ suit: string; rank: string }>;
}

const GameField: React.FC<GameFieldProps> = ({ cards }) => {
  // Группируем карты по парам (атака/защита)
  const cardPairs = [];
  for (let i = 0; i < cards.length; i += 2) {
    cardPairs.push({
      attack: cards[i],
      defense: cards[i + 1]
    });
  }

  return (
    <motion.div 
      className="relative w-[600px] h-[300px] bg-green-700/50 rounded-3xl border-4 border-green-600/30 backdrop-blur-sm flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-3 gap-8 p-4">
        {cardPairs.map((pair, index) => (
          <div key={index} className="relative h-32">
            {/* Атакующая карта */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlayingCard 
                suit={pair.attack.suit} 
                rank={pair.attack.rank}
              />
            </motion.div>

            {/* Защищающаяся карта (если есть) */}
            {pair.defense && (
              <motion.div
                className="absolute top-0 left-4 transform rotate-12"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <PlayingCard 
                  suit={pair.defense.suit} 
                  rank={pair.defense.rank}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default GameField;