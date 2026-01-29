import React, { createContext, useContext } from 'react';
import { SharedValue, useSharedValue, withTiming } from 'react-native-reanimated';

type TabBarContextType = {
    tabBarTranslateY: SharedValue<number>;
    hideTabBar: () => void;
    showTabBar: () => void;
};

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const tabBarTranslateY = useSharedValue(0);

    const hideTabBar = () => {
        'worklet';
        tabBarTranslateY.value = withTiming(100, { duration: 300 });
    };

    const showTabBar = () => {
        'worklet';
        tabBarTranslateY.value = withTiming(0, { duration: 300 });
    };

    return (
        <TabBarContext.Provider value={{ tabBarTranslateY, hideTabBar, showTabBar }}>
            {children}
        </TabBarContext.Provider>
    );
};

export const useTabBar = () => {
    const context = useContext(TabBarContext);
    if (!context) {
        throw new Error('useTabBar must be used within a TabBarProvider');
    }
    return context;
};
