
import React, { useState, useEffect } from 'react';
import { getInitialCoins, fetchLiveMarketData } from './services/marketData';
import { analyzeCoin, getSession, getSessionBias } from './services/strategyEngine';
import { CoinData, StrategyAnalysis, MarketContext, CharacterProfile, Trade, ActivePosition } from './types';
import { ConfluenceMatrix } from './components/ConfluenceMatrix';
import { PositionCalculator } from './components/PositionCalculator';
import { CharacterSelector } from './components/CharacterSelector';
import { BehavioralWidget } from './components/BehavioralWidget';
import { ActiveTradeMonitor } from './components/ActiveTradeMonitor';
import { MarketPulse } from './components/MarketPulse';
import { SmartHints } from './components/SmartHints';
import { Radar, AlertTriangle, Activity, Database, Clock, LayoutDashboard, Zap, Bitcoin, User } from 'lucide-react';

const App: React.FC = () => {
  const [coins, setCoins] = useState<Record<string, CoinData>>(getInitialCoins());
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC'); 
  const [session, setSession] = useState<MarketContext['sessionName']>('US');
  const [now, setNow] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  
  // New State Features
  const [userProfile, setUserProfile] = useState<CharacterProfile>('burry');
  // Mock History Data for Behavioral Widget
  const [tradeHistory] = useState<Trade[]>([
      { id: '1', symbol: 'SOL', type: 'LONG', pnl: 125, timestamp: Date.now() - 10000000 },
      { id: '2', symbol: 'ETH', type: 'SHORT', pnl: 45, timestamp: Date.now() - 20000000 },
      { id: '3', symbol: 'BTC', type: 'SHORT', pnl: 12, timestamp: Date.now() - 30000000 },
      { id: '4', symbol: 'ADA', type: 'LONG', pnl: -15, timestamp: Date.now() - 40000000 },
      { id: '5', symbol: 'XRP', type: 'SHORT', pnl: 88, timestamp: Date.now() - 50000000 },
  ]);
  // Mock Active Positions for Heat Widget
  const [activePositions] = useState<ActivePosition[]>([
      { id: 'a1', symbol: 'ETH', type: 'SHORT', entryPrice: 2350, currentPrice: 2310, sizeUsd: 5000, leverage: 20, tpPrice: 2100, slPrice: 2450, liqPrice: 2500, ageMinutes: 45 }
  ]);

  // Data Polling Loop
  useEffect(() => {
    setSession(getSession());

    const fetchData = async () => {
       const newCoins = await fetchLiveMarketData();
       if (Object.keys(newCoins).length > 0) {
          setCoins(newCoins);
          setIsConnected(true);
          
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
    }, 5000); 

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const activeCoin = coins[selectedSymbol] || coins['BTC'];
  const btcData = coins['BTC'] || getInitialCoins()['BTC'];
  
  const analysis: StrategyAnalysis = activeCoin 
    ? analyzeCoin(activeCoin, btcData.priceChange1h) 
    : { type: 'NEUTRAL', score: 0, maxScore: 0, confidence: 'LOW', headline: 'INITIALIZING...', recommendation: '', riskLevel: 'SAFE', checks: [], signalTimestamp: 0 };

  const coinList = (Object.values(coins) as CoinData[]).filter(c => c.symbol !== 'BTC');
  
  // Calculate Heat
  const currentHeat = activePositions.length * 15; // Mock 15% per trade

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-green-500/30 overflow-hidden flex flex-col">
      
      {/* Top Navigation */}
      <header className="border-b border-gray-800 bg-gray-950 p-3 sticky top-0 z-50 h-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border ${isConnected ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                    <Radar className={`${isConnected ? 'text-green-400 animate-spin-slow' : 'text-red-400'} w-6 h-6`} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">SNIPER<span className="text-green-500">SCOUT</span></h1>
                    <p className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                        v3.1 • <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                    </p>
                </div>
             </div>
          </div>

          {/* Character Selector (Center) */}
          <div className="w-full lg:w-1/3">
             <CharacterSelector currentProfile={userProfile} onSelect={setUserProfile} />
          </div>

          {/* Session Info (Right) */}
          <div className="hidden lg:flex items-center gap-6 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
             <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase">Market Context</div>
                <div className="text-xs font-bold text-blue-400 flex items-center gap-2 justify-end">
                   <Clock className="w-3 h-3" />
                   {session}_HOURS
                </div>
                <div className="text-[9px] text-gray-600">{getSessionBias(session)}</div>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-2 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        
        {/* LEFT SIDEBAR: Lists & Pulse */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-full overflow-y-auto scrollbar-hide pb-10">
           <MarketPulse />
           
           {/* Watchlist */}
           <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden flex flex-col flex-1 min-h-[400px]">
              <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase text-gray-400">Live Signals</span>
                 </div>
                 <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-500">{coinList.length} Assets</span>
              </div>
              <div className="divide-y divide-gray-800 overflow-y-auto scrollbar-hide">
                 {coinList.map(coin => {
                    const listAnalysis = analyzeCoin(coin, btcData.priceChange1h);
                    const isHot = listAnalysis.score >= 3 && listAnalysis.type !== 'NEUTRAL' && listAnalysis.type !== 'DANGER_TRAP';
                    const isSuperHot = listAnalysis.score >= 4;
                    const isTrap = listAnalysis.type === 'DANGER_TRAP';
                    
                    // Filter based on profile? (Optional, currently showing all but highlighting)
                    
                    return (
                        <button 
                            key={coin.symbol}
                            onClick={() => setSelectedSymbol(coin.symbol)}
                            className={`w-full p-3 flex justify-between items-center hover:bg-gray-800 transition-all relative group ${selectedSymbol === coin.symbol ? 'bg-gray-800' : ''}`}
                        >
                           {selectedSymbol === coin.symbol && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                           {isSuperHot && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_15px_#22c55e] animate-pulse z-10"></div>}

                           <div className="flex items-center gap-3 pl-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  isSuperHot ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' : 
                                  isTrap ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                                  isHot ? 'bg-yellow-500' : 'bg-gray-700'
                              }`}></div>
                              
                              <div className="text-left">
                                 <div className="font-bold text-white text-sm flex items-center gap-2">
                                    {coin.symbol}
                                    {isSuperHot && <Zap className="w-3 h-3 text-green-400 fill-green-400" />}
                                 </div>
                                 <div className="text-[10px] text-gray-500 font-mono">
                                    RSI {coin.rsi.toFixed(0)} | ADX {coin.adx.toFixed(0)}
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
           
           <ActiveTradeMonitor positions={activePositions} portfolioHeat={currentHeat} />
        </div>

        {/* MIDDLE: Intelligence Matrix */}
        <div className="lg:col-span-6 space-y-4 overflow-y-auto scrollbar-hide pb-10">
           <ConfluenceMatrix analysis={analysis} />
           
           <div className="grid grid-cols-1 gap-4">
             <PositionCalculator 
                analysis={analysis} 
                portfolioSize={33392} 
                currentHeat={currentHeat}
                userProfile={
                    // Find full config object
                    ['g0d','burry','pnguin'].includes(userProfile) 
                    ? {
                        g0d: { id: 'g0d', name: 'g0d Mode', riskTolerance: 'AGGRESSIVE', leverageCap: 100 },
                        burry: { id: 'burry', name: 'Michael B.', riskTolerance: 'CONTRARIAN', leverageCap: 50 },
                        pnguin: { id: 'pnguin', name: 'Penguin', riskTolerance: 'CALCULATED', leverageCap: 40 }
                      }[userProfile] as any
                    : { id: 'burry', name: 'Default', riskTolerance: 'CONTRARIAN', leverageCap: 50 }
                }
             />
           </div>

           {analysis.type === 'DANGER_TRAP' && (
             <div className="bg-red-950/40 border border-red-600/50 p-6 rounded-lg animate-pulse text-center">
                <div className="flex justify-center text-red-500 mb-2"><AlertTriangle size={48} /></div>
                <h2 className="text-2xl font-bold text-white mb-2">TRAP DETECTED</h2>
                <p className="text-red-200">Do not short {activeCoin.symbol}. Momentum is too strong (ADX > 50).</p>
             </div>
           )}
        </div>

        {/* RIGHT SIDEBAR: Context & Psychology */}
        <div className="lg:col-span-3 space-y-4 h-full overflow-y-auto scrollbar-hide pb-10">
           
           {/* Sticky BTC */}
           <div className="bg-gray-900 border border-[#F7931A]/50 rounded-lg p-4 relative overflow-hidden shadow-[0_0_20px_rgba(247,147,26,0.1)]">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <div className="bg-[#F7931A] rounded-full p-1 text-black"><Bitcoin size={14} /></div>
                    <span className="font-bold text-white">BITCOIN</span>
                 </div>
                 <span className={`text-xs font-bold ${btcData.priceChange1h > 0 ? 'text-green-400' : 'text-red-500'}`}>
                    {btcData.priceChange1h > 0 ? '+' : ''}{btcData.priceChange1h.toFixed(2)}%
                 </span>
              </div>
              <div className="text-2xl font-mono font-bold text-white tracking-tighter">
                 ${btcData.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
           </div>

           <BehavioralWidget trades={tradeHistory} />
           
           <SmartHints btcChange={btcData.priceChange1h} />
           
           <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-xs text-gray-500 space-y-2">
              <div className="font-bold text-gray-400 mb-2 flex items-center gap-2">
                 <Database size={12} />
                 SYSTEM DIAGNOSTICS
              </div>
              <div className="flex justify-between"><span>API Latency</span><span className="text-green-500">42ms</span></div>
              <div className="flex justify-between"><span>DB Sync</span><span className="text-green-500">OK</span></div>
              <div className="flex justify-between"><span>Simulation Mode</span><span className="text-blue-500">{isConnected ? 'OFF' : 'ACTIVE'}</span></div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;
