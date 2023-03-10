import 'react-native-gesture-handler';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {LogBox, SafeAreaView, useColorScheme, View} from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {createStackNavigator, useHeaderHeight} from '@react-navigation/stack';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {StreamChat} from 'stream-chat';
import {
  Channel,
  ChannelList,
  Chat,
  MessageInput,
  MessageList,
  OverlayProvider,
  Streami18n,
  Thread,
  useAttachmentPickerContext,
} from 'stream-chat-react-native';

import {useStreamChatTheme} from './useStreamChatTheme';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

LogBox.ignoreAllLogs(true);

const chatClient = StreamChat.getInstance('yjrt5yxw77ev');
const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidG9tbWFzbyJ9.sfDKQ5peCwo0oObPDo-AFKauqv5uYbesukOOLpKaDOQ';
const user = {
  id: 'tommaso',
};

const filters = {
  type: 'messaging',
};
const sort = {last_message_at: -1};
const options = {
  state: true,
  watch: true,
};

/**
 * Start playing with streami18n instance here:
 * Please refer to description of this PR for details: https://github.com/GetStream/stream-chat-react-native/pull/150
 */
const streami18n = new Streami18n({
  language: 'en',
});

const ChannelListScreen = ({navigation}) => {
  const {setChannel} = useContext(AppContext);

  const memoizedFilters = useMemo(() => filters, []);

  return (
    <Chat client={chatClient} i18nInstance={streami18n}>
      <View style={{height: '100%'}}>
        <ChannelList
          filters={memoizedFilters}
          onSelect={channel => {
            setChannel(channel);
            navigation.navigate('Channel');
          }}
          options={options}
          sort={sort}
        />
      </View>
    </Chat>
  );
};

const ChannelScreen = ({navigation}) => {
  const {channel, setThread, thread} = useContext(AppContext);

  return (
    <SafeAreaView>
      <Chat client={chatClient} i18nInstance={streami18n}>
        <Channel channel={channel} thread={thread}>
          <View style={{flex: 1}}>
            <MessageList
              onThreadSelect={thread => {
                setThread(thread);
                navigation.navigate('Thread');
              }}
            />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

const ThreadScreen = () => {
  const {channel, setThread, thread} = useContext(AppContext);
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaView>
      <Chat client={chatClient} i18nInstance={streami18n}>
        <Channel
          channel={channel}
          keyboardVerticalOffset={headerHeight}
          thread={thread}
          threadList>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-start',
            }}>
            <Thread onThreadDismount={() => setThread(null)} />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

const AppContext = React.createContext();

const App = () => {
  const colorScheme = useColorScheme();
  const {bottom} = useSafeAreaInsets();
  const theme = useStreamChatTheme();

  const [channel, setChannel] = useState();
  const [clientReady, setClientReady] = useState(false);
  const [thread, setThread] = useState();

  useEffect(() => {
    const setupClient = async () => {
      await chatClient.connectUser(user, userToken);

      setClientReady(true);
    };

    setupClient();
  }, []);

  return (
    <NavigationContainer
      theme={{
        colors: {
          ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme).colors,
          background: theme.colors?.white_snow || '#FCFCFC',
        },
        dark: colorScheme === 'dark',
      }}>
      <AppContext.Provider value={{channel, setChannel, setThread, thread}}>
        <GestureHandlerRootView style={{flex: 1}}>
          <OverlayProvider
            bottomInset={bottom}
            i18nInstance={streami18n}
            translucentStatusBar
            value={{style: theme}}>
            {clientReady && (
              <Stack.Navigator
                initialRouteName="ChannelList"
                screenOptions={{
                  headerTitleStyle: {alignSelf: 'center', fontWeight: 'bold'},
                }}>
                <Stack.Screen
                  component={ChannelScreen}
                  name="Channel"
                  options={() => ({
                    headerBackTitle: 'Back',
                    headerRight: () => <></>,
                    headerTitle: channel?.data?.name,
                  })}
                />
                <Stack.Screen
                  component={ChannelListScreen}
                  name="ChannelList"
                  options={{headerTitle: 'Channel List'}}
                />
                <Stack.Screen
                  component={ThreadScreen}
                  name="Thread"
                  options={() => ({headerLeft: () => <></>})}
                />
              </Stack.Navigator>
            )}
          </OverlayProvider>
        </GestureHandlerRootView>
      </AppContext.Provider>
    </NavigationContainer>
  );
};

export default () => {
  const theme = useStreamChatTheme();
  return (
    <SafeAreaProvider
      style={{backgroundColor: theme.colors?.white_snow || '#FCFCFC'}}>
      <App />
    </SafeAreaProvider>
  );
};
