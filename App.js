import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import PickupTrashScreen from './src/screens/PickupTrashScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReportTrashScreen from './src/screens/ReportTrashScreen';
import TrashDetailScreen from './src/screens/TrashDetailScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = 'home'; // Default icon
        
        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Report':
            iconName = 'report-problem';
            break;
          case 'Pickup':
            iconName = 'cleaning-services';
            break;
          case 'Profile':
            iconName = 'person';
            break;
        }
        
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Report" component={ReportTrashScreen} />
    <Tab.Screen name="Pickup" component={PickupTrashScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="TrashDetail" component={TrashDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => (
  <Provider store={store}>
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  </Provider>
);

export default App;