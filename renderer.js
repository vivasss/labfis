// ===================================
// RENDERER - THREE.JS
// ===================================

class PhysicsRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;

        // Visual elements
        this.ground = null;
        this.axes = null;
        this.lights = [];

        // Settings
        this.showWireframe = false;
        this.showAxes = true;

        // Stats
        this.stats = {
            fps: 0,
            lastTime: performance.now(),
            frames: 0,
        };

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f1419);
        this.scene.fog = new THREE.Fog(0x0f1419, 50, 200);

        // Camera setup
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground

        // Raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Lighting
        this.setupLights();

        // Ground
        this.createGround();

        // Axes helper
        this.createAxes();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;

        // Shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;

        this.scene.add(directionalLight);
        this.lights.push(directionalLight);

        // Hemisphere light for better color
        const hemisphereLight = new THREE.HemisphereLight(0x00d4ff, 0x00ff88, 0.3);
        this.scene.add(hemisphereLight);
        this.lights.push(hemisphereLight);
    }

    createGround() {
        // Ground plane with grid
        const gridHelper = new THREE.GridHelper(50, 50, 0x00ff88, 0x2a3f5f);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);

        // Solid ground for shadows
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.ShadowMaterial({
            color: 0x000000,
            opacity: 0.3,
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    createAxes() {
        this.axes = new THREE.AxesHelper(10);
        this.axes.visible = this.showAxes;
        this.scene.add(this.axes);
    }

    // Get click position on ground plane
    getGroundIntersection(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Create invisible plane at y=0 for intersection
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersection);

        return intersection;
    }

    // Toggle wireframe mode
    toggleWireframe(show) {
        this.showWireframe = show;
        this.scene.traverse((child) => {
            if (child.isMesh && child !== this.ground) {
                child.material.wireframe = show;
            }
        });
    }

    // Toggle axes helper
    toggleAxes(show) {
        this.showAxes = show;
        if (this.axes) {
            this.axes.visible = show;
        }
    }

    // Calculate FPS
    updateFPS() {
        const currentTime = performance.now();
        this.stats.frames++;

        if (currentTime >= this.stats.lastTime + 1000) {
            this.stats.fps = Math.round((this.stats.frames * 1000) / (currentTime - this.stats.lastTime));
            this.stats.frames = 0;
            this.stats.lastTime = currentTime;
        }

        return this.stats.fps;
    }

    // Handle window resize
    onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Render scene
    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.updateFPS();
    }

    // Get renderer stats
    getStats() {
        return {
            fps: this.stats.fps,
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsRenderer;
}
