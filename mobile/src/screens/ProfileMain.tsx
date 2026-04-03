import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileMain = () => {
  return (
    <View style={styles.container}>
      <Text>ProfileMain</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default ProfileMain;
