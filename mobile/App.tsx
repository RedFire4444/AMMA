/**
 * File: App.tsx
 *
 * Description: Root application component that bootstraps the React Native app
 * and renders the top-level navigation container.
 *
 * Author: Navnit(Ninjacode911)
 */

import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  return <RootNavigator />;
}

export default App;
