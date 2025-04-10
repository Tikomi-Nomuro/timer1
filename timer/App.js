import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from 'redux';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Actions
const START = 'START';
const STOP = 'STOP';
const RESET = 'RESET';
const TICK = 'TICK';
const SET_TIME = 'SET_TIME';
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const start = () => ({ type: START });
const stop = () => ({ type: STOP });
const reset = () => ({ type: RESET });
const tick = () => ({ type: TICK });
const setTime = (hours, minutes, seconds) => ({ type: SET_TIME, payload: { hours, minutes, seconds } });
const increment = () => ({ type: INCREMENT }); // Ação de incremento
const decrement = () => ({ type: DECREMENT }); // Ação de decremento

// Reducer
const initialState = { hours: 0, minutes: 0, seconds: 0, running: false, totalSeconds: 0 };
const timerReducer = (state = initialState, action) => {
  switch (action.type) {
    case START:
      return { ...state, running: true };
    case STOP:
      return { ...state, running: false };
    case RESET:
      return { ...state, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, running: false };
    case SET_TIME:
      const totalTimeInSeconds = action.payload.hours * 3600 + action.payload.minutes * 60 + action.payload.seconds;
      return { ...state, ...action.payload, totalSeconds: totalTimeInSeconds };
    case TICK:
      if (!state.running || state.totalSeconds <= 0) return state;

      const remainingTime = state.totalSeconds - 1;
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      const seconds = remainingTime % 60;

      return { ...state, hours, minutes, seconds, totalSeconds: remainingTime };
    case INCREMENT: 
      const incrementedTotalSeconds = state.totalSeconds + 1;
      const incrementedHours = Math.floor(incrementedTotalSeconds / 3600);
      const incrementedMinutes = Math.floor((incrementedTotalSeconds % 3600) / 60);
      const incrementedSeconds = incrementedTotalSeconds % 60;

      return { ...state, hours: incrementedHours, minutes: incrementedMinutes, seconds: incrementedSeconds, totalSeconds: incrementedTotalSeconds };
    case DECREMENT:
      if (state.totalSeconds > 0) {
        const decrementedTotalSeconds = state.totalSeconds - 1;
        const decrementedHours = Math.floor(decrementedTotalSeconds / 3600);
        const decrementedMinutes = Math.floor((decrementedTotalSeconds % 3600) / 60);
        const decrementedSeconds = decrementedTotalSeconds % 60;

        return { ...state, hours: decrementedHours, minutes: decrementedMinutes, seconds: decrementedSeconds, totalSeconds: decrementedTotalSeconds };
      }
      return state;
    default:
      return state;
  }
};

const store = createStore(timerReducer);


const Timer = () => {
  const { hours, minutes, seconds, running } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('0');

  useEffect(() => {
    let interval;
    if (running && (hours > 0 || minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else {
      clearInterval(interval);
    }

    
    return () => clearInterval(interval);
  }, [running, dispatch, hours, minutes, seconds]);

  const formatTime = (num) => String(num).padStart(2, '0');

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{`${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputHours}
          onChangeText={setInputHours}
          placeholder="H"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputMinutes}
          onChangeText={setInputMinutes}
          placeholder="M"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputSeconds}
          onChangeText={setInputSeconds}
          placeholder="S"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            dispatch(setTime(parseInt(inputHours) || 0, parseInt(inputMinutes) || 0, parseInt(inputSeconds) || 0))
          }>
          <Text style={styles.buttonText}>Definir Tempo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: running ? '#FFD700' : '#FFD700' }]} onPress={() => dispatch(running ? stop() : start())}>
          <Text style={styles.buttonText}>{running ? 'Pausar' : 'Iniciar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => dispatch(reset())}>
          <Text style={styles.buttonText}>Resetar</Text>
        </TouchableOpacity>

        {/* Botão de Incrementar */}
        <TouchableOpacity style={styles.button} onPress={() => dispatch(increment())}>
          <Text style={styles.buttonText}>Incrementar</Text>
        </TouchableOpacity>

        {/* Botão de Decrementar */}
        <TouchableOpacity style={styles.button} onPress={() => dispatch(decrement())}>
          <Text style={styles.buttonText}>Decrementar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Tela 1 - Tema Claro
const ScreenOne = ({ navigation }) => (
  <View style={styles.screenLight}>
    <Timer />
    <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ScreenTwo')}>
      <Text style={styles.navButtonText}>Tela 2</Text>
    </TouchableOpacity>
  </View>
);

// Tela 2 - Tema Escuro
const ScreenTwo = ({ navigation }) => (
  <View style={styles.screenDark}>
    <Timer />
    <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ScreenOne')}>
      <Text style={styles.navButtonText}>Tela 1</Text>
    </TouchableOpacity>
  </View>
);

const Stack = createStackNavigator();

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ScreenOne" component={ScreenOne} />
        <Stack.Screen name="ScreenTwo" component={ScreenTwo} />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    margin: 20,
    padding: 20,
    backgroundColor: '#657895',
    borderRadius: 10,
    width: '80%',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 12,
    margin: 5,
    width: 60,
    textAlign: 'center',
    fontSize: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    color: '#fff',
  },
  buttonContainer: {
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2E2E2E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 10,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    transition: 'background-color 0.3s ease',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
 
  screenLight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
  },
 
  screenDark: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
  },
  navButton: {
    marginTop: 20,
    backgroundColor: '#657895',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: 220,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
