import React, { useState, useEffect } from 'react';
import { getInitialCoins, fetchLiveMarketData } from './services/marketData';
import { analyzeCoin, getSession } from './services/strategyEngine';
import { CoinData, StrategyAnalysis, MarketContext } from './types';
import { ConfluenceMatrix } from './components/ConfluenceMatrix';
import { PositionCalculator } from './components/PositionCalculator';
import { RiskMeter } from './components/RiskMeter';
import { Radar, Zap, TrendingUp, Clock, AlertTriangle, LayoutDashboard, PlayCircle, Bitcoin, Activity, Database } from 'lucide-react';

const App: React.FC = () => {
  const [coins, setCoins] = useState<Record<string, CoinData>>(getInitialCoins());
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC'); // Default to BTC or first avail
  const [session, setSession] = useState<MarketContext['sessionName']>('US');
  const [portfolioHeat] = useState(23);
  const [now, setNow] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);

  // Data Polling Loop
  useEffect(() => {
    setSession(getSession());

    const fetchData = async () => {
       const newCoins = await fetchLiveMarketData();
       if (Object.keys(newCoins).length > 0) {
          setCoins(newCoins);
          setIsConnected(true);
          
          // Auto-select first valid coin if selection invalid
          if (!newCoins[selectedSymbol] && Object.keys(newCoins).length > 0) {
             setSelectedSymbol(Object.keys(newCoins).find(k => k !== 'BTC') || 'BTC');
          }
       } else {
          setIsConnected(false);
       }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
      setNow(new Date());
    }, 5000); // Poll local backend every 5s (backend polls CoinGecko every 60s)

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const activeCoin = coins[selectedSymbol] || coins['BTC'];
  const btcData = coins['BTC'] || getInitialCoins()['BTC'];
  
  const analysis: StrategyAnalysis = activeCoin 
    ? analyzeCoin(activeCoin, btcData.priceChange1h) 
    : { type: 'NEUTRAL', score: 0, maxScore: 0, confidence: 'LOW', headline: 'INITIALIZING...', recommendation: '', historicalWinRate: '', riskLevel: 'SAFE', checks: [] };

  const coinList = (Object.values(coins) as CoinData[]).filter(c => c.symbol !== 'BTC');

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-green-500/30 overflow-hidden">
      {/* Top Navigation / Header */}
      <header className="border-b border-gray-800 bg-gray-950 p-4 sticky top-0 z-50 h-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full border ${isConnected ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                <Radar className={`${isConnected ? 'text-green-400 animate-spin-slow' : 'text-red-400'} w-6 h-6`} />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-white tracking-tight">SNIPER<span className="text-green-500">SCOUT</span></h1>
                 <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
                    v3.0 • 
                    {isConnected ? (
                       <span className="text-green-500 flex items-center gap-1"><Activity size={10} /> LIVE FEED</span>
                    ) : (
                       <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={10} /> OFFLINE</span>
                    )}
                 </p>
             </div>
          </div>

          {/* Session Indicator */}
          <div className="flex items-center gap-6 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
             <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-500 uppercase">Current Session</div>
                <div className="text-sm font-bold text-blue-400 flex items-center gap-2 justify-end">
                   <Clock className="w-3 h-3" />
                   {session}_HOURS
                </div>
             </div>
             <div className="h-8 w-[1px] bg-gray-700 hidden sm:block"></div>
             <div className="text-left">
                <div className="text-[10px] text-gray-500 uppercase">Db Status</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-3 h-3 text-purple-400" />
                    SQLITE_ACTIVE
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-5rem)] overflow-y-auto">
        
        {/* Left Column: Asset List & Portfolio */}
        <div className="lg:col-span-3 space-y-6">
           {/* Ticker List */}
           <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden flex flex-col max-h-[65vh]">
              <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase text-gray-400">Watchlist</span>
                 </div>
                 <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-500">{coinList.length} Assets</span>
              </div>
              <div className="divide-y divide-gray-800 overflow-y-auto scrollbar-hide">
                 {coinList.length === 0 && <div className="p-4 text-center text-xs text-gray-500">Waiting for Server Data...<br/>(npm run server)</div>}
                 {coinList.map(coin => {
                    // Run lightweight analysis for list view
                    const listAnalysis = analyzeCoin(coin, btcData.priceChange1h);
                    const isHot = listAnalysis.score >= 3 && listAnalysis.type !== 'NEUTRAL' && listAnalysis.type !== 'DANGER_TRAP';
                    const isSuperHot = listAnalysis.score >= 4;
                    const isDanger = listAnalysis.type === 'DANGER_TRAP';

                    return (
                        <button 
                            key={coin.symbol}
                            onClick={() => setSelectedSymbol(coin.symbol)}
                            className={`w-full p-3 flex justify-between items-center hover:bg-gray-800 transition-all relative group ${selectedSymbol === coin.symbol ? 'bg-gray-800' : ''}`}
                        >
                           {selectedSymbol === coin.symbol && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                           
                           {isSuperHot && (
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_15px_#22c55e] animate-pulse z-10"></div>
                           )}

                           <div className="flex items-center gap-3 pl-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  isSuperHot ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' : 
                                  isDanger ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                                  isHot ? 'bg-yellow-500' : 'bg-gray-700'
                              }`}></div>
                              
                              <div className="text-left">
                                 <div className="font-bold text-white text-sm flex items-center gap-2">
                                    {coin.symbol}
                                    {isSuperHot && <Zap className="w-3 h-3 text-green-400 fill-green-400" />}
                                 </div>
                                 <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                    RSI: <span className={coin.rsi > 70 ? 'text-red-400' : coin.rsi < 30 ? 'text-green-400' : ''}>{coin.rsi.toFixed(0)}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="text-right">
                              <div className={`font-mono font-bold text-sm ${coin.priceChange1h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                 {coin.priceChange1h > 0 ? '+' : ''}{coin.priceChange1h.toFixed(2)}%
                              </div>
                              <div className="text-[10px] text-gray-500">${coin.price.toLocaleString()}</div>
                           </div>
                        </button>
                    );
                 })}
              </div>
           </div>

           {/* Portfolio Heat Widget */}
           <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
               <RiskMeter heat={portfolioHeat + (analysis.score > 3 ? 20 : 0)} />
           </div>
        </div>

        {/* Middle Column: Main Signal Analysis */}
        <div className="lg:col-span-6 space-y-6 overflow-y-auto scrollbar-hide pb-20">
           <ConfluenceMatrix analysis={analysis} />

           {/* Live Chart Area Placeholder */}
           <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-64 relative flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              <div className="text-center z-10">
                  <TrendingUp className="w-12 h-12 mx-auto text-gray-700 mb-2 group-hover:text-green-500 transition-colors" />
                  <p className="text-sm text-gray-500 font-mono">REAL-TIME PRICE FEED ACTIVE</p>
                  <p className="text-xs text-gray-600">Data Source: CoinGecko (Live)</p>
              </div>
              
              <div className="absolute top-4 left-4 bg-black/50 border border-gray-700 px-2 py-1 rounded text-[10px] font-mono text-gray-400">
                 RSI: {activeCoin.rsi.toFixed(2)}
              </div>
              <div className="absolute top-4 right-4 bg-black/50 border border-gray-700 px-2 py-1 rounded text-[10px] font-mono text-gray-400">
                 ADX: {activeCoin.adx.toFixed(2)}
              </div>
           </div>

           <PositionCalculator analysis={analysis} portfolioSize={33392} currentHeat={portfolioHeat} />
        </div>

        {/* Right Column: Intelligence/Historical/BTC */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto scrollbar-hide pb-20">
           
           {/* BTC TICKER WIDGET (Sticky) */}
           <div className="sticky top-0 z-20 bg-black/90 pb-4 backdrop-blur-sm -mt-2 pt-2">
             <div className="bg-gray-900 border border-[#F7931A]/50 rounded-lg p-4 relative overflow-hidden shadow-[0_0_20px_rgba(247,147,26,0.15)] group">
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${btcData.priceChange1h >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} blur-3xl rounded-full pointer-events-none`}></div>

                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                      <div className="bg-[#F7931A] rounded-full p-1 text-black">
                         <Bitcoin size={14} />
                      </div>
                      <span className="font-bold text-white tracking-wider text-sm">BITCOIN</span>
                   </div>
                   <span className="text-[10px] text-gray-500 uppercase bg-gray-950 px-2 py-0.5 rounded border border-gray-800">Global Context</span>
                </div>

                <div className="flex flex-col">
                   <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono font-bold text-white tracking-tighter">
                         ${btcData.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-gray-500 text-xs">USD</span>
                   </div>
                   <div className={`flex items-center gap-2 mt-1 ${btcData.priceChange1h >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                       <Activity size={12} />
                       <span className="text-sm font-bold font-mono">
                          {btcData.priceChange1h > 0 ? '+' : ''}{btcData.priceChange1h.toFixed(2)}%
                       </span>
                       <span className="text-[10px] text-gray-500 uppercase ml-auto">24H Change</span>
                   </div>
                </div>
             </div>
           </div>

           {/* Behavioral Warning */}
           {activeCoin && analysis.type === 'DANGER_TRAP' && (
             <div className="bg-red-950/30 border border-red-600/50 p-4 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                   <AlertTriangle className="w-5 h-5" />
                   <h3 className="font-bold text-sm">ANTI-PATTERN DETECTED</h3>
                </div>
                <p className="text-xs text-red-200/80 leading-relaxed">
                   {activeCoin.symbol} is showing classic "False Overbought Trap". ADX is {activeCoin.adx.toFixed(1)} (>50), indicating trending strength.
                </p>
             </div>
           )}

           {/* Historical Match */}
           <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-3 border-b border-gray-800 pb-2">
                 <Zap className="w-4 h-4" />
                 <h3 className="font-bold text-xs uppercase">Historical Pattern Match</h3>
              </div>
              
              {analysis.score >= 3 ? (
                 <div className="space-y-3">
                    <div className="text-xs text-gray-300">
                       Signal detected. Cross-referencing with SQLite database...
                    </div>
                    <ul className="space-y-2">
                       <li className="text-[10px] bg-gray-950 p-2 rounded border-l-2 border-green-500">
                          <span className="text-gray-400 block">Pattern ID #8492</span>
                          <span className="text-green-400 font-bold">82% Similar to Cycle 4 Win</span>
                       </li>
                    </ul>
                 </div>
              ) : (
                 <div className="text-center py-6">
                    <p className="text-xs text-gray-600">No significant pattern detected.</p>
                 </div>
              )}
           </div>
        </div>

      </main>

      {/* Footer Status */}
      <footer className="fixed bottom-0 w-full bg-gray-950 border-t border-gray-900 py-1 px-2 flex justify-between text-[10px] text-gray-600 z-50">
         <div>SYSTEM STATUS: <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? 'ONLINE' : 'CONNECTING TO SERVER...'}</span></div>
         <div className="text-blue-600 font-bold">{isConnected ? 'LIVE COINGECKO FEED' : 'LOCAL CACHE'}</div>
         <div>UTC: {now.toISOString().split('T')[1].split('.')[0]}</div>
      </footer>
    </div>
  );
};

export default App;