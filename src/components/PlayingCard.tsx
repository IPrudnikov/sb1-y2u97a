import React from 'react';
import { motion } from 'framer-motion';

interface PlayingCardProps {
  suit?: string;
  rank?: string;
  isStack?: boolean;
  isDiscard?: boolean;
  isDraggable?: boolean;
  isOpponent?: boolean;
  onClick?: () => void;
}

const PlayingCard: React.FC<PlayingCardProps> = ({
  suit,
  rank,
  isStack,
  isDiscard,
  isDraggable,
  isOpponent,
  onClick
}) => {
  const cardStyle = isStack
    ? "relative w-20 h-32 bg-white rounded-lg shadow-xl border-2 border-gray-200"
    : "relative w-20 h-32 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow";

  const getCardColor = (suit?: string) => {
    return suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-gray-900';
  };

  const getRankDisplay = (rank?: string) => {
    switch (rank) {
      case 'A': return 'Т';
      case 'K': return 'К';
      case 'Q': return 'Д';
      case 'J': return 'В';
      default: return rank;
    }
  };

  return (
    <motion.div
      className={`${cardStyle} ${isDiscard ? 'opacity-70' : ''}`}
      whileHover={isDraggable ? { scale: 1.1, y: -10 } : {}}
      drag={isDraggable}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onClick={onClick}
    >
      {isStack || isOpponent ? (
        <div className={`absolute inset-0 rounded-lg ${isDiscard ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-red-700 to-red-900'}`}>
          <div className="absolute inset-2 border-4 border-double border-gold/30 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gold/30 rounded-full transform rotate-45" />
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-2 ${getCardColor(suit)}`}>
          <div className="absolute top-1 left-1 flex flex-col items-center">
            <div className="text-lg font-bold">{getRankDisplay(rank)}</div>
            <div className="text-xl">{suit}</div>
          </div>
          <div className="absolute bottom-1 right-1 flex flex-col items-center transform rotate-180">
            <div className="text-lg font-bold">{getRankDisplay(rank)}</div>
            <div className="text-xl">{suit}</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl">{suit}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlayingCard;