/**
 * Styles for Compact Energy Flow Card
 */

import { css } from 'lit';

export const compactCardStyles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
  
  ha-card {
    padding: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .compact-view {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .compact-view.has-battery {
    gap: 12px;
  }
  
  .compact-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }
  
  .bar-container {
    flex: 1;
    height: 60px;
    background: rgb(40, 40, 40);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    position: relative;
    --gradient-x: -100%;
    --gradient-y: 0%;
  }
  
  .bar-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
    z-index: 10;
    will-change: transform, opacity;
    transform: translateX(var(--gradient-x));
    opacity: 1;
    transition: opacity 0.5s ease-out;
  }
  
  .bar-container.no-flow::before {
    opacity: 0;
  }
  
  #battery-row .bar-container::before {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateY(var(--gradient-y));
  }
  
  .bar-segment {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: rgb(255, 255, 255);
    transition: width 0.5s ease-out;
    position: relative;
    cursor: pointer;
  }
  
  .bar-segment:hover {
    filter: brightness(1.2);
  }
  
  .bar-segment-content {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  
  .bar-segment-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    opacity: 1;
    color: rgb(255, 255, 255);
  }
  
  .bar-segment-label {
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
  
  .bar-segment[data-width-px] .bar-segment-label {
    display: none;
  }
  
  .bar-segment[data-width-px="show-label"] .bar-segment-label {
    display: inline;
  }
  
  .bar-segment[data-width-px] .bar-segment-icon {
    display: none;
  }
  
  .bar-segment[data-width-px="show-icon"] .bar-segment-icon,
  .bar-segment[data-width-px="show-label"] .bar-segment-icon {
    display: block;
  }
  
  .row-value {
    font-size: 24px;
    font-weight: 600;
    color: rgb(255, 255, 255);
    white-space: nowrap;
    min-width: 100px;
    text-align: right;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  .row-value:hover {
    filter: brightness(1.1);
  }
  
  .row-value.battery-discharge {
    text-align: left;
    flex-direction: row-reverse;
  }
  
  .row-icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    color: rgb(160, 160, 160);
    display: flex;
    align-items: center;
  }
  
  .row-text {
    display: flex;
    align-items: baseline;
    gap: 4px;
    line-height: 1;
  }
  
  .row-unit {
    font-size: 14px;
    color: rgb(160, 160, 160);
    margin-left: 4px;
  }
`;
