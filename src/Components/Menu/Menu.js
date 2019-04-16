import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, View, Easing, Platform } from 'react-native';
import withTheme from '../../Theme/withTheme';
import styles from './Menu.styles';
import Modal from 'modal-react-native-web';

class Menu extends Component {
  static propTypes = {
    button: PropTypes.node,
    children: PropTypes.node,
    onHidden: PropTypes.func,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    visible: PropTypes.bool,
    menuStyle: PropTypes.object,
    sameWidth: PropTypes.bool,
  };

  state = {
    menuHeight: new Animated.Value(0),
    menuWidth: new Animated.Value(0),
    opacity: new Animated.Value(0),
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    animationDuration: 300,
  };

  componentDidUpdate(prevProps) {
    const { visible } = this.props;
    if (visible !== prevProps.visible) {
      this.toggle();
    }
  }

  onButtonLayout = e => {
    const { width, height } = e.nativeEvent.layout;

    let { locationX, locationY } = e.nativeEvent;

    if (Platform.OS === 'web') {
      locationX = e.nativeEvent.target.getBoundingClientRect().x;
      locationY = e.nativeEvent.target.getBoundingClientRect().y;
    }

    this.setState({
      buttonWidth: width,
      buttonHeight: height,
      buttonPositionX: locationX,
      buttonPositionY: locationY,
    });
  };

  onMenuLayout = e => {
    const { width, height } = e.nativeEvent.layout;

    this.setState({
      initialWidth: width,
      initialHeight: height,
    });
  };

  toggle() {
    const {
      initialHeight,
      initialWidth,
      easing,
      animationDuration,
      buttonWidth,
    } = this.state;

    if (!initialHeight || !initialWidth) {
      setTimeout(() => this.toggle(), 100);
      return;
    }

    const { sameWidth } = this.props;

    const widthType = sameWidth ? buttonWidth : initialWidth;

    let opacity = 1;
    let height = initialHeight + 24;
    let width = widthType + 24;

    if (!this.props.visible) {
      opacity = 0;
      height = 0;
      width = 0;
    }

    Animated.parallel([
      Animated.timing(this.state.menuHeight, {
        toValue: height,
        duration: animationDuration,
        easing,
      }),
      Animated.timing(this.state.menuWidth, {
        toValue: width,
        duration: animationDuration,
        easing,
      }),
      Animated.timing(this.state.opacity, {
        toValue: opacity,
        duration: animationDuration,
        easing,
      }),
    ]).start();
  }

  render() {
    const {
      menuHeight,
      menuWidth,
      opacity,
      buttonWidth,
      buttonPositionY,
      buttonPositionX,
    } = this.state;
    const { button, children, menuStyle, sameWidth, visible } = this.props;

    return (
      <View>
        <View onLayout={this.onButtonLayout}>{button}</View>
        <Modal
          ariaHideApp={false}
          animationType={'none'}
          visible={visible}
          transparent
          backdropOpacity={0}>
          <Animated.View
            style={[
              styles.menuContainer,
              {
                height: menuHeight,
                width: menuWidth,
                opacity: opacity,
                top: buttonPositionY - 10,
                left: buttonPositionX - 10,
              },
            ]}>
            <View
              style={[
                styles.menu,
                { width: sameWidth ? buttonWidth : 'auto' },
                menuStyle,
              ]}
              onLayout={this.onMenuLayout}>
              {children}
            </View>
          </Animated.View>
        </Modal>
      </View>
    );
  }
}

export default withTheme(Menu);
