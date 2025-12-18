import { describe, it, expect } from 'vitest';
import { compactCardStyles } from '../src/styles';

describe('Compact Card Styles', () => {
  it('should export css template literal', () => {
    expect(compactCardStyles).toBeDefined();
    expect(typeof compactCardStyles).toBe('object');
  });

  it('should contain host styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain(':host');
    expect(cssText).toContain('display: block');
    expect(cssText).toContain('width: 100%');
    expect(cssText).toContain('height: 100%');
  });

  it('should contain ha-card styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('ha-card');
    expect(cssText).toContain('padding: 16px');
  });

  it('should contain compact-view styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.compact-view');
    expect(cssText).toContain('flex-direction: column');
  });

  it('should contain has-battery modifier', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.compact-view.has-battery');
    expect(cssText).toContain('gap: 12px');
  });

  it('should contain compact-row styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.compact-row');
    expect(cssText).toContain('display: flex');
    expect(cssText).toContain('align-items: center');
  });

  it('should contain bar-container styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.bar-container');
    expect(cssText).toContain('height: 60px');
    expect(cssText).toContain('border-radius: 8px');
  });

  it('should contain gradient animation CSS variables', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('shine-horizontal');
    expect(cssText).toContain('shine-vertical');
  });

  it('should contain gradient pseudo-element', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.shine-overlay');
    expect(cssText).toContain('linear-gradient');
    expect(cssText).toContain('transform: translateX(-100%)');
  });

  it('should contain no-flow modifier for gradient', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.bar-container.no-flow .shine-overlay');
    expect(cssText).toContain('opacity: 0');
  });

  it('should contain battery-row specific gradient', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('shine-vertical');
    expect(cssText).toContain('translateY(-100%)');
  });

  it('should contain bar-segment styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.bar-segment');
    expect(cssText).toContain('cursor: pointer');
    expect(cssText).toContain('transition: width');
  });

  it('should contain bar-segment hover effect', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.bar-segment:hover');
    expect(cssText).toContain('filter: brightness(1.2)');
  });

  it('should contain bar-segment-icon styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.bar-segment-icon');
    expect(cssText).toContain('width: 24px');
    expect(cssText).toContain('height: 24px');
  });

  it('should contain bar-segment-label styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.bar-segment-label');
    expect(cssText).toContain('text-shadow');
  });

  it('should contain visibility control for segments', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.bar-segment[data-width-px]');
    expect(cssText).toContain('display: none');
  });

  it('should contain show-label modifier', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('[data-width-px="show-label"]');
  });

  it('should contain show-icon modifier', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('[data-width-px="show-icon"]');
  });

  it('should contain row-value styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.row-value');
    expect(cssText).toContain('font-size: 24px');
    expect(cssText).toContain('font-weight: 600');
  });

  it('should contain row-value hover effect', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.row-value:hover');
    expect(cssText).toContain('filter: brightness(1.1)');
  });

  it('should contain row-icon styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.row-icon');
    expect(cssText).toContain('width: 28px');
    expect(cssText).toContain('height: 28px');
  });

  it('should contain row-text styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.row-text');
    expect(cssText).toContain('display: flex');
    expect(cssText).toContain('align-items: baseline');
  });

  it('should contain row-unit styles', () => {
    const cssText = compactCardStyles.cssText || compactCardStyles.toString();
    expect(cssText).toContain('.row-unit');
    expect(cssText).toContain('font-size: 14px');
  });
});
