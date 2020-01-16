import * as React from 'react';

import SwipeableViews from 'react-swipeable-views-native';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Post } from '../../models/Post';
import { Colors } from '../../styles';
import { ImageDataView } from './ImageDataView';
import { calculateImageDimensions } from '../../helpers/imageDataHelpers';

interface Props {
    post: Post;
    testID?: string;
}

export class Carousel extends React.PureComponent<Props, { index: number }> {
    public state = {
        index: 0,
    };

    public render() {
        const windowWidth = Dimensions.get('window').width;
        return (
            <View>
                <SwipeableViews onChangeIndex={this.handleChangeIndex}>
                    {this.props.post.images.map((image, index) => {
                        const { width, height } = calculateImageDimensions(image, windowWidth, windowWidth);
                        return (
                            <ImageDataView
                                testID={(image.uri || '') + index}
                                key={(image.uri || '') + index}
                                source={image}
                                style={{
                                    width: width,
                                    height: height,
                                }}
                            />
                        );
                    })}
                </SwipeableViews>
             <Pagination dots={this.props.post.images.length} index={this.state.index}/>
            </View>
        );
    }

    private handleChangeIndex = (index: number) => {
        this.setState({
            index,
        });
    }
}

const Pagination = (props: { index: number, dots: number }) => {
    const children = [];

    for (let i = 0; i < props.dots; i++) {
        const backgroundColor = i === props.index ? Colors.BRAND_PURPLE : Colors.LIGHT_GRAY;
        children.push(
            <View style={[styles.dot, { backgroundColor }]} key={i}/>
        );
    }
    return <View style={styles.pagination}>{children}</View>;
};

const styles = StyleSheet.create({
    pagination: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
    },
    dot: {
        backgroundColor: '#e4e6e7',
        height: 8,
        width: 8,
        borderRadius: 4,
        margin: 3,
    },
});
