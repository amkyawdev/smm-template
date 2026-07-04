import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initFlameBackground() {
    const container = document.getElementById('three-bg');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    camera.position.set(0, 2, 10);
    camera.lookAt(0, 2, 0);

    // ============ Blue Flame Texture ============
    function createFlameTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.1, 'rgba(200,230,255,0.9)');
        gradient.addColorStop(0.3, 'rgba(100,200,255,0.7)');
        gradient.addColorStop(0.5, 'rgba(50,150,255,0.5)');
        gradient.addColorStop(0.7, 'rgba(20,100,255,0.3)');
        gradient.addColorStop(0.85, 'rgba(10,50,200,0.15)');
        gradient.addColorStop(1, 'rgba(0,0,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }

    const texture = createFlameTexture();

    // ============ MAIN BLUE FLAME (300 particles) ============
    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 9 - 1;
        
        positions[i * 3] = Math.cos(angle) * radius * (0.3 + Math.random() * 0.7);
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius * 0.4;
        
        sizes[i] = 0.04 + Math.random() * 0.08;
        speeds[i] = 0.002 + Math.random() * 0.005;
        phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.5,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.8,
        color: 0x44aaff,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ============ INNER CORE (80 particles) ============
    const coreCount = 80;
    const coreGeo = new THREE.BufferGeometry();
    const corePos = new Float32Array(coreCount * 3);
    const coreSizes = new Float32Array(coreCount);
    const coreSpeeds = new Float32Array(coreCount);
    const corePhases = new Float32Array(coreCount);

    for (let i = 0; i < coreCount; i++) {
        const radius = Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 6;
        
        corePos[i * 3] = Math.cos(angle) * radius * (0.2 + Math.random() * 0.8);
        corePos[i * 3 + 1] = height;
        corePos[i * 3 + 2] = Math.sin(angle) * radius * 0.3;
        coreSizes[i] = 0.02 + Math.random() * 0.04;
        coreSpeeds[i] = 0.003 + Math.random() * 0.007;
        corePhases[i] = Math.random() * Math.PI * 2;
    }

    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
    coreGeo.setAttribute('size', new THREE.BufferAttribute(coreSizes, 1));

    const coreMat = new THREE.PointsMaterial({
        size: 0.3,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        color: 0xaaddff,
        sizeAttenuation: true
    });

    const coreParticles = new THREE.Points(coreGeo, coreMat);
    scene.add(coreParticles);

    // ============ GLOW LAYER (50 particles) ============
    const glowCount = 50;
    const glowGeo = new THREE.BufferGeometry();
    const glowPos = new Float32Array(glowCount * 3);
    const glowSizes = new Float32Array(glowCount);
    const glowSpeeds = new Float32Array(glowCount);

    for (let i = 0; i < glowCount; i++) {
        const radius = 0.5 + Math.random() * 3.5;
        const angle = Math.random() * Math.PI * 2;
        glowPos[i * 3] = Math.cos(angle) * radius;
        glowPos[i * 3 + 1] = Math.random() * 7;
        glowPos[i * 3 + 2] = Math.sin(angle) * radius * 0.3;
        glowSizes[i] = 0.4 + Math.random() * 1.0;
        glowSpeeds[i] = 0.001 + Math.random() * 0.003;
    }

    glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3));
    glowGeo.setAttribute('size', new THREE.BufferAttribute(glowSizes, 1));

    const glowMat = new THREE.PointsMaterial({
        size: 1.2,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.2,
        color: 0x2266ff,
        sizeAttenuation: true
    });

    const glowParticles = new THREE.Points(glowGeo, glowMat);
    scene.add(glowParticles);

    // ============ SPARKLES (25 particles) ============
    const sparkleCount = 25;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleSizes = new Float32Array(sparkleCount);
    const sparkleSpeeds = new Float32Array(sparkleCount);
    const sparklePhases = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
        const radius = 0.3 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        sparklePos[i * 3] = Math.cos(angle) * radius;
        sparklePos[i * 3 + 1] = 0.5 + Math.random() * 7;
        sparklePos[i * 3 + 2] = Math.sin(angle) * radius * 0.25;
        sparkleSizes[i] = 0.02 + Math.random() * 0.03;
        sparkleSpeeds[i] = 0.005 + Math.random() * 0.012;
        sparklePhases[i] = Math.random() * Math.PI * 2;
    }

    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    sparkleGeo.setAttribute('size', new THREE.BufferAttribute(sparkleSizes, 1));

    const sparkleMat = new THREE.PointsMaterial({
        size: 0.15,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.8,
        color: 0xffffff,
        sizeAttenuation: true
    });

    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // ============ BASE GLOW ============
    const baseGeo = new THREE.PlaneGeometry(8, 1.2);
    const baseMat = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const baseGlow = new THREE.Mesh(baseGeo, baseMat);
    baseGlow.position.set(0, -0.3, 0);
    baseGlow.rotation.x = -0.3;
    scene.add(baseGlow);

    // ============ ANIMATION ============
    let time = 0;

    function animate() {
        time += 0.016;

        // Main particles
        const posAttr = particles.geometry.attributes.position;
        const posArr = posAttr.array;

        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            posArr[idx + 1] += speeds[i] * 0.5;
            posArr[idx] += Math.sin(time * 0.5 + phases[i]) * 0.0008;
            posArr[idx + 2] += Math.cos(time * 0.4 + phases[i] * 0.7) * 0.0008;
            
            if (posArr[idx + 1] > 10) {
                const radius = Math.random() * 4;
                const angle = Math.random() * Math.PI * 2;
                posArr[idx] = Math.cos(angle) * radius * (0.3 + Math.random() * 0.7);
                posArr[idx + 1] = -0.5 - Math.random() * 0.5;
                posArr[idx + 2] = Math.sin(angle) * radius * 0.4;
                speeds[i] = 0.002 + Math.random() * 0.005;
                phases[i] = Math.random() * Math.PI * 2;
            }
        }
        posAttr.needsUpdate = true;

        // Core particles
        const coreAttr = coreParticles.geometry.attributes.position;
        const coreArr = coreAttr.array;

        for (let i = 0; i < coreCount; i++) {
            const idx = i * 3;
            coreArr[idx + 1] += coreSpeeds[i] * 0.7;
            coreArr[idx] += Math.sin(time * 0.6 + corePhases[i]) * 0.0005;
            coreArr[idx + 2] += Math.cos(time * 0.5 + corePhases[i] * 0.8) * 0.0005;
            
            if (coreArr[idx + 1] > 7) {
                const radius = Math.random() * 1.5;
                const angle = Math.random() * Math.PI * 2;
                coreArr[idx] = Math.cos(angle) * radius * (0.2 + Math.random() * 0.8);
                coreArr[idx + 1] = -0.3;
                coreArr[idx + 2] = Math.sin(angle) * radius * 0.3;
                coreSpeeds[i] = 0.003 + Math.random() * 0.007;
                corePhases[i] = Math.random() * Math.PI * 2;
            }
        }
        coreAttr.needsUpdate = true;

        // Glow
        const glowAttr = glowParticles.geometry.attributes.position;
        const glowArr = glowAttr.array;

        for (let i = 0; i < glowCount; i++) {
            const idx = i * 3;
            glowArr[idx + 1] += glowSpeeds[i] * 0.4;
            glowArr[idx] += Math.sin(time * 0.3 + i * 0.04) * 0.0006;
            glowArr[idx + 2] += Math.cos(time * 0.25 + i * 0.05) * 0.0006;
            
            if (glowArr[idx + 1] > 8) {
                const radius = 0.5 + Math.random() * 3.5;
                const angle = Math.random() * Math.PI * 2;
                glowArr[idx] = Math.cos(angle) * radius;
                glowArr[idx + 1] = -0.3;
                glowArr[idx + 2] = Math.sin(angle) * radius * 0.3;
                glowSpeeds[i] = 0.001 + Math.random() * 0.003;
            }
        }
        glowAttr.needsUpdate = true;

        // Sparkles
        const sparkleAttr = sparkles.geometry.attributes.position;
        const sparkleArr = sparkleAttr.array;

        for (let i = 0; i < sparkleCount; i++) {
            const idx = i * 3;
            sparkleArr[idx + 1] += sparkleSpeeds[i] * 0.7;
            sparkleArr[idx] += Math.sin(time * 0.8 + sparklePhases[i]) * 0.0015;
            sparkleArr[idx + 2] += Math.cos(time * 0.7 + sparklePhases[i]) * 0.0015;
            
            if (sparkleArr[idx + 1] > 8) {
                const radius = 0.3 + Math.random() * 3;
                const angle = Math.random() * Math.PI * 2;
                sparkleArr[idx] = Math.cos(angle) * radius;
                sparkleArr[idx + 1] = 0.3 + Math.random() * 0.5;
                sparkleArr[idx + 2] = Math.sin(angle) * radius * 0.25;
                sparkleSpeeds[i] = 0.005 + Math.random() * 0.012;
                sparklePhases[i] = Math.random() * Math.PI * 2;
            }
        }
        sparkleAttr.needsUpdate = true;

        // Opacity pulsing
        particles.material.opacity = 0.75 + Math.sin(time * 0.25) * 0.1;
        coreParticles.material.opacity = 0.85 + Math.sin(time * 0.3 + 0.5) * 0.1;
        glowParticles.material.opacity = 0.15 + Math.sin(time * 0.2 + 1) * 0.06;
        sparkles.material.opacity = 0.6 + Math.sin(time * 0.5) * 0.25;
        baseGlow.material.opacity = 0.08 + Math.sin(time * 0.3) * 0.04;

        // Rotation
        glowParticles.rotation.y += 0.0002;
        sparkles.rotation.y += 0.0004;

        // Camera
        camera.position.x = Math.sin(time * 0.04) * 0.4;
        camera.position.z = 10 + Math.sin(time * 0.025) * 0.2;
        camera.lookAt(0, 2.5, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    // ============ RESIZE ============
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    return () => {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
    };
}