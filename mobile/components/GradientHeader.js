import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GradientHeader = ({ title, rightButton, onRightPress }) => {
    return (
        <View style={styles.headerContainer}>
            {/* Il gradiente viene messo come sfondo assoluto */}
            <LinearGradient
                colors={['#FF6B00', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>

                {rightButton && (
                    <TouchableOpacity onPress={onRightPress}>
                        <Text style={styles.icon}>{rightButton}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: 40, // Gestisce meglio la barra di stato su mobile
        paddingBottom: 16,
        paddingHorizontal: 16,
        minHeight: 90,
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    icon: {
        fontSize: 20,
    }
});

export default GradientHeader;