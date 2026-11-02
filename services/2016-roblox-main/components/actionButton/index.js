import { useState } from "react";
import { createUseStyles } from "react-jss";

const useBuyButtonStyles = createUseStyles({
  btn: {
    textAlign: 'center',
    padding: '1px 13px 3px 13px',
    fontSize: '20px',
    color: 'white',
    border: '1px solid #357ebd',
    margin: '0 auto',
    display: 'block',
    fontWeight: 'normal',
    textDecoration: 'none',
    '&:disabled': {
      opacity: '0.5',
    },
  },
  wrapper: {
    width: '100%',
    border: '1px solid #a7a7a7',
    background: '#e1e1e1',
  },
  defaultBg: {
    background: 'linear-gradient(0deg, rgba(0,113,0,1) 0%, rgba(64,193,64,1) 100%)', // 40c140 #007100
    '&:hover': {
      background: 'linear-gradient(0deg, rgba(71,232,71,1) 0%, rgba(71,232,71,1) 100%)', // 47e847 02a101
    },
  },
});

const ActionButton = props => {
  const s = useBuyButtonStyles();
  const className = s.btn + ' ' + (props.className || s.defaultBg);
  const title = props.disabled ? props.tooltipText : '';
  const label = props.label || 'Buy Now';

  return <div className={props.divClassName}>
    {props.href && !props.disabled ? (
      <a href={props.href} className={className} title={title}>{label}</a>
    ) : (
      <button
        type={props.type}
        disabled={props.disabled}
        className={className}
        onClick={props.onClick}
        title={title}>{label}</button>
    )}
  </div>
}

export default ActionButton;
