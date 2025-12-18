/**
 * Styles for Compact Energy Flow Card
 */

import { css } from 'lit';

export const compactCardStyles = css`
  :host,
  compact-home-energy-flow-card {
    display: block;
    width: 100%;
    height: 100%;
  }

  .compact-card,
  ha-card.compact-card {
    padding: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .compact-card .compact-view {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .compact-card .compact-view.has-battery {
    gap: 12px;
  }

  .compact-card .compact-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .compact-card .bar-container {
    flex: 1;
    height: 60px;
    background: rgb(40, 40, 40);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    position: relative;
  }

  /* Transform-only shine overlay keeps GPU-friendly movement without repainting the gradient. */
  .compact-card .shine-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 120%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    opacity: 0.75;
    will-change: transform, opacity;
    transform: translateX(-100%);
    transition: opacity 0.5s ease-out;
  }

  .compact-card .shine-overlay.shine-horizontal {
    width: 90%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .compact-card .shine-overlay.shine-vertical {
    width: 100%;
    height: 150%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateY(-100%);
  }

  .compact-card.animation-disabled .bar-container,
  .compact-card.animation-disabled .bar-segment {
    transition: none;
  }

  .compact-card.animation-disabled .shine-overlay {
    display: none;
  }

  .compact-card .bar-container.no-flow .shine-overlay {
    opacity: 0;
  }

  @keyframes shine-horizontal {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }

  @keyframes shine-vertical {
    from { transform: translateY(-100%); }
    to { transform: translateY(100%); }
  }

  .compact-card .shine-fallback-horizontal {
    animation: shine-horizontal 60s linear infinite;
  }

  .compact-card .shine-fallback-vertical {
    animation: shine-vertical 60s linear infinite;
  }

  .compact-card .bar-segment {
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

  .compact-card .bar-segment:hover {
    filter: brightness(1.2);
  }

  .compact-card .bar-segment-content {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .compact-card .bar-segment-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    opacity: 1;
    color: rgb(255, 255, 255);
  }

  .compact-card .bar-segment-label {
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  .compact-card .bar-segment[data-width-px] .bar-segment-label {
    display: none;
  }

  .compact-card .bar-segment[data-width-px="show-label"] .bar-segment-label {
    display: inline;
  }

  .compact-card .bar-segment[data-width-px] .bar-segment-icon {
    display: none;
  }

  .compact-card .bar-segment[data-width-px="show-icon"] .bar-segment-icon,
  .compact-card .bar-segment[data-width-px="show-label"] .bar-segment-icon {
    display: block;
  }

  .compact-card .row-value {
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

  .compact-card .row-value:hover {
    filter: brightness(1.1);
  }

  .compact-card .row-value.battery-discharge {
    text-align: left;
    flex-direction: row-reverse;
  }

  .compact-card .row-icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    color: rgb(160, 160, 160);
    display: flex;
    align-items: center;
  }

  .compact-card .row-text {
    display: flex;
    align-items: baseline;
    gap: 4px;
    line-height: 1;
  }

  .compact-card .row-unit {
    font-size: 14px;
    color: rgb(160, 160, 160);
    margin-left: 4px;
  }
`;
