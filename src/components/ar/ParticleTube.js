import * as THREE from 'three';

/**
 * ParticleTube - A reusable particle tube effect with content display
 * Compatible with Three.js and designed for easy Locar.js integration
 * 
 * @example
 * // Basic usage
 * const tube = new ParticleTube({ scene: myScene, camera: myCamera });
 * await tube.setImages([file1, file2]);
 * tube.setText("Hello World");
 * await tube.showContent();
 * 
 * @example
 * // Locar.js integration
 * import * as LocAR from 'locar';
 * const locar = new LocAR.LocationBased(scene, camera);
 * const tube = new ParticleTube({ scene, camera, position: { lat: 51.5, lon: -0.1 } });
 * locar.add(tube.getGroup(), tube.position.lon, tube.position.lat);
 */
export class ParticleTube {
    /**
     * @param {Object} config - Configuration object
     * @param {THREE.Scene} config.scene - Three.js scene (optional, creates one if not provided)
     * @param {THREE.Camera} config.camera - Three.js camera (optional, creates one if not provided)
     * @param {Object} config.position - GPS position for Locar.js { lat, lon }
     * @param {number} config.particleCount - Number of particles (default: 25000)
     * @param {number} config.tubeRadius - Tube radius (default: 0.6)
     * @param {number} config.tubeHeight - Tube height (default: 8)
     * @param {number} config.maxImages - Max images allowed (default: 5)
     * @param {number} config.maxTextLength - Max text length (default: 1000)
     * @param {number} config.imageMaxSize - Max image dimension for optimization (default: 512)
     */
    constructor(config = {}) {
        // Configuration
        this.PARTICLE_COUNT = config.particleCount || 25000;
        this.TUBE_RADIUS = config.tubeRadius || 0.6;
        this.TUBE_HEIGHT = config.tubeHeight || 8;
        this.MAX_IMAGES = config.maxImages || 5;
        this.MAX_TEXT_LENGTH = config.maxTextLength || 1000;
        this.IMAGE_MAX_SIZE = config.imageMaxSize || 512;
        
        // External scene/camera or create new ones
        this.scene = config.scene;
        this.camera = config.camera;
        this.ownScene = !config.scene;
        
        // GPS position for Locar.js
        this.position = config.position || null;
        
        // Content state
        this.images = [];
        this.text = '';
        this.contentPlanes = [];
        this.contentVisible = false;
        this.contentOpacity = 0;
        this.isAnimatingContent = false;
        
        // Animation state
        this.isExploding = false;
        this.explosionProgress = 0;
        this.EXPLOSION_DURATION = 0.8;
        
        // Group for all tube elements (useful for Locar.js positioning)
        this.group = new THREE.Group();
        
        // Event callbacks
        this.onContentShow = null;
        this.onContentHide = null;
        this.onExplosionStart = null;
        this.onExplosionComplete = null;
        this.onReset = null;
        
        this.init();
    }

    init() {
        this.createLighting();
        this.createTube();
        this.createParticles();
        
        // If we have an external scene, add our group to it
        if (this.scene) {
            this.scene.add(this.group);
        }
        
        this.clock = new THREE.Clock();
    }

    /**
     * Get the Three.js group containing all tube elements
     * Use this for Locar.js positioning
     */
    getGroup() {
        return this.group;
    }

    /**
     * Get the Three.js scene (creates one if needed)
     */
    getScene() {
        if (!this.scene) {
            this.scene = new THREE.Scene();
            this.scene.add(this.group);
        }
        return this.scene;
    }

    createLighting() {
        // Point lights inside the tube
        this.tubeLight1 = new THREE.PointLight(0x88ccff, 3, 15);
        this.tubeLight1.position.set(0, this.TUBE_HEIGHT * 0.3, 0);
        this.group.add(this.tubeLight1);

        this.tubeLight2 = new THREE.PointLight(0x88ccff, 3, 15);
        this.tubeLight2.position.set(0, -this.TUBE_HEIGHT * 0.3, 0);
        this.group.add(this.tubeLight2);

        this.tubeLight3 = new THREE.PointLight(0xaaddff, 2, 12);
        this.tubeLight3.position.set(0, 0, 0);
        this.group.add(this.tubeLight3);
    }

    createLightBeamTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(200, 230, 255, 0.05)');
        gradient.addColorStop(0.1, 'rgba(180, 220, 255, 0.2)');
        gradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.35)');
        gradient.addColorStop(0.9, 'rgba(180, 220, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(200, 230, 255, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            const width = 5 + Math.random() * 20;
            const streakGradient = ctx.createLinearGradient(x, 0, x, canvas.height);
            streakGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
            streakGradient.addColorStop(0.2, 'rgba(200, 240, 255, 0.2)');
            streakGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            streakGradient.addColorStop(0.8, 'rgba(200, 240, 255, 0.2)');
            streakGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            
            ctx.fillStyle = streakGradient;
            ctx.fillRect(x - width/2, 0, width, canvas.height);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    createTube() {
        // Inner cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(
            this.TUBE_RADIUS - 0.05, 
            this.TUBE_RADIUS - 0.05, 
            this.TUBE_HEIGHT, 32, 1, true
        );
        const lightBeamTexture = this.createLightBeamTexture();
        this.cylinderMaterial = new THREE.MeshBasicMaterial({
            map: lightBeamTexture,
            color: 0x88ccff,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.innerCylinder = new THREE.Mesh(cylinderGeometry, this.cylinderMaterial);
        this.group.add(this.innerCylinder);

        // Outer glow cylinder
        const glowCylinderGeometry = new THREE.CylinderGeometry(
            this.TUBE_RADIUS + 0.15, 
            this.TUBE_RADIUS + 0.15, 
            this.TUBE_HEIGHT, 32, 1, true
        );
        this.glowCylinderMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaddff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.glowCylinder = new THREE.Mesh(glowCylinderGeometry, this.glowCylinderMaterial);
        this.group.add(this.glowCylinder);
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(150, 220, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(100, 180, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(50, 150, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        return new THREE.CanvasTexture(canvas);
    }

    initTubeParticles() {
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.TUBE_RADIUS + (Math.random() - 0.5) * 0.1;
            const height = (Math.random() - 0.5) * this.TUBE_HEIGHT;

            const x = Math.cos(angle) * radius;
            const y = height;
            const z = Math.sin(angle) * radius;

            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;

            this.originalPositions[i * 3] = x;
            this.originalPositions[i * 3 + 1] = y;
            this.originalPositions[i * 3 + 2] = z;

            const t = (height + this.TUBE_HEIGHT / 2) / this.TUBE_HEIGHT;
            this.colors[i * 3] = 0.4 + t * 0.2;
            this.colors[i * 3 + 1] = 0.7 + t * 0.2;
            this.colors[i * 3 + 2] = 1.0;

            this.sizes[i] = Math.random() * 0.025 + 0.015;
            this.alphas[i] = 0.7 + Math.random() * 0.3;

            this.velocities[i * 3] = 0;
            this.velocities[i * 3 + 1] = 0;
            this.velocities[i * 3 + 2] = 0;
        }
    }

    createParticles() {
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.PARTICLE_COUNT * 3);
        this.colors = new Float32Array(this.PARTICLE_COUNT * 3);
        this.sizes = new Float32Array(this.PARTICLE_COUNT);
        this.velocities = new Float32Array(this.PARTICLE_COUNT * 3);
        this.originalPositions = new Float32Array(this.PARTICLE_COUNT * 3);
        this.alphas = new Float32Array(this.PARTICLE_COUNT);

        this.initTubeParticles();

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));

        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: this.createParticleTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute float alpha;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    if (texColor.a < 0.1) discard;
                    gl_FragColor = vec4(vColor, texColor.a * vAlpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(this.geometry, this.particleMaterial);
        this.group.add(this.particles);
    }

    /**
     * Optimize image by resizing and compressing
     * @param {File|Blob|string} source - Image file, blob, or URL
     * @returns {Promise<string>} - Optimized image data URL
     */
    async optimizeImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                
                // Scale down if larger than max size
                if (width > this.IMAGE_MAX_SIZE || height > this.IMAGE_MAX_SIZE) {
                    const ratio = Math.min(
                        this.IMAGE_MAX_SIZE / width, 
                        this.IMAGE_MAX_SIZE / height
                    );
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG with quality 0.7
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            
            // Handle different source types
            if (typeof source === 'string') {
                img.src = source;
            } else if (source instanceof File || source instanceof Blob) {
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(source);
            } else {
                reject(new Error('Invalid image source'));
            }
        });
    }

    /**
     * Set images to display in the tube
     * @param {Array<File|Blob|string>} sources - Array of image files, blobs, or URLs
     * @returns {Promise<string[]>} - Array of optimized image URLs
     */
    async setImages(sources) {
        this.images = [];
        
        const sourcesToProcess = sources.slice(0, this.MAX_IMAGES);
        
        for (const source of sourcesToProcess) {
            try {
                const optimizedUrl = await this.optimizeImage(source);
                this.images.push(optimizedUrl);
            } catch (error) {
                console.warn('Failed to process image:', error);
            }
        }
        
        return this.images;
    }

    /**
     * Set text to display in the tube
     * @param {string} text - Text content (max 1000 chars)
     * @returns {string} - The processed text
     */
    setText(text) {
        this.text = String(text).slice(0, this.MAX_TEXT_LENGTH);
        return this.text;
    }

    /**
     * Create a content canvas with images and text
     * @returns {HTMLCanvasElement}
     */
    createContentCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 512;
        canvas.height = 1024;
        
        // Transparent background - no fill
        
        return canvas;
    }

    /**
     * Render images onto the content canvas
     * @returns {Promise<HTMLCanvasElement>}
     */
    async renderContent() {
        const canvas = this.createContentCanvas();
        const ctx = canvas.getContext('2d');
        
        let yOffset = 30;
        const padding = 20;
        
        // Load and draw only the first image (5x larger)
        if (this.images.length > 0) {
            const imagePromise = new Promise((res) => {
                const img = new Image();
                img.onload = () => res(img);
                img.onerror = () => res(null);
                img.src = this.images[0]; // Only first image
            });
            
            const img = await imagePromise;
            
            if (img) {
                // Calculate image dimensions - 5x larger, taking up most of canvas
                const availableWidth = canvas.width - padding * 2;
                const imageHeight = 1500; // 5x larger
                const imageWidth = availableWidth; // Use full available width
                
                // Scale image to fit while maintaining aspect ratio
                let drawWidth = imageWidth;
                let drawHeight = imageHeight;
                const imgAspect = img.width / img.height;
                const targetAspect = imageWidth / imageHeight;
                
                if (imgAspect > targetAspect) {
                    // Image is wider - fit to width
                    drawHeight = imageWidth / imgAspect;
                } else {
                    // Image is taller - fit to height
                    drawWidth = imageHeight * imgAspect;
                }
                
                // Center image on canvas
                const xPos = (canvas.width - drawWidth) / 2;
                const yPos = yOffset;
                
                // Draw image (no border, no rounded corners)
                ctx.drawImage(img, xPos, yPos, drawWidth, drawHeight);
                
                // Update yOffset after image
                yOffset += drawHeight + 20;
            }
        }
        
        // Draw text with 55 character line wrapping
        if (this.text) {
            yOffset += 10;
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px "Segoe UI", sans-serif';
            ctx.textAlign = 'left';
            
            const maxCharsPerLine = 55;
            const lineHeight = 26;
            const textPadding = padding;
            
            // Split text into lines of max 55 characters
            let remainingText = this.text;
            let lineY = yOffset;
            
            while (remainingText.length > 0 && lineY < canvas.height - 50) {
                let line = '';
                
                if (remainingText.length <= maxCharsPerLine) {
                    // Last line - take all remaining text
                    line = remainingText;
                    remainingText = '';
                } else {
                    // Find the last space before maxCharsPerLine to avoid breaking words
                    let cutPoint = maxCharsPerLine;
                    const spaceIndex = remainingText.lastIndexOf(' ', maxCharsPerLine);
                    
                    if (spaceIndex > 0) {
                        cutPoint = spaceIndex;
                    }
                    
                    line = remainingText.substring(0, cutPoint);
                    remainingText = remainingText.substring(cutPoint).trim();
                }
                
                ctx.fillText(line, textPadding, lineY);
                lineY += lineHeight;
            }
            
            // If there's remaining text, add ellipsis
            if (remainingText.length > 0 && lineY < canvas.height - 50) {
                ctx.fillText('...', textPadding, lineY);
            }
        }
        
        return canvas;
    }

    /**
     * Create content plane and add to scene
     * @returns {Promise<THREE.Mesh|null>}
     */
    async createContentPlane() {
        this.clearContent();
        
        if (this.images.length === 0 && !this.text) {
            return null;
        }
        
        const contentCanvas = await this.renderContent();
        const texture = new THREE.CanvasTexture(contentCanvas);
        texture.needsUpdate = true;
        
        const aspectRatio = contentCanvas.height / contentCanvas.width;
        const planeWidth = 0.8;
        const planeHeight = planeWidth * aspectRatio;
        
        const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(0, 0, 0);
        
        this.contentPlanes.push(plane);
        this.group.add(plane);
        
        return plane;
    }

    /**
     * Show content with fade-in animation
     * Content will remain invisible until explosion starts
     * @returns {Promise<void>}
     */
    async showContent() {
        if (this.isAnimatingContent) return;
        
        await this.createContentPlane();
        
        if (this.contentPlanes.length === 0) {
            console.warn('No content to show');
            return;
        }
        
        // Keep content invisible initially - will become visible during explosion
        this.isAnimatingContent = false;
        this.contentVisible = false;
        this.contentOpacity = 0;
        
        // Set all planes to invisible
        for (const plane of this.contentPlanes) {
            plane.material.opacity = 0;
            plane.visible = false;
        }
        
        if (this.onContentShow) {
            this.onContentShow();
        }
    }

    /**
     * Hide content with fade-out animation
     */
    hideContent() {
        if (this.isAnimatingContent) return;
        
        this.isAnimatingContent = true;
        this.contentVisible = false;
        
        if (this.onContentHide) {
            this.onContentHide();
        }
    }

    /**
     * Clear all content planes
     */
    clearContent() {
        for (const plane of this.contentPlanes) {
            this.group.remove(plane);
            plane.geometry.dispose();
            plane.material.map?.dispose();
            plane.material.dispose();
        }
        this.contentPlanes = [];
        this.contentOpacity = 0;
    }

    /**
     * Start the explosion animation
     */
    startExplosion() {
        if (this.isExploding) return;
        
        this.isExploding = true;
        this.explosionProgress = 0;

        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            const x = this.positions[i * 3];
            const y = this.positions[i * 3 + 1];
            const z = this.positions[i * 3 + 2];

            const dx = x;
            const dy = y * 0.3;
            const dz = z;
            
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const speed = 4 + Math.random() * 5;
            
            this.velocities[i * 3] = (dx / length) * speed + (Math.random() - 0.5) * 0.5;
            this.velocities[i * 3 + 1] = (dy / length) * speed + Math.random() * 1.5;
            this.velocities[i * 3 + 2] = (dz / length) * speed + (Math.random() - 0.5) * 0.5;
        }
        
        if (this.onExplosionStart) {
            this.onExplosionStart();
        }
    }

    /**
     * Reset the tube to initial state
     */
    reset() {
        this.isExploding = false;
        this.explosionProgress = 0;
        this.initTubeParticles();
        
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.alpha.needsUpdate = true;
        
        this.cylinderMaterial.opacity = 0.35;
        this.glowCylinderMaterial.opacity = 0.1;
        this.innerCylinder.visible = true;
        this.glowCylinder.visible = true;
        this.innerCylinder.scale.set(1, 1, 1);
        this.glowCylinder.scale.set(1, 1, 1);
        
        this.tubeLight1.intensity = 3;
        this.tubeLight2.intensity = 3;
        this.tubeLight3.intensity = 2;
        
        this.clearContent();
        this.contentVisible = false;
        this.isAnimatingContent = false;
        
        if (this.onReset) {
            this.onReset();
        }
    }

    /**
     * Update the tube animation - call this in your render loop
     * @param {number} delta - Time delta in seconds (optional, uses internal clock if not provided)
     */
    update(delta) {
        if (delta === undefined) {
            delta = this.clock.getDelta();
        }
        
        this.particleMaterial.uniforms.time.value += delta;

        // Make content planes face camera if camera is provided
        if (this.camera) {
            for (const plane of this.contentPlanes) {
                plane.lookAt(this.camera.position);
            }
        }

        if (this.isExploding) {
            this.explosionProgress += delta;
            const progress = Math.min(this.explosionProgress / this.EXPLOSION_DURATION, 1);
            
            for (let i = 0; i < this.PARTICLE_COUNT; i++) {
                this.positions[i * 3] += this.velocities[i * 3] * delta;
                this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * delta;
                this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * delta;
                
                this.velocities[i * 3 + 1] -= 2 * delta;
                this.alphas[i] = Math.max(0, 1 - progress);
                this.sizes[i] *= 0.98;
            }
            
            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.attributes.alpha.needsUpdate = true;
            this.geometry.attributes.size.needsUpdate = true;
            
            this.cylinderMaterial.opacity = Math.max(0, 0.35 * (1 - progress * 2.5));
            this.glowCylinderMaterial.opacity = Math.max(0, 0.1 * (1 - progress * 2.5));
            
            this.tubeLight1.intensity = Math.max(0, 3 * (1 - progress * 2));
            this.tubeLight2.intensity = Math.max(0, 3 * (1 - progress * 2));
            this.tubeLight3.intensity = Math.max(0, 2 * (1 - progress * 2));
            
            const scale = 1 + progress * 1.2;
            this.innerCylinder.scale.set(scale, 1, scale);
            this.glowCylinder.scale.set(scale, 1, scale);
            
            // Make content visible when explosion starts (after tube starts fading)
            if (progress >= 0.2 && this.contentPlanes.length > 0) {
                // Fade in content as explosion progresses
                const contentProgress = Math.min((progress - 0.2) / 0.8, 1); // Start at 20% progress
                this.contentOpacity = contentProgress;
                
                for (const plane of this.contentPlanes) {
                    plane.visible = true;
                    plane.material.opacity = this.contentOpacity;
                }
            }
            
            if (progress >= 0.4) {
                this.innerCylinder.visible = false;
                this.glowCylinder.visible = false;
            }
            
            if (progress >= 1 && this.onExplosionComplete) {
                this.onExplosionComplete();
            }
        } else {
            const time = this.particleMaterial.uniforms.time.value;
            for (let i = 0; i < this.PARTICLE_COUNT; i++) {
                const originalY = this.originalPositions[i * 3 + 1];
                const originalX = this.originalPositions[i * 3];
                const originalZ = this.originalPositions[i * 3 + 2];
                
                const wave = Math.sin(time * 2 + originalY * 2) * 0.02;
                this.positions[i * 3] = originalX + wave;
                this.positions[i * 3 + 2] = originalZ + wave;
            }
            this.geometry.attributes.position.needsUpdate = true;
            
            const pulse = Math.sin(time * 3) * 0.05 + 1;
            this.cylinderMaterial.opacity = 0.3 + Math.sin(time * 2) * 0.05;
            this.innerCylinder.scale.set(pulse, 1, pulse);
            
            const lightPulse = Math.sin(time * 4) * 0.5 + 1;
            this.tubeLight1.intensity = 2.5 + lightPulse;
            this.tubeLight2.intensity = 2.5 + lightPulse;
            this.tubeLight3.intensity = 1.5 + lightPulse * 0.5;
        }
    }

    /**
     * Export configuration for Locar.js integration
     * @returns {Object}
     */
    exportForLocar() {
        return {
            particleCount: this.PARTICLE_COUNT,
            tubeRadius: this.TUBE_RADIUS,
            tubeHeight: this.TUBE_HEIGHT,
            images: [...this.images],
            text: this.text,
            position: this.position ? { ...this.position } : null,
            cameraPosition: this.camera ? this.camera.position.toArray() : null,
            groupPosition: this.group.position.toArray(),
            groupRotation: this.group.rotation.toArray()
        };
    }

    /**
     * Set position for Locar.js GPS-based positioning
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     */
    setGPSPosition(lat, lon) {
        this.position = { lat, lon };
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        this.clearContent();
        
        // Dispose particles
        this.geometry.dispose();
        this.particleMaterial.dispose();
        this.group.remove(this.particles);
        
        // Dispose cylinders
        this.innerCylinder.geometry.dispose();
        this.cylinderMaterial.dispose();
        this.glowCylinder.geometry.dispose();
        this.glowCylinderMaterial.dispose();
        
        this.group.remove(this.innerCylinder);
        this.group.remove(this.glowCylinder);
        this.group.remove(this.tubeLight1);
        this.group.remove(this.tubeLight2);
        this.group.remove(this.tubeLight3);
        
        if (this.scene) {
            this.scene.remove(this.group);
        }
    }
}

export default ParticleTube;
