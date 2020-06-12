import * as React from 'react';
import { StyleSheet, View, Linking } from 'react-native';

import Markdown from 'react-native-markdown-display';
import { ErrorBoundary } from '../misc/ErrorBoundary';

export const CardMarkdown = (props: { text: string }) => (
    <ErrorBoundary>
        <View style={styles.markdownStyle}>
            <Markdown>{props.text}</Markdown>
        </View>
    </ErrorBoundary>
);

const styles = StyleSheet.create({
    markdownStyle: {
        marginBottom: 10,
        marginHorizontal: 10,
    },
});
