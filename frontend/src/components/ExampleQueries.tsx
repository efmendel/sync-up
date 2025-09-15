'use client';

interface ExampleQueriesProps {
  onQuerySelect: (query: string) => void;
}

export default function ExampleQueries({ onQuerySelect }: ExampleQueriesProps) {
  const examples = [
    {
      icon: "🎤",
      title: "Female Vocalist",
      query: "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse",
      description: "Soul singer in Brooklyn"
    },
    {
      icon: "🎸",
      title: "Bass Player",
      query: "looking for a bass player in williamsburg for session work, preferably someone who sounds like flea",
      description: "Funk bassist for sessions"
    },
    {
      icon: "🥁",
      title: "Indie Drummer",
      query: "drummer needed for indie rock band in lower east side, must be available 3 times a week",
      description: "Rock drummer for band"
    },
    {
      icon: "🎹",
      title: "Jazz Pianist",
      query: "seeking a jazz pianist in manhattan for duo collaboration with evening rehearsals",
      description: "Piano duo partner"
    },
    {
      icon: "🎻",
      title: "Classical Violinist",
      query: "looking for a classical violinist for chamber music collaboration in brooklyn",
      description: "Chamber music ensemble"
    },
    {
      icon: "🎷",
      title: "Saxophonist",
      query: "need a saxophonist for latin jazz project in queens, professional level preferred",
      description: "Latin jazz project"
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          💡 Try these example searches
        </h3>
        <p className="text-white/80 text-sm">
          Click any example to see how our AI understands natural language
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onQuerySelect(example.query)}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {example.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white mb-1 group-hover:text-blue-200 transition-colors">
                  {example.title}
                </h4>
                <p className="text-white/70 text-sm mb-2 leading-relaxed">
                  {example.description}
                </p>
                <div className="text-xs text-white/50 truncate">
                  "{example.query}"
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-white/60">Click to try →</span>
              <div className="w-4 h-4 border border-white/40 rounded-full flex items-center justify-center group-hover:border-white/80 transition-colors">
                <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors"></div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}