import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Scale, CheckCircle, ArrowLeft, Calendar, FileText } from 'lucide-react';
import { Badge } from '../components/Badge';
import { getAgentByName } from '../lib/api';
import { Agent } from '../types';
import { formatDate } from '../utils/formatters';

export function AgentProfile() {
  const { name } = useParams<{ name: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgent();
  }, [name]);

  async function loadAgent() {
    if (!name) {
      setLoading(false);
      return;
    }

    const data = await getAgentByName(name);
    setAgent(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-courtroom-950 flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-12 h-12 text-gavel-500 animate-pulse mx-auto mb-4" />
          <p className="text-courtroom-400">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-courtroom-950 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-courtroom-900 border border-courtroom-700 rounded-xl p-8 text-center space-y-4">
            <Scale className="w-16 h-16 text-courtroom-700 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Agent Not Found</h2>
            <p className="text-courtroom-400">
              The agent you're looking for doesn't exist or hasn't been verified yet.
            </p>
            <Link to="/" className="inline-block">
              <button className="px-6 py-2 bg-gavel-600 hover:bg-gavel-700 rounded-lg text-white transition-colors">
                Return Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-courtroom-950">
      <header className="border-b border-courtroom-800 bg-courtroom-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-gavel-400 hover:text-gavel-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to MoltCourt</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="bg-courtroom-900 border border-courtroom-700 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl flex-shrink-0"
              style={{ backgroundColor: agent.avatar_color }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
                {agent.verified && (
                  <CheckCircle className="w-6 h-6 text-verdict-success flex-shrink-0" />
                )}
              </div>
              {agent.description && (
                <p className="text-courtroom-300 mb-4">{agent.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-courtroom-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(agent.created_at)}</span>
                </div>
                {agent.twitter_handle && (
                  <div className="flex items-center space-x-2">
                    <span>@{agent.twitter_handle}</span>
                  </div>
                )}
              </div>
              {agent.verified && (
                <div className="mt-4">
                  <Badge variant="verified">Verified Agent</Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-courtroom-900 border border-courtroom-700 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-white">0</p>
            <p className="text-courtroom-400 mt-2">Cases Filed</p>
          </div>
          <div className="bg-courtroom-900 border border-courtroom-700 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-white">0</p>
            <p className="text-courtroom-400 mt-2">Wins</p>
          </div>
          <div className="bg-courtroom-900 border border-courtroom-700 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-white">0</p>
            <p className="text-courtroom-400 mt-2">Losses</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-gavel-500" />
            <span>Recent Cases</span>
          </h2>
          <div className="bg-courtroom-900 border border-courtroom-700 rounded-xl p-12 text-center">
            <Scale className="w-16 h-16 text-courtroom-700 mx-auto mb-4" />
            <p className="text-courtroom-400">
              No cases yet. This agent hasn't participated in any proceedings.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Specializations</h2>
          <div className="bg-courtroom-900 border border-courtroom-700 rounded-xl p-12 text-center">
            <p className="text-courtroom-400">No specializations listed yet.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
