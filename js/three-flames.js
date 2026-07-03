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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Camera position
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 2, 0);

    // ============ MAIN FLAME PARTICLES ============
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const driftX = new Float32Array(particleCount);
    const driftZ = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const originalX = new Float32Array(particleCount);
    const originalZ = new Float32Array(particleCount);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 10 - 2;
        
        originalX[i] = Math.cos(angle) * radius * (0.3 + Math.random() * 0.7);
        originalZ[i] = Math.sin(angle) * radius * (0.3 + Math.random() * 0.7) * 0.5;
        
        positions[i * 3] = originalX[i];
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = originalZ[i];
        
        sizes[i] = 0.03 + Math.random() * 0.08;
        speeds[i] = 0.003 + Math.random() * 0.012;
        driftX[i] = (Math.random() - 0.5) * 0.015;
        driftZ[i] = (Math.random() - 0.5) * 0.015;
        phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create gradient texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Radial gradient for soft flame particles
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.05, 'rgba(255, 230, 180, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 200, 100, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 150, 50, 0.7)');
    gradient.addColorStop(0.6, 'rgba(255, 80, 20, 0.5)');
    gradient.addColorStop(0.8, 'rgba(200, 30, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);

    // Main particle material
    const material = new THREE.PointsMaterial({
        size: 0.35,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.85,
        color: 0xff6633,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ============ GLOW LAYER (ပိုကြီးတဲ့ အမှုန်များ) ============
    const glowCount = 400;
    const glowGeometry = new THREE.BufferGeometry();
    const glowPositions = new Float32Array(glowCount * 3);
    const glowSizes = new Float32Array(glowCount);
    const glowSpeeds = new Float32Array(glowCount);
    const glowDriftX = new Float32Array(glowCount);
    const glowDriftZ = new Float32Array(glowCount);

    for (let i = 0; i < glowCount; i++) {
        const radius = 1 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        glowPositions[i * 3] = Math.cos(angle) * radius;
        glowPositions[i * 3 + 1] = Math.random() * 8 - 1;
        glowPositions[i * 3 + 2] = Math.sin(angle) * radius * 0.4;
        glowSizes[i] = 0.3 + Math.random() * 0.8;
        glowSpeeds[i] = 0.002 + Math.random() * 0.006;
        glowDriftX[i] = (Math.random() - 0.5) * 0.01;
        glowDriftZ[i] = (Math.random() - 0.5) * 0.01;
    }

    glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    glowGeometry.setAttribute('size', new THREE.BufferAttribute(glowSizes, 1));

    // Glow texture (ပိုပျော့ပျောင်းတဲ့ အလင်းတန်း)
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const gCtx = glowCanvas.getContext('2d');
    const gGradient = gCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gGradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
    gGradient.addColorStop(0.3, 'rgba(255, 120, 40, 0.8)');
    gGradient.addColorStop(0.7, 'rgba(200, 50, 0, 0.4)');
    gGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    gCtx.fillStyle = gGradient;
    gCtx.fillRect(0, 0, 64, 64);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);

    const glowMaterial = new THREE.PointsMaterial({
        size: 0.8,
        map: glowTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.4,
        color: 0xff4400,
        sizeAttenuation: true
    });

    const glowParticles = new THREE.Points(glowGeometry, glowMaterial);
    scene.add(glowParticles);

    // ============ SPARKLE PARTICLES (တောက်ပသော အမှုန်များ) ============
    const sparkleCount = 150;
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleSizes = new Float32Array(sparkleCount);
    const sparkleSpeeds = new Float32Array(sparkleCount);
    const sparklePhases = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
        const radius = 0.5 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        sparklePositions[i * 3] = Math.cos(angle) * radius;
        sparklePositions[i * 3 + 1] = 1 + Math.random() * 7;
        sparklePositions[i * 3 + 2] = Math.sin(angle) * radius * 0.3;
        sparkleSizes[i] = 0.02 + Math.random() * 0.04;
        sparkleSpeeds[i] = 0.005 + Math.random() * 0.015;
        sparklePhases[i] = Math.random() * Math.PI * 2;
    }

    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    sparkleGeometry.setAttribute('size', new THREE.BufferAttribute(sparkleSizes, 1));

    // Sparkle texture
    const sparkleCanvas = document.createElement('canvas');
    sparkleCanvas.width = 32;
    sparkleCanvas.height = 32;
    const sCtx = sparkleCanvas.getContext('2d');
    const sGradient = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    sGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sGradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.8)');
    sGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
    sGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    sCtx.fillStyle = sGradient;
    sCtx.fillRect(0, 0, 32, 32);
    const sparkleTexture = new THREE.CanvasTexture(sparkleCanvas);

    const sparkleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        map: sparkleTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        color: 0xffffff,
        sizeAttenuation: true
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    // ============ BASE GLOW (အောက်ခြေအလင်းတန်း) ============
    const baseGlowGeometry = new THREE.PlaneGeometry(12, 2);
    const baseGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4422,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const baseGlow = new THREE.Mesh(baseGlowGeometry, baseGlowMaterial);
    baseGlow.position.set(0, -0.5, 0);
    baseGlow.rotation.x = -0.3;
    scene.add(baseGlow);

    // ဒုတိယအလင်းတန်း
    const baseGlow2Geometry = new THREE.PlaneGeometry(8, 1.5);
    const baseGlow2Material = new THREE.MeshBasicMaterial({
        color: 0xff6622,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const baseGlow2 = new THREE.Mesh(baseGlow2Geometry, baseGlow2Material);
    baseGlow2.position.set(0, 0.5, 0);
    baseGlow2.rotation.x = -0.2;
    scene.add(baseGlow2);

    // ============ ANIMATION LOOP ============
    let time = 0;
    const clock = new THREE.Clock();

    function animate() {
        const delta = clock.getDelta();
        time += delta;

        // 1. Main particles animation
        const positionsAttr = particles.geometry.attributes.position;
        const posArray = positionsAttr.array;
        const posCount = posArray.length / 3;

        for (let i = 0; i < posCount; i++) {
            const idx = i * 3;
            
            // ညင်သာစွာ အပေါ်သို့ တက်ခြင်း
            posArray[idx + 1] += speeds[i] * (0.6 + Math.sin(time * 0.3 + phases[i]) * 0.3);
            
            // ဘေးသို့ ယိမ်းခြင်း (ညင်သာစွာ)
            posArray[idx] += Math.sin(time * 0.5 + i * 0.05) * 0.001 * 2;
            posArray[idx + 2] += Math.cos(time * 0.4 + i * 0.07) * 0.001 * 2;
            
            // လေတိုက်သလို ဘေးယိမ်းခြင်း
            posArray[idx] += Math.sin(time * 0.2 + i * 0.03) * 0.0005;
            posArray[idx + 2] += Math.cos(time * 0.15 + i * 0.04) * 0.0005;
            
            // Reset to bottom when too high
            if (posArray[idx + 1] > 11) {
                const radius = Math.random() * 5;
                const angle = Math.random() * Math.PI * 2;
                posArray[idx] = Math.cos(angle) * radius * (0.3 + Math.random() * 0.7);
                posArray[idx + 1] = -1 - Math.random() * 1.5;
                posArray[idx + 2] = Math.sin(angle) * radius * (0.3 + Math.random() * 0.7) * 0.4;
                speeds[i] = 0.003 + Math.random() * 0.012;
                phases[i] = Math.random() * Math.PI * 2;
            }
        }
        positionsAttr.needsUpdate = true;

        // 2. Glow particles animation
        const glowPosAttr = glowParticles.geometry.attributes.position;
        const glowArray = glowPosAttr.array;
        const glowCount = glowArray.length / 3;

        for (let i = 0; i < glowCount; i++) {
            const idx = i * 3;
            glowArray[idx + 1] += glowSpeeds[i] * 0.5;
            
            glowArray[idx] += Math.sin(time * 0.3 + i * 0.04) * 0.0008;
            glowArray[idx + 2] += Math.cos(time * 0.25 + i * 0.05) * 0.0008;
            
            if (glowArray[idx + 1] > 10) {
                const radius = 1 + Math.random() * 4;
                const angle = Math.random() * Math.PI * 2;
                glowArray[idx] = Math.cos(angle) * radius;
                glowArray[idx + 1] = -0.5;
                glowArray[idx + 2] = Math.sin(angle) * radius * 0.4;
            }
        }
        glowPosAttr.needsUpdate = true;

        // 3. Sparkle particles animation (တောက်ပပြီး လျှင်မြန်စွာ တက်ခြင်း)
        const sparklePosAttr = sparkles.geometry.attributes.position;
        const sparkleArray = sparklePosAttr.array;
        const sparkleCount = sparkleArray.length / 3;

        for (let i = 0; i < sparkleCount; i++) {
            const idx = i * 3;
            sparkleArray[idx + 1] += sparkleSpeeds[i] * 1.5;
            
            sparkleArray[idx] += Math.sin(time * 0.8 + sparklePhases[i]) * 0.002;
            sparkleArray[idx + 2] += Math.cos(time * 0.7 + sparklePhases[i]) * 0.002;
            
            if (sparkleArray[idx + 1] > 10) {
                const radius = 0.5 + Math.random() * 3;
                const angle = Math.random() * Math.PI * 2;
                sparkleArray[idx] = Math.cos(angle) * radius;
                sparkleArray[idx + 1] = 0.5 + Math.random() * 0.5;
                sparkleArray[idx + 2] = Math.sin(angle) * radius * 0.3;
                sparkleSpeeds[i] = 0.005 + Math.random() * 0.015;
                sparklePhases[i] = Math.random() * Math.PI * 2;
            }
        }
        sparklePosAttr.needsUpdate = true;

        // 4. Opacity pulsing (ညင်သာစွာ တချက်ချက် တောက်ခြင်း)
        const pulse = 0.75 + Math.sin(time * 0.3) * 0.15;
        particles.material.opacity = pulse * 0.85;
        glowParticles.material.opacity = 0.3 + Math.sin(time * 0.2 + 1) * 0.1;
        
        // Sparkle opacity (တချက်ချက် တောက်ပခြင်း)
        sparkles.material.opacity = 0.6 + Math.sin(time * 0.5) * 0.3;

        // 5. Base glow pulsing
        baseGlow.material.opacity = 0.12 + Math.sin(time * 0.4) * 0.05;
        baseGlow2.material.opacity = 0.08 + Math.sin(time * 0.3 + 0.5) * 0.04;

        // 6. Rotate glow layer slowly (ညင်သာစွာ လည်ခြင်း)
        glowParticles.rotation.y += 0.0003;
        glowParticles.rotation.x += 0.0001;

        // 7. Sparkles rotation
        sparkles.rotation.y += 0.0005;

        // 8. Camera slight movement (ကင်မရာ ညင်သာစွာ လှုပ်ခြင်း)
        camera.position.x = Math.sin(time * 0.05) * 0.5;
        camera.position.z = 12 + Math.sin(time * 0.03) * 0.3;
        camera.lookAt(0, 2.5, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    // ============ RESIZE HANDLER ============
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    // Return cleanup function
    return () => {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
    };
}