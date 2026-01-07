/**
 * Math Interactive Components
 * Lightweight Canvas/SVG-based interactive elements for math questions
 * No external dependencies - uses native browser APIs
 */

const MathInteractive = {
  /**
   * Initialize all interactive elements on the page
   */
  init() {
    this.initNumberLines();
    this.initClocks();
    this.initCountingObjects();
    this.initShapeGrids();
    this.initFractionBars();
  },

  // ==========================================================================
  // NUMBER LINE
  // ==========================================================================

  /**
   * Create an interactive number line
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  createNumberLine(container, options = {}) {
    const {
      min = 0,
      max = 20,
      step = 1,
      showMarker = true,
      markerValue = null,
      interactive = true,
      onSelect = null,
      highlightRange = null
    } = options;

    const width = Math.min(container.clientWidth || 600, 600);
    const height = 80;
    const padding = 30;
    const lineY = 50;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'number-line');
    svg.style.width = '100%';
    svg.style.maxWidth = `${width}px`;

    const tickCount = (max - min) / step;
    const tickSpacing = (width - padding * 2) / tickCount;

    // Draw main line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padding);
    line.setAttribute('y1', lineY);
    line.setAttribute('x2', width - padding);
    line.setAttribute('y2', lineY);
    line.setAttribute('stroke', 'var(--color-text, #333)');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);

    // Draw arrows
    const arrowLeft = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowLeft.setAttribute('points', `${padding - 5},${lineY} ${padding + 5},${lineY - 6} ${padding + 5},${lineY + 6}`);
    arrowLeft.setAttribute('fill', 'var(--color-text, #333)');
    svg.appendChild(arrowLeft);

    const arrowRight = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowRight.setAttribute('points', `${width - padding + 5},${lineY} ${width - padding - 5},${lineY - 6} ${width - padding - 5},${lineY + 6}`);
    arrowRight.setAttribute('fill', 'var(--color-text, #333)');
    svg.appendChild(arrowRight);

    // Highlight range if specified
    if (highlightRange) {
      const [rangeStart, rangeEnd] = highlightRange;
      const startX = padding + ((rangeStart - min) / step) * tickSpacing;
      const endX = padding + ((rangeEnd - min) / step) * tickSpacing;
      
      const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      highlight.setAttribute('x', startX);
      highlight.setAttribute('y', lineY - 8);
      highlight.setAttribute('width', endX - startX);
      highlight.setAttribute('height', 16);
      highlight.setAttribute('fill', 'var(--color-primary-light, #e3f2fd)');
      highlight.setAttribute('rx', '4');
      svg.insertBefore(highlight, line);
    }

    // Draw ticks and numbers
    for (let i = 0; i <= tickCount; i++) {
      const value = min + i * step;
      const x = padding + i * tickSpacing;

      // Tick mark
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', x);
      tick.setAttribute('y1', lineY - 8);
      tick.setAttribute('x2', x);
      tick.setAttribute('y2', lineY + 8);
      tick.setAttribute('stroke', 'var(--color-text, #333)');
      tick.setAttribute('stroke-width', '2');
      svg.appendChild(tick);

      // Number label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', lineY + 25);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '14');
      label.setAttribute('font-weight', '600');
      label.setAttribute('fill', 'var(--color-text, #333)');
      label.textContent = value;
      svg.appendChild(label);

      // Interactive click areas
      if (interactive) {
        const clickArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        clickArea.setAttribute('cx', x);
        clickArea.setAttribute('cy', lineY);
        clickArea.setAttribute('r', '12');
        clickArea.setAttribute('fill', 'transparent');
        clickArea.setAttribute('cursor', 'pointer');
        clickArea.setAttribute('data-value', value);
        clickArea.classList.add('number-line__click-area');
        
        clickArea.addEventListener('click', () => {
          if (onSelect) onSelect(value);
          this.setNumberLineMarker(svg, x, value);
        });
        
        clickArea.addEventListener('mouseenter', () => {
          clickArea.setAttribute('fill', 'var(--color-primary-light, rgba(66, 133, 244, 0.2))');
        });
        
        clickArea.addEventListener('mouseleave', () => {
          clickArea.setAttribute('fill', 'transparent');
        });
        
        svg.appendChild(clickArea);
      }
    }

    // Add marker if specified
    if (showMarker && markerValue !== null) {
      const markerX = padding + ((markerValue - min) / step) * tickSpacing;
      this.setNumberLineMarker(svg, markerX, markerValue);
    }

    container.innerHTML = '';
    container.appendChild(svg);
    
    return svg;
  },

  /**
   * Set marker position on number line
   */
  setNumberLineMarker(svg, x, value) {
    // Remove existing marker
    const existingMarker = svg.querySelector('.number-line__marker');
    if (existingMarker) existingMarker.remove();

    const markerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    markerGroup.classList.add('number-line__marker');

    // Marker circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', 50);
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', 'var(--color-primary, #4285f4)');
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '2');
    markerGroup.appendChild(circle);

    // Marker arrow
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrow.setAttribute('points', `${x},25 ${x - 8},10 ${x + 8},10`);
    arrow.setAttribute('fill', 'var(--color-primary, #4285f4)');
    markerGroup.appendChild(arrow);

    svg.appendChild(markerGroup);
    svg.setAttribute('data-selected', value);
  },

  /**
   * Initialize all number lines on page
   */
  initNumberLines() {
    document.querySelectorAll('[data-interactive="number-line"]').forEach(container => {
      const min = parseInt(container.dataset.min) || 0;
      const max = parseInt(container.dataset.max) || 20;
      const step = parseInt(container.dataset.step) || 1;
      const questionId = container.dataset.questionId;

      this.createNumberLine(container, {
        min,
        max,
        step,
        interactive: true,
        onSelect: (value) => {
          container.dataset.answer = value;
          container.dispatchEvent(new CustomEvent('answer-selected', { 
            detail: { value, questionId } 
          }));
        }
      });
    });
  },

  // ==========================================================================
  // ANALOG CLOCK
  // ==========================================================================

  /**
   * Create an interactive analog clock
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  createClock(container, options = {}) {
    const {
      hours = 12,
      minutes = 0,
      interactive = false,
      showDigital = true,
      size = 200
    } = options;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'clock');
    svg.style.width = `${size}px`;
    svg.style.height = `${size}px`;

    // Clock face
    const face = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    face.setAttribute('cx', '100');
    face.setAttribute('cy', '100');
    face.setAttribute('r', '95');
    face.setAttribute('fill', 'var(--color-card, white)');
    face.setAttribute('stroke', 'var(--color-primary, #4285f4)');
    face.setAttribute('stroke-width', '4');
    svg.appendChild(face);

    // Hour markers
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = 100 + 75 * Math.cos(angle);
      const y = 100 + 75 * Math.sin(angle);

      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      marker.setAttribute('x', x);
      marker.setAttribute('y', y + 6);
      marker.setAttribute('text-anchor', 'middle');
      marker.setAttribute('font-size', '16');
      marker.setAttribute('font-weight', '700');
      marker.setAttribute('fill', 'var(--color-text, #333)');
      marker.textContent = i;
      svg.appendChild(marker);
    }

    // Minute ticks
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) {
        const angle = (i * 6 - 90) * (Math.PI / 180);
        const x1 = 100 + 88 * Math.cos(angle);
        const y1 = 100 + 88 * Math.sin(angle);
        const x2 = 100 + 92 * Math.cos(angle);
        const y2 = 100 + 92 * Math.sin(angle);

        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', x1);
        tick.setAttribute('y1', y1);
        tick.setAttribute('x2', x2);
        tick.setAttribute('y2', y2);
        tick.setAttribute('stroke', 'var(--color-text-muted, #666)');
        tick.setAttribute('stroke-width', '1');
        svg.appendChild(tick);
      }
    }

    // Hour hand
    const hourAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * (Math.PI / 180);
    const hourHand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hourHand.setAttribute('x1', '100');
    hourHand.setAttribute('y1', '100');
    hourHand.setAttribute('x2', 100 + 45 * Math.cos(hourAngle));
    hourHand.setAttribute('y2', 100 + 45 * Math.sin(hourAngle));
    hourHand.setAttribute('stroke', 'var(--color-text, #333)');
    hourHand.setAttribute('stroke-width', '6');
    hourHand.setAttribute('stroke-linecap', 'round');
    hourHand.classList.add('clock__hour-hand');
    svg.appendChild(hourHand);

    // Minute hand
    const minuteAngle = (minutes * 6 - 90) * (Math.PI / 180);
    const minuteHand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    minuteHand.setAttribute('x1', '100');
    minuteHand.setAttribute('y1', '100');
    minuteHand.setAttribute('x2', 100 + 65 * Math.cos(minuteAngle));
    minuteHand.setAttribute('y2', 100 + 65 * Math.sin(minuteAngle));
    minuteHand.setAttribute('stroke', 'var(--color-primary, #4285f4)');
    minuteHand.setAttribute('stroke-width', '4');
    minuteHand.setAttribute('stroke-linecap', 'round');
    minuteHand.classList.add('clock__minute-hand');
    svg.appendChild(minuteHand);

    // Center dot
    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('cx', '100');
    center.setAttribute('cy', '100');
    center.setAttribute('r', '6');
    center.setAttribute('fill', 'var(--color-primary, #4285f4)');
    svg.appendChild(center);

    container.innerHTML = '';
    container.appendChild(svg);

    // Digital display
    if (showDigital) {
      const digital = document.createElement('div');
      digital.className = 'clock__digital';
      digital.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
      digital.style.textAlign = 'center';
      digital.style.fontSize = '1.25rem';
      digital.style.fontWeight = '700';
      digital.style.marginTop = '0.5rem';
      digital.style.fontFamily = 'var(--font-family-display)';
      container.appendChild(digital);
    }

    return svg;
  },

  /**
   * Initialize all clocks on page
   */
  initClocks() {
    document.querySelectorAll('[data-interactive="clock"]').forEach(container => {
      const hours = parseInt(container.dataset.hours) || 12;
      const minutes = parseInt(container.dataset.minutes) || 0;
      const size = parseInt(container.dataset.size) || 180;

      this.createClock(container, { hours, minutes, size, showDigital: false });
    });
  },

  // ==========================================================================
  // COUNTING OBJECTS
  // ==========================================================================

  /**
   * SVG paths for common counting objects
   */
  objectPaths: {
    apple: `<circle cx="12" cy="14" r="10" fill="#e53935"/>
            <path d="M12 4 Q14 2 16 4" stroke="#4caf50" stroke-width="2" fill="none"/>
            <ellipse cx="15" cy="6" rx="3" ry="4" fill="#4caf50"/>`,
    
    mango: `<ellipse cx="12" cy="14" rx="10" ry="8" fill="#ff9800"/>
            <path d="M12 6 Q14 3 16 5" stroke="#4caf50" stroke-width="2" fill="none"/>`,
    
    star: `<polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" fill="#ffc107"/>`,
    
    coin: `<circle cx="12" cy="12" r="10" fill="#ffd700" stroke="#daa520" stroke-width="2"/>
           <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="#8b6914">$</text>`,
    
    ball: `<circle cx="12" cy="12" r="10" fill="#2196f3"/>
           <ellipse cx="9" cy="9" rx="3" ry="2" fill="rgba(255,255,255,0.4)"/>`,
    
    flower: `<circle cx="12" cy="12" r="4" fill="#ffeb3b"/>
             <circle cx="12" cy="4" r="4" fill="#e91e63"/>
             <circle cx="18" cy="8" r="4" fill="#e91e63"/>
             <circle cx="18" cy="16" r="4" fill="#e91e63"/>
             <circle cx="12" cy="20" r="4" fill="#e91e63"/>
             <circle cx="6" cy="16" r="4" fill="#e91e63"/>
             <circle cx="6" cy="8" r="4" fill="#e91e63"/>`,
    
    bird: `<ellipse cx="12" cy="12" rx="8" ry="6" fill="#03a9f4"/>
           <circle cx="16" cy="10" r="2" fill="white"/>
           <circle cx="17" cy="10" r="1" fill="black"/>
           <polygon points="20,12 24,11 20,13" fill="#ff9800"/>`,
    
    fish: `<ellipse cx="12" cy="12" rx="10" ry="6" fill="#ff7043"/>
           <polygon points="2,12 -4,6 -4,18" fill="#ff7043"/>
           <circle cx="18" cy="10" r="2" fill="white"/>
           <circle cx="19" cy="10" r="1" fill="black"/>`,
    
    pencil: `<rect x="6" y="4" width="6" height="16" fill="#ffeb3b"/>
             <polygon points="6,20 12,20 9,24" fill="#ffccbc"/>
             <rect x="6" y="4" width="6" height="3" fill="#e91e63"/>`,
    
    book: `<rect x="4" y="4" width="16" height="16" rx="1" fill="#3f51b5"/>
           <rect x="6" y="6" width="12" height="12" fill="white"/>
           <line x1="8" y1="9" x2="16" y2="9" stroke="#ccc" stroke-width="1"/>
           <line x1="8" y1="12" x2="16" y2="12" stroke="#ccc" stroke-width="1"/>
           <line x1="8" y1="15" x2="14" y2="15" stroke="#ccc" stroke-width="1"/>`
  },

  /**
   * Create counting objects display
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  createCountingObjects(container, options = {}) {
    const {
      count = 5,
      object = 'apple',
      arrangement = 'grid', // 'grid', 'row', 'groups'
      groupSize = 5,
      showCount = false,
      interactive = false,
      maxPerRow = 10
    } = options;

    const wrapper = document.createElement('div');
    wrapper.className = 'counting-objects';
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '8px';
    wrapper.style.justifyContent = 'center';
    wrapper.style.padding = '1rem';

    const objectSvg = this.objectPaths[object] || this.objectPaths.apple;

    if (arrangement === 'groups') {
      // Arrange in groups (e.g., groups of 5)
      const numGroups = Math.ceil(count / groupSize);
      for (let g = 0; g < numGroups; g++) {
        const group = document.createElement('div');
        group.className = 'counting-objects__group';
        group.style.display = 'flex';
        group.style.gap = '4px';
        group.style.padding = '8px';
        group.style.background = 'var(--color-bg, #f5f5f5)';
        group.style.borderRadius = '8px';
        group.style.marginInlineEnd = '12px';

        const itemsInGroup = Math.min(groupSize, count - g * groupSize);
        for (let i = 0; i < itemsInGroup; i++) {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('width', '32');
          svg.setAttribute('height', '32');
          svg.innerHTML = objectSvg;
          group.appendChild(svg);
        }
        wrapper.appendChild(group);
      }
    } else {
      // Grid or row arrangement
      for (let i = 0; i < count; i++) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '36');
        svg.setAttribute('height', '36');
        svg.innerHTML = objectSvg;
        
        if (interactive) {
          svg.style.cursor = 'pointer';
          svg.style.transition = 'transform 0.2s, opacity 0.2s';
          svg.addEventListener('click', () => {
            svg.classList.toggle('counted');
            if (svg.classList.contains('counted')) {
              svg.style.opacity = '0.4';
              svg.style.transform = 'scale(0.9)';
            } else {
              svg.style.opacity = '1';
              svg.style.transform = 'scale(1)';
            }
          });
        }
        
        wrapper.appendChild(svg);

        // Add line break for grid
        if (arrangement === 'grid' && (i + 1) % maxPerRow === 0 && i < count - 1) {
          const br = document.createElement('div');
          br.style.flexBasis = '100%';
          wrapper.appendChild(br);
        }
      }
    }

    if (showCount) {
      const countLabel = document.createElement('div');
      countLabel.className = 'counting-objects__label';
      countLabel.textContent = `Count: ${count}`;
      countLabel.style.width = '100%';
      countLabel.style.textAlign = 'center';
      countLabel.style.marginTop = '0.5rem';
      countLabel.style.fontWeight = '600';
      wrapper.appendChild(countLabel);
    }

    container.innerHTML = '';
    container.appendChild(wrapper);

    return wrapper;
  },

  /**
   * Initialize all counting objects on page
   */
  initCountingObjects() {
    document.querySelectorAll('[data-interactive="counting"]').forEach(container => {
      const count = parseInt(container.dataset.count) || 5;
      const object = container.dataset.object || 'apple';
      const arrangement = container.dataset.arrangement || 'grid';
      const groupSize = parseInt(container.dataset.groupSize) || 5;

      this.createCountingObjects(container, { count, object, arrangement, groupSize });
    });
  },

  // ==========================================================================
  // SHAPE GRIDS
  // ==========================================================================

  /**
   * SVG definitions for basic shapes
   */
  shapePaths: {
    circle: (color = '#4285f4') => `<circle cx="25" cy="25" r="20" fill="${color}"/>`,
    square: (color = '#ea4335') => `<rect x="5" y="5" width="40" height="40" fill="${color}"/>`,
    rectangle: (color = '#fbbc04') => `<rect x="2" y="10" width="46" height="30" fill="${color}"/>`,
    triangle: (color = '#34a853') => `<polygon points="25,5 45,45 5,45" fill="${color}"/>`,
    oval: (color = '#9c27b0') => `<ellipse cx="25" cy="25" rx="22" ry="15" fill="${color}"/>`,
    diamond: (color = '#ff9800') => `<polygon points="25,5 45,25 25,45 5,25" fill="${color}"/>`,
    pentagon: (color = '#00bcd4') => `<polygon points="25,5 45,18 38,42 12,42 5,18" fill="${color}"/>`,
    hexagon: (color = '#e91e63') => `<polygon points="25,5 43,15 43,35 25,45 7,35 7,15" fill="${color}"/>`,
    star: (color = '#ffc107') => `<polygon points="25,5 29,18 43,18 32,27 36,42 25,33 14,42 18,27 7,18 21,18" fill="${color}"/>`
  },

  /**
   * Create a shape grid for recognition/counting
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  createShapeGrid(container, options = {}) {
    const {
      shapes = ['circle', 'square', 'triangle'],
      counts = { circle: 3, square: 2, triangle: 4 },
      size = 50,
      interactive = false,
      highlightShape = null,
      onSelect = null
    } = options;

    const wrapper = document.createElement('div');
    wrapper.className = 'shape-grid';
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '8px';
    wrapper.style.justifyContent = 'center';
    wrapper.style.padding = '1rem';

    // Build array of all shapes
    const allShapes = [];
    shapes.forEach(shape => {
      const count = counts[shape] || 1;
      for (let i = 0; i < count; i++) {
        allShapes.push(shape);
      }
    });

    // Shuffle array
    for (let i = allShapes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allShapes[i], allShapes[j]] = [allShapes[j], allShapes[i]];
    }

    // Create SVGs
    allShapes.forEach((shape, index) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 50 50');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.innerHTML = this.shapePaths[shape]();
      svg.dataset.shape = shape;
      svg.style.transition = 'transform 0.2s, box-shadow 0.2s';

      if (highlightShape && shape === highlightShape) {
        svg.style.boxShadow = '0 0 0 3px var(--color-primary)';
        svg.style.borderRadius = '8px';
      }

      if (interactive) {
        svg.style.cursor = 'pointer';
        svg.addEventListener('click', () => {
          if (onSelect) onSelect(shape, index);
          
          // Visual feedback
          document.querySelectorAll('.shape-grid svg').forEach(s => {
            s.style.boxShadow = 'none';
          });
          svg.style.boxShadow = '0 0 0 3px var(--color-primary)';
        });

        svg.addEventListener('mouseenter', () => {
          svg.style.transform = 'scale(1.1)';
        });

        svg.addEventListener('mouseleave', () => {
          svg.style.transform = 'scale(1)';
        });
      }

      wrapper.appendChild(svg);
    });

    container.innerHTML = '';
    container.appendChild(wrapper);

    return wrapper;
  },

  /**
   * Initialize all shape grids on page
   */
  initShapeGrids() {
    document.querySelectorAll('[data-interactive="shapes"]').forEach(container => {
      const shapesAttr = container.dataset.shapes;
      const countsAttr = container.dataset.counts;
      
      let shapes = ['circle', 'square', 'triangle'];
      let counts = { circle: 3, square: 2, triangle: 4 };

      if (shapesAttr) {
        shapes = shapesAttr.split(',').map(s => s.trim());
      }
      if (countsAttr) {
        try {
          counts = JSON.parse(countsAttr);
        } catch (e) {
          console.warn('Invalid counts JSON:', countsAttr);
        }
      }

      this.createShapeGrid(container, { shapes, counts });
    });
  },

  // ==========================================================================
  // FRACTION BARS
  // ==========================================================================

  /**
   * Create a fraction bar visualization
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  createFractionBar(container, options = {}) {
    const {
      numerator = 1,
      denominator = 4,
      width = 300,
      height = 60,
      showLabel = true,
      color = 'var(--color-primary, #4285f4)'
    } = options;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'fraction-bar');
    svg.style.width = '100%';
    svg.style.maxWidth = `${width}px`;

    const barHeight = 40;
    const barY = 10;
    const partWidth = (width - 20) / denominator;

    // Draw parts
    for (let i = 0; i < denominator; i++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', 10 + i * partWidth);
      rect.setAttribute('y', barY);
      rect.setAttribute('width', partWidth - 2);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('rx', '4');
      
      if (i < numerator) {
        rect.setAttribute('fill', color);
      } else {
        rect.setAttribute('fill', 'var(--color-bg, #e0e0e0)');
      }
      
      rect.setAttribute('stroke', 'var(--color-text, #333)');
      rect.setAttribute('stroke-width', '2');
      svg.appendChild(rect);
    }

    container.innerHTML = '';
    container.appendChild(svg);

    if (showLabel) {
      const label = document.createElement('div');
      label.className = 'fraction-bar__label';
      label.innerHTML = `<span style="font-size: 1.5rem; font-weight: 700;">${numerator}</span>/<span style="font-size: 1.5rem; font-weight: 700;">${denominator}</span>`;
      label.style.textAlign = 'center';
      label.style.marginTop = '0.5rem';
      container.appendChild(label);
    }

    return svg;
  },

  /**
   * Initialize all fraction bars on page
   */
  initFractionBars() {
    document.querySelectorAll('[data-interactive="fraction"]').forEach(container => {
      const numerator = parseInt(container.dataset.numerator) || 1;
      const denominator = parseInt(container.dataset.denominator) || 4;

      this.createFractionBar(container, { numerator, denominator });
    });
  },

  // ==========================================================================
  // PLACE VALUE BLOCKS
  // ==========================================================================

  /**
   * Create place value blocks (ones, tens, hundreds)
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  createPlaceValueBlocks(container, options = {}) {
    const {
      number = 0,
      showLabels = true
    } = options;

    const hundreds = Math.floor(number / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;

    const wrapper = document.createElement('div');
    wrapper.className = 'place-value';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '2rem';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'flex-end';
    wrapper.style.padding = '1rem';

    // Hundreds (large squares)
    if (hundreds > 0) {
      const hundredsDiv = document.createElement('div');
      hundredsDiv.className = 'place-value__hundreds';
      hundredsDiv.style.display = 'flex';
      hundredsDiv.style.flexDirection = 'column';
      hundredsDiv.style.alignItems = 'center';
      hundredsDiv.style.gap = '4px';

      for (let i = 0; i < hundreds; i++) {
        const block = document.createElement('div');
        block.style.width = '50px';
        block.style.height = '50px';
        block.style.background = 'var(--color-primary, #4285f4)';
        block.style.borderRadius = '4px';
        block.style.display = 'grid';
        block.style.gridTemplateColumns = 'repeat(10, 1fr)';
        block.style.gap = '1px';
        block.style.padding = '2px';
        
        for (let j = 0; j < 100; j++) {
          const unit = document.createElement('div');
          unit.style.background = 'rgba(255,255,255,0.3)';
          unit.style.borderRadius = '1px';
          block.appendChild(unit);
        }
        hundredsDiv.appendChild(block);
      }

      if (showLabels) {
        const label = document.createElement('div');
        label.textContent = `${hundreds} hundred${hundreds > 1 ? 's' : ''}`;
        label.style.fontSize = '0.75rem';
        label.style.color = 'var(--color-text-muted)';
        label.style.marginTop = '4px';
        hundredsDiv.appendChild(label);
      }

      wrapper.appendChild(hundredsDiv);
    }

    // Tens (vertical bars)
    if (tens > 0) {
      const tensDiv = document.createElement('div');
      tensDiv.className = 'place-value__tens';
      tensDiv.style.display = 'flex';
      tensDiv.style.flexDirection = 'column';
      tensDiv.style.alignItems = 'center';

      const tensRow = document.createElement('div');
      tensRow.style.display = 'flex';
      tensRow.style.gap = '4px';

      for (let i = 0; i < tens; i++) {
        const bar = document.createElement('div');
        bar.style.width = '12px';
        bar.style.height = '60px';
        bar.style.background = 'var(--color-secondary, #34a853)';
        bar.style.borderRadius = '3px';
        tensRow.appendChild(bar);
      }
      tensDiv.appendChild(tensRow);

      if (showLabels) {
        const label = document.createElement('div');
        label.textContent = `${tens} ten${tens > 1 ? 's' : ''}`;
        label.style.fontSize = '0.75rem';
        label.style.color = 'var(--color-text-muted)';
        label.style.marginTop = '4px';
        tensDiv.appendChild(label);
      }

      wrapper.appendChild(tensDiv);
    }

    // Ones (small cubes)
    if (ones > 0) {
      const onesDiv = document.createElement('div');
      onesDiv.className = 'place-value__ones';
      onesDiv.style.display = 'flex';
      onesDiv.style.flexDirection = 'column';
      onesDiv.style.alignItems = 'center';

      const onesRow = document.createElement('div');
      onesRow.style.display = 'flex';
      onesRow.style.flexWrap = 'wrap';
      onesRow.style.gap = '4px';
      onesRow.style.maxWidth = '80px';

      for (let i = 0; i < ones; i++) {
        const cube = document.createElement('div');
        cube.style.width = '16px';
        cube.style.height = '16px';
        cube.style.background = 'var(--color-accent, #fbbc04)';
        cube.style.borderRadius = '3px';
        onesRow.appendChild(cube);
      }
      onesDiv.appendChild(onesRow);

      if (showLabels) {
        const label = document.createElement('div');
        label.textContent = `${ones} one${ones > 1 ? 's' : ''}`;
        label.style.fontSize = '0.75rem';
        label.style.color = 'var(--color-text-muted)';
        label.style.marginTop = '4px';
        onesDiv.appendChild(label);
      }

      wrapper.appendChild(onesDiv);
    }

    // Total
    if (showLabels) {
      const total = document.createElement('div');
      total.className = 'place-value__total';
      total.innerHTML = `<strong>= ${number}</strong>`;
      total.style.fontSize = '1.5rem';
      total.style.alignSelf = 'center';
      wrapper.appendChild(total);
    }

    container.innerHTML = '';
    container.appendChild(wrapper);

    return wrapper;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MathInteractive.init());
} else {
  MathInteractive.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathInteractive;
}
