// Three.js Flames - Down to Up Particle Animation
(function() {
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Sky blue color palette
    const colors = {
        primary: 0x0ea5e9,
        primaryDark: 0x0284c7,
        primaryLight: 0x38bdf8,
        secondary: 0x06b6d4,
        accent: 0x22d3ee
    };

    // Create particle groups for 3 layers
    const particleLayers = [];
    const particleSpeeds = [];
    const particleData = [];

    // Layer 1: Large slow particles (bottom to top)
    function createLargeParticles() {
        const count = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const color = new THREE.Color(colors.primary);

        for (let i = 0; i < count; i++) {
            // Start from bottom
            positions[i * 3] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 1] = -5 + Math.random() * 2; // Bottom area
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 0.15 + 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        particleLayers.push(particles);
        particleSpeeds.push(0.002 + Math.random() * 0.002);
        particleData.push({ minY: -5, maxY: 10, resetBelow: -6 });
    }

    // Layer 2: Medium particles
    function createMediumParticles() {
        const count = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const color = new THREE.Color(colors.primaryLight);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = -5 + Math.random() * 3; // Start from bottom
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

            // Vary colors slightly
            const variation = Math.random() * 0.2;
            colors[i * 3] = Math.min(1, color.r + variation);
            colors[i * 3 + 1] = Math.min(1, color.g + variation);
            colors[i * 3 + 2] = Math.min(1, color.b + variation);

            sizes[i] = Math.random() * 0.08 + 0.04;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        particleLayers.push(particles);
        particleSpeeds.push(0.004 + Math.random() * 0.003);
        particleData.push({ minY: -5, maxY: 10, resetBelow: -6 });
    }

    // Layer 3: Small spark particles
    function createSparkParticles() {
        const count = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Start from bottom
            positions[i * 3] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 1] = -5 + Math.random() * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

            // Vary colors between primary and accent
            const colorChoice = Math.random();
            let color;
            if (colorChoice < 0.33) {
                color = new THREE.Color(colors.primary);
            } else if (colorChoice < 0.66) {
                color = new THREE.Color(colors.primaryLight);
            } else {
                color = new THREE.Color(colors.accent);
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 0.03 + 0.01;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        particleLayers.push(particles);
        particleSpeeds.push(0.006 + Math.random() * 0.004);
        particleData.push({ minY: -5, maxY: 10, resetBelow: -6 });
    }

    // Create all particle layers
    createLargeParticles();
    createMediumParticles();
    createSparkParticles();

    // Camera position
    camera.position.z = 8;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation variables
    let time = 0;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Smooth mouse following
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Update each particle layer
        particleLayers.forEach((particles, index) => {
            const positions = particles.geometry.attributes.position.array;
            const data = particleData[index];
            const speed = particleSpeeds[index];

            for (let i = 0; i < positions.length / 3; i++) {
                // Move particles upward (bottom to top)
                positions[i * 3 + 1] += speed;

                // Add slight horizontal drift
                positions[i * 3] += Math.sin(time + i) * 0.001;

                // Add slight flickering in opacity/size based on position
                const normalizedY = (positions[i * 3 + 1] + 5) / 15; // Normalize between -5 and 10
                
                // Reset particle to bottom when it goes above maxY
                if (positions[i * 3 + 1] > data.maxY) {
                    positions[i * 3] = (Math.random() - 0.5) * (10 + index * 2);
                    positions[i * 3 + 1] = data.resetBelow;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * (6 + index * 2);
                }
            }

            particles.geometry.attributes.position.needsUpdate = true;

            // Subtle rotation based on mouse position
            particles.rotation.x = targetY * 0.1;
            particles.rotation.y = targetX * 0.1;
        });

        renderer.render(scene, camera);
    }

    // Start animation
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Add CSS for canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
})();
