// Global instances
let physicsEngine;
let renderer;
let objectManager;
let animationId;
let lastTime = performance.now();

// UI State
let selectedShape = 'box';
let isPaused = false;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    setupIntro();
});

function setupIntro() {
    const startButton = document.getElementById('startButton');
    const introOverlay = document.getElementById('introOverlay');

    startButton.addEventListener('click', () => {
        introOverlay.classList.add('hidden');
        setTimeout(() => {
            init();
        }, 500);
    });
}

function init() {
    // Initialize physics engine
    physicsEngine = new PhysicsEngine();

    // Initialize renderer
    renderer = new PhysicsRenderer('physicsCanvas');

    // Initialize object manager
    objectManager = new ObjectManager(physicsEngine, renderer);

    // Setup controls
    setupControls();

    // Setup mouse interaction
    setupMouseInteraction();

    // Start animation loop
    animate();

    // Spawn initial objects
    spawnInitialObjects();
}

function spawnInitialObjects() {
    const initialObjects = [
        { type: 'sphere', delay: 0 },
        { type: 'box', delay: 400 },
        { type: 'cylinder', delay: 800 },
        { type: 'cone', delay: 1200 },
        { type: 'torus', delay: 1600 },
    ];

    initialObjects.forEach(obj => {
        setTimeout(() => {
            objectManager.spawnRandom(obj.type);
        }, obj.delay);
    });
}

function setupControls() {
    // Object selection buttons
    const objectButtons = document.querySelectorAll('.object-btn');
    objectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedShape = btn.dataset.shape;
            objectButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateHint();
        });
    });

    // Gravity control (only Y axis)
    const gravityY = document.getElementById('gravityY');
    gravityY.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById('gravityYValue').textContent = value.toFixed(1) + ' m/s²';
        physicsEngine.setGravity(0, value, 0);
    });

    // Material properties
    const restitution = document.getElementById('restitution');
    const friction = document.getElementById('friction');

    restitution.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById('restitutionValue').textContent = value.toFixed(2);
        physicsEngine.updateMaterialProperties(value, parseFloat(friction.value));
    });

    friction.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById('frictionValue').textContent = value.toFixed(2);
        physicsEngine.updateMaterialProperties(parseFloat(restitution.value), value);
    });

    // Clear button
    document.getElementById('clearAll').addEventListener('click', () => {
        objectManager.clearAll();
    });

    // Pause button
    document.getElementById('togglePause').addEventListener('click', () => {
        isPaused = !isPaused;
        physicsEngine.setPaused(isPaused);
        document.getElementById('togglePause').textContent = isPaused ? '▶️ Continuar' : '⏸️ Pausar';
    });

    // Reset button
    document.getElementById('resetPhysics').addEventListener('click', () => {
        resetSimulation();
    });
}
const shapeName = selectedShape.charAt(0).toUpperCase() + selectedShape.slice(1);
hint.textContent = `Clique para adicionar ${shapeName} | Arraste para mover`;
}

function resetSimulation() {
    objectManager.clearAll();

    // Reset gravity
    document.getElementById('gravityY').value = -9.8;
    document.getElementById('gravityYValue').textContent = '-9.8 m/s²';
    physicsEngine.setGravity(0, -9.8, 0);

    // Reset material properties
    document.getElementById('restitution').value = 0.3;
    document.getElementById('friction').value = 0.3;
    document.getElementById('restitutionValue').textContent = '0.30';
    document.getElementById('frictionValue').textContent = '0.30';
    physicsEngine.updateMaterialProperties(0.3, 0.3);

    // Reset pause
    if (isPaused) {
        isPaused = false;
        physicsEngine.setPaused(false);
        document.getElementById('togglePause').textContent = '⏸️ Pausar';
    }

    // Reset camera
    renderer.camera.position.set(15, 15, 15);
    renderer.camera.lookAt(0, 0, 0);
    renderer.controls.update();
}

function animate() {
    animationId = requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update physics
    physicsEngine.update(deltaTime);

    // Update object positions
    objectManager.update();

    // Render scene
    renderer.render();

    // Update stats
    updateStats();
}

function updateStats() {
    const renderStats = renderer.getStats();
    document.getElementById('fps').textContent = renderStats.fps;
    document.getElementById('objectCount').textContent = objectManager.getCount();
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    } else {
        lastTime = performance.now();
        animate();
    }
});
