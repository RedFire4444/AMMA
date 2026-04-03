import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeMain = () => {
  return (
    <View style={styles.container}>
      <Text>HomeMain</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default HomeMain;
