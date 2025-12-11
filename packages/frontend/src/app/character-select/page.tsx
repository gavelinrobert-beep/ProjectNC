'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { characterAPI } from '@/lib/api';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

export default function CharacterSelectPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const data = await characterAPI.getCharacters();
      setCharacters(data);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = (character: Character) => {
    localStorage.setItem('selectedCharacter', JSON.stringify(character));
    router.push('/game');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Select Character</h1>

        {showCreate ? (
          <CreateCharacterForm
            onCreated={(newChar) => {
              setCharacters([...characters, newChar]);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {characters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border-2 border-gray-700 hover:border-blue-500"
                >
                  <h3 className="text-2xl font-bold mb-2">{char.name}</h3>
                  <p className="text-gray-400">Level {char.level} {char.race} {char.class}</p>
                </div>
              ))}

              {characters.length < 10 && (
                <div
                  onClick={() => setShowCreate(true)}
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600 hover:border-green-500 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">+</div>
                    <div className="text-lg">Create Character</div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Back to Main Menu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CreateCharacterForm({
  onCreated,
  onCancel,
}: {
  onCreated: (char: Character) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [race, setRace] = useState('HUMAN');
  const [charClass, setCharClass] = useState('WARRIOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const races = ['HUMAN', 'ELF', 'DWARF', 'ORC'];
  const classes = ['WARRIOR', 'MAGE', 'ROGUE', 'PRIEST'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newChar = await characterAPI.createCharacter({
        name,
        race,
        class: charClass,
      });
      onCreated(newChar);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Create New Character</h2>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">Character Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
            minLength={2}
            maxLength={20}
            pattern="[a-zA-Z]+"
          />
          <p className="text-sm text-gray-400 mt-1">Letters only, 2-20 characters</p>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Race</label>
          <div className="grid grid-cols-4 gap-4">
            {races.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRace(r)}
                className={`px-4 py-3 rounded font-semibold transition-colors ${
                  race === r
                    ? 'bg-blue-600 border-2 border-blue-400'
                    : 'bg-gray-700 border-2 border-gray-600 hover:border-gray-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Class</label>
          <div className="grid grid-cols-4 gap-4">
            {classes.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCharClass(c)}
                className={`px-4 py-3 rounded font-semibold transition-colors ${
                  charClass === c
                    ? 'bg-green-600 border-2 border-green-400'
                    : 'bg-gray-700 border-2 border-gray-600 hover:border-gray-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Character'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
