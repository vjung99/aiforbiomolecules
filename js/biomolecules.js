// Biomolecule floating background animation
(function() {
    'use strict';

    const CONFIG = {
        moleculeCount: 12,
        depthLayers: 3,
        colors: {
            dna: ['#8a9a8a', '#9ab0a0', '#7a9a9a'],
            protein: ['#9a8aa0', '#a8b4c8', '#8a9aaa'],
            rna: ['#a09080', '#b8a890', '#b0a88a']
        }
    };

    // SVG paths for different biomolecule representations.
    // Use currentColor + opacity so repeated inline SVGs do not duplicate gradient IDs.
    const MOLECULE_SHAPES = {
        // DNA double helix: two S-curve backbones that cross once per half-turn
        dna: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <g stroke="currentColor" stroke-linecap="round">
                    <line x1="34" y1="8" x2="66" y2="8" stroke-width="1.7" opacity="0.36"/>
                    <line x1="34" y1="32" x2="66" y2="32" stroke-width="1.7" opacity="0.36"/>
                    <line x1="34" y1="56" x2="66" y2="56" stroke-width="1.7" opacity="0.36"/>
                    <line x1="34" y1="80" x2="66" y2="80" stroke-width="1.7" opacity="0.36"/>
                    <line x1="34" y1="96" x2="66" y2="96" stroke-width="1.7" opacity="0.36"/>
                    <path d="M32,8 C32,20 68,20 68,32 C68,44 32,44 32,56 C32,68 68,68 68,80 C68,92 32,92 32,96"
                          fill="none" stroke-width="2.5" opacity="0.36"/>
                    <path d="M68,8 C68,20 32,20 32,32 C32,44 68,44 68,56 C68,68 32,68 32,80 C32,92 68,92 68,96"
                          fill="none" stroke-width="3.1" opacity="0.58"/>
                </g>
                <g fill="currentColor">
                    <circle cx="68" cy="8" r="3.1" opacity="0.5"/>
                    <circle cx="32" cy="32" r="2.9" opacity="0.45"/>
                    <circle cx="68" cy="56" r="3.1" opacity="0.5"/>
                    <circle cx="32" cy="80" r="2.9" opacity="0.45"/>
                    <circle cx="68" cy="96" r="3.1" opacity="0.5"/>
                </g>
            </svg>
        `,
        // Protein alpha helix: tight sinusoidal coil (side-on projection)
        protein: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,10 C70,13 70,19 50,22 C30,25 30,31 50,34 C70,37 70,43 50,46 C30,49 30,55 50,58 C70,61 70,67 50,70 C30,73 30,79 50,82 C70,85 70,91 50,94"
                      fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" opacity="0.14"/>
                <path d="M50,10 C70,13 70,19 50,22 C30,25 30,31 50,34 C70,37 70,43 50,46 C30,49 30,55 50,58 C70,61 70,67 50,70 C30,73 30,79 50,82 C70,85 70,91 50,94"
                      fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" opacity="0.56"/>
                <g fill="currentColor">
                    <circle cx="65" cy="16" r="2.8" opacity="0.4"/>
                    <circle cx="35" cy="28" r="2.8" opacity="0.4"/>
                    <circle cx="65" cy="40" r="2.8" opacity="0.4"/>
                    <circle cx="35" cy="52" r="2.8" opacity="0.4"/>
                    <circle cx="65" cy="64" r="2.8" opacity="0.4"/>
                    <circle cx="35" cy="76" r="2.8" opacity="0.4"/>
                    <circle cx="65" cy="88" r="2.8" opacity="0.38"/>
                </g>
            </svg>
        `,
        // RNA hairpin: paired stem with a rounded unpaired loop
        rna: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M40,92 L40,54 C40,40 28,18 50,16 C72,18 60,40 60,54 L60,92"
                      fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.52"/>
                <g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity="0.34">
                    <line x1="40" y1="60" x2="60" y2="60"/>
                    <line x1="40" y1="70" x2="60" y2="70"/>
                    <line x1="40" y1="80" x2="60" y2="80"/>
                    <line x1="40" y1="90" x2="60" y2="90"/>
                </g>
                <g fill="currentColor">
                    <circle cx="40" cy="92" r="3.1" opacity="0.46"/>
                    <circle cx="40" cy="80" r="2.6" opacity="0.4"/>
                    <circle cx="40" cy="70" r="2.6" opacity="0.4"/>
                    <circle cx="40" cy="60" r="2.6" opacity="0.4"/>
                    <circle cx="37" cy="31" r="2.6" opacity="0.34"/>
                    <circle cx="50" cy="16" r="3" opacity="0.4"/>
                    <circle cx="63" cy="31" r="2.6" opacity="0.34"/>
                    <circle cx="60" cy="60" r="2.6" opacity="0.4"/>
                    <circle cx="60" cy="70" r="2.6" opacity="0.4"/>
                    <circle cx="60" cy="80" r="2.6" opacity="0.4"/>
                    <circle cx="60" cy="92" r="3.1" opacity="0.44"/>
                </g>
            </svg>
        `,
        // Adenine: regular pyrimidine hexagon fused to a regular imidazole pentagon
        hexagon: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="36,32 55.1,43 55.1,65 36,76 16.9,65 16.9,43"
                         fill="none" stroke="currentColor" stroke-width="2.2" opacity="0.5"/>
                <polygon points="55.1,43 76,36.2 88.9,54 76,71.8 55.1,65"
                         fill="none" stroke="currentColor" stroke-width="2.2" opacity="0.5"/>
                <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.36">
                    <line x1="36" y1="32" x2="36" y2="18"/>
                    <line x1="76" y1="71.8" x2="86" y2="84"/>
                </g>
                <g fill="currentColor">
                    <circle cx="16.9" cy="43" r="3.2" opacity="0.44"/>
                    <circle cx="16.9" cy="65" r="3.2" opacity="0.44"/>
                    <circle cx="36" cy="18" r="3.1" opacity="0.4"/>
                    <circle cx="76" cy="36.2" r="3.1" opacity="0.4"/>
                    <circle cx="76" cy="71.8" r="3.2" opacity="0.44"/>
                    <circle cx="86" cy="84" r="2.8" opacity="0.34"/>
                </g>
            </svg>
        `
    };

    const SHAPE_TYPES = Object.keys(MOLECULE_SHAPES);

    function createMolecule(layer) {
        const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
        const el = document.createElement('div');
        el.className = `biomolecule layer-${layer}`;
        el.innerHTML = MOLECULE_SHAPES[type];
        
        // Assign color based on type
        let colorSet;
        switch(type) {
            case 'dna': colorSet = CONFIG.colors.dna; break;
            case 'protein': colorSet = CONFIG.colors.protein; break;
            case 'rna': colorSet = CONFIG.colors.rna; break;
            default: colorSet = CONFIG.colors.protein;
        }
        const color = colorSet[Math.floor(Math.random() * colorSet.length)];
        el.style.color = color;
        
        // Random size variation within layer
        const baseSize = layer === 1 ? 60 : layer === 2 ? 100 : 140;
        const sizeVariation = 0.7 + Math.random() * 0.6;
        const size = baseSize * sizeVariation;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        
        // Random starting position
        el.style.left = `${Math.random() * 100}%`;
        el.style.top = `${Math.random() * 100}%`;
        
        // Random animation parameters
        const duration = 25 + Math.random() * 35; // 25-60s
        const delay = Math.random() * -60;
        const driftX = (Math.random() - 0.5) * 200; // -100 to 100px drift
        const driftY = (Math.random() - 0.5) * 150 - 50; // upward bias
        
        el.style.setProperty('--drift-x', `${driftX}px`);
        el.style.setProperty('--drift-y', `${driftY}px`);
        el.style.setProperty('--rotate-start', `${Math.random() * 360}deg`);
        el.style.setProperty('--rotate-end', `${Math.random() * 360 + 180}deg`);
        el.style.animationDuration = `${duration}s`;
        el.style.animationDelay = `${delay}s`;
        
        return el;
    }

    function init() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let container = document.getElementById('biomolecule-bg');
        if (!container) {
            container = document.createElement('div');
            container.id = 'biomolecule-bg';
            container.setAttribute('aria-hidden', 'true');
            
            // Insert as first child of body to sit behind everything
            const body = document.body;
            if (body.firstChild) {
                body.insertBefore(container, body.firstChild);
            } else {
                body.appendChild(container);
            }
        }

        // Clear existing
        container.innerHTML = '';

        // Create molecules distributed across layers
        const perLayer = Math.floor(CONFIG.moleculeCount / CONFIG.depthLayers);
        
        for (let layer = 1; layer <= CONFIG.depthLayers; layer++) {
            const count = layer === CONFIG.depthLayers 
                ? perLayer + (CONFIG.moleculeCount % CONFIG.depthLayers)
                : perLayer;
            
            for (let i = 0; i < count; i++) {
                container.appendChild(createMolecule(layer));
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-init on visibility change (in case user left and came back)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            const container = document.getElementById('biomolecule-bg');
            if (container) {
                // Reset any animations that may have stalled
                container.style.display = 'none';
                void container.offsetHeight; // force reflow
                container.style.display = '';
            }
        }
    });
})();
