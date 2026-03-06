/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { CallKitVoip } from '@techrover_solutions/capacitor-callkit-voip';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { NativeSettings, AndroidSettings } from 'capacitor-native-settings';

// Declare window for Cordova plugin access
declare global {
  interface Window {
    cordova: any;
  }
}

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const newLog = `${new Date().toLocaleTimeString()}: ${msg}`;
    setLogs(prev => [newLog, ...prev]);
    localStorage.setItem('logs', JSON.stringify([newLog, ...logs.slice(0, 49)]));
  };

  useEffect(() => {
    const savedLogs = localStorage.getItem('logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    // Initialize plugins
    PushNotifications.register();
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      addLog(`Push received: ${JSON.stringify(notification.data)}`);
      if (notification.data.type === 'test_call') {
        simulateAll();
      }
    });

    window.cordova?.plugins?.backgroundMode?.enable();
    KeepAwake.keepAwake().catch(e => addLog(`KeepAwake error: ${e}`));
    addLog('App initialized');
  }, []);

  const simulateAll = () => {
    addLog('Simulating all calls...');
    // Foreground Service
    ForegroundService.startForegroundService({
      title: 'Incoming Call',
      body: 'Incoming call from Test Service',
      id: 1,
      smallIcon: 'ic_stat_name'
    }).then(() => addLog('Foreground Service started')).catch(e => addLog(`Foreground Service error: ${e}`));

    // CallKit
    (CallKitVoip as any).displayIncomingCall({
      id: '123',
      name: 'Test Caller',
      handle: '1234567890'
    }).then(() => addLog('CallKit started')).catch(e => addLog(`CallKit error: ${e}`));
  };

  return (
    <div className="p-4 bg-zinc-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">VoIP Test Dashboard</h1>
      <div className="space-y-2 mb-4">
        <button onClick={simulateAll} className="bg-blue-600 p-2 rounded w-full">Simulate All</button>
        <button onClick={() => NativeSettings.openAndroid({ option: AndroidSettings.BatteryOptimization })} className="bg-zinc-700 p-2 rounded w-full">Request Battery Exemption</button>
      </div>
      <div className="bg-zinc-800 p-4 rounded h-64 overflow-y-auto font-mono text-xs">
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
}
