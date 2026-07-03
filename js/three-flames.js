/**
 * SMM Service - Three Flames Background Animation
 * Three.js based particle system for flame effect
 */

class FlameAnimation {
    constructor(canvasId = 'bg-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.animationId = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupParticles();
        this.setupLighting();
        this.setupResize();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 15;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
    }

    setupParticles() {
        // Main flame particles
        this.createParticleSystem('flame', 2000, {
            color: new THREE.Color(0xff6b35),
            size: 0.15,
            speed: 0.08,
            spread: 30,
            height: 20
        });

        // Spark particles
        this.createParticleSystem('spark', 500, {
            color: new THREE.Color(0xffd93d),
            size: 0.08,
            speed: 0.15,
            spread: 25,
            height: 25
        });

        // Smoke particles
        this.createParticleSystem('smoke', 300, {
            color: new THREE.Color(0x4a4a4a),
            size: 0.25,
            speed: 0.02,
            spread: 35,
            height: 30
        });
    }

    createParticleSystem(type, count, config) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count);
        
        const baseColor = config.color;

        for (let i = 0; i < count; i++) {
            // Initial positions
            positions[i * 3] = (Math.random() - 0.5) * config.spread;
            positions[i * 3 + 1] = Math.random() * config.height - 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * config.spread;
            
            // Colors with variation
            colors[i * 3] = baseColor.r + (Math.random() - 0.5) * 0.2;
            colors[i * 3 + 1] = baseColor.g + (Math.random() - 0.5) * 0.2;
            colors[i * 3 + 2] = baseColor.b + (Math.random() - 0.5) * 0.2;
            
            // Random sizes
            sizes[i] = config.size * (0.5 + Math.random() * 0.5);
            
            // Random speeds
            speeds[i] = config.speed * (0.5 + Math.random());
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

        const material = new THREE.PointsMaterial({
            size: config.size,
            vertexColors: true,
            transparent: true,
            opacity: type === 'smoke' ? 0.3 : 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            type,
            config,
            speeds
        };

        this.scene.add(particles);
        this.particles.push(particles);
    }

    setupLighting() {
        // Ambient light for overall scene
        const ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(ambient);

        // Point light for flame effect
        const pointLight = new THREE.PointLight(0xff6b35, 1, 50);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.particles.forEach(particles => {
            const { type, config } = particles.userData;
            const positions = particles.geometry.attributes.position.array;
            const speeds = particles.geometry.attributes.speed.array;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                
                // Move upward
                positions[i3 + 1] += speeds[i];
                
                // Add wobble effect
                positions[i3] += Math.sin(time * 2 + i * 0.1) * 0.01;
                positions[i3 + 2] += Math.cos(time * 2 + i * 0.1) * 0.01;
                
                // Reset particle when it goes above threshold
                if (positions[i3 + 1] > config.height) {
                    positions[i3 + 1] = -5;
                    positions[i3] = (Math.random() - 0.5) * config.spread;
                    positions[i3 + 2] = (Math.random() - 0.5) * config.spread;
                }
            }

            particles.geometry.attributes.position.needsUpdate = true;
        });

        // Subtle camera movement
        this.camera.position.x = Math.sin(time * 0.2) * 0.5;
        this.camera.position.y = Math.cos(time * 0.1) * 0.3;

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.particles.forEach(particles => {
            particles.geometry.dispose();
            particles.material.dispose();
            this.scene.remove(particles);
        });
        
        this.particles = [];
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.log('Three.js not loaded');
        return;
    }
    
    // Only initialize if canvas exists
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        window.flameAnimation = new FlameAnimation();
    }
});

// Export for manual initialization
window.FlameAnimation = FlameAnimation;
