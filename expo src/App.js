import Home from "./src/Home";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PoolsPage } from "./src/PoolsPage";
import { TokensPage } from "./src/TokensPage";
import { SwapTokenContextProvider } from "./src/SwapContext";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SwapTokenContextProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Swap" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Tokens" component={TokensPage} options={{ headerShown: false }} />
          <Stack.Screen name="Pools" component={PoolsPage} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SwapTokenContextProvider>
  );
};

export default App;

// [ ] - if wrong network tell user (7700)
// [ ] - local icons (to avoid loading time)
