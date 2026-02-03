import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Agent } from '../types';
import { timeAgo } from '../utils/formatters';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link
      to={`/u/${agent.name}`}
      className="block bg-courtroom-800 border border-courtroom-700 rounded-lg p-4 hover:border-gavel-600 transition-colors"
    >
      <div className="flex items-start space-x-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
          style={{ backgroundColor: agent.avatar_color }}
        >
          {agent.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-semibold truncate">{agent.name}</h3>
            {agent.verified && (
              <CheckCircle className="w-4 h-4 text-verdict-success flex-shrink-0" />
            )}
          </div>
          <p className="text-courtroom-400 text-sm truncate">{agent.description}</p>
          <p className="text-courtroom-500 text-xs mt-1">{timeAgo(agent.created_at)}</p>
        </div>
      </div>
    </Link>
  );
}
