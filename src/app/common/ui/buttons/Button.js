import React, { Component } from 'react';

import './Button.css';

/**
 * Note that the element generated by this component
 * will be an inline-block element. If you want to override
 * this, pass a custom class name into this component with 
 * the `className` prop, and the `display` rule should be
 * important (`!important`).
 * 
 * Note that you can pass mutiple class names with `className`
 * prop.
 * 
 * Also note that when you pass custom class names, they will append
 * to the default class name. However, when you pass custom class names for
 * disable case (applied when button is disable), those classes will
 * REPLACE, instead of appending to, the default class name.
 * 
 * Default class name is `Button`, default disable class is `Button-disable`.
 * 
 * You should write your custom css rules for disable after rules for normal case.
 * By that way, your css rules for disable case will overwrite those for normal case.
 */
class Button extends Component {
  constructor(props) {
    super(props);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.clickHandler = this.clickHandler.bind(this);

    this.state = { hovering: false };
  }

  onMouseEnter(e) {
    this.setState({ hovering: true });
    let onHovering = this.props.onHovering;
    onHovering && onHovering(e);
  }

  onMouseLeave(e) {
    this.setState({ hovering: false });
    let onLeaving = this.props.onLeaving;
    onLeaving && onLeaving(e);
  }

  onMouseMove(e) {
    if (!this.state.hovering) {
      this.setState({ hovering: true });
      let onHovering = this.props.onHovering;
      onHovering && onHovering(e);
    }
  }

  clickHandler(e) {
    if (!this.props.disable) {
      this.props.onClick(e);
    }
  }

  render() {
    let disable = this.props.disable;
    let className = this.props.className;
    let disableClass = this.props.disableClass || 'Button-disable';

    return (
      <div className={`Button ${className} ${disable ? disableClass : ''}`}
        onClick={this.clickHandler}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}>
        {this.props.children}
      </div>
    );
  }
}

export default Button;
