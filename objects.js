// ===================================
// OBJECT MANAGEMENT SYSTEM
// ===================================

class ObjectManager {
    constructor(physicsEngine, renderer) {
        this.physicsEngine = physicsEngine;
        this.renderer = renderer;
        this.objects = [];
        this.objectId = 0;

        // Color palette for different shapes
        this.colors = {
            box: 0x00ff88,
            sphere: 0x00d4ff,
            cylinder: 0xb24bf3,
            cone: 0xff6b6b,
            torus: 0xffd93d,
        };
    }

    // Create a new object
    createObject(type, position, size = 2) {
        let mesh, body;
        const color = this.colors[type] || 0x00ff88;
        const mass = this.physicsEngine.settings.defaultMass;

        switch (type) {
            case 'box':
                mesh = this.createBox(size, color);
                body = this.physicsEngine.createBody(
                    { type: 'box', size: size },
                    mass,
                    position
                );
                break;

            case 'sphere':
                mesh = this.createSphere(size / 2, color);
                body = this.physicsEngine.createBody(
                    { type: 'sphere', radius: size / 2 },
                    mass,
                    position
                );
                break;

            case 'cylinder':
                mesh = this.createCylinder(size / 2, size, color);
                body = this.physicsEngine.createBody(
                    {
                        type: 'cylinder',
                        radiusTop: size / 2,
                        radiusBottom: size / 2,
                        height: size,
                        segments: 8
                    },
                    mass,
                    position
                );
                break;

            case 'cone':
                mesh = this.createCone(size / 2, size, color);
                body = this.physicsEngine.createBody(
                    {
                        type: 'cone',
                        radius: size / 2,
                        height: size,
                        segments: 8
                    },
                    mass,
                    position
                );
                break;

            case 'torus':
                mesh = this.createTorus(size / 2, size / 4, color);
                // Torus uses sphere physics (simplified)
                body = this.physicsEngine.createBody(
                    { type: 'sphere', radius: size / 2 },
                    mass,
                    position
                );
                break;

            default:
                return null;
        }

        // Add to scene
        this.renderer.scene.add(mesh);

        // Store object data
        const obj = {
            id: this.objectId++,
            type: type,
            mesh: mesh,
            body: body,
        };

        this.objects.push(obj);
        return obj;
    }

    // Three.js mesh creators
    createBox(size, color) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    createSphere(radius, color) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    createCylinder(radius, height, color) {
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    createCone(radius, height, color) {
        const geometry = new THREE.ConeGeometry(radius, height, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    createTorus(radius, tube, color) {
        const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // Update all objects (sync physics to rendering)
    update() {
        this.objects.forEach(obj => {
            // Copy position from physics body to mesh
            obj.mesh.position.copy(obj.body.position);

            // Copy rotation from physics body to mesh
            obj.mesh.quaternion.copy(obj.body.quaternion);
        });
    }

    // Remove a specific object
    removeObject(obj) {
        // Remove from scene
        this.renderer.scene.remove(obj.mesh);

        // Dispose geometry and material
        obj.mesh.geometry.dispose();
        obj.mesh.material.dispose();

        // Remove from physics world
        this.physicsEngine.removeBody(obj.body);

        // Remove from array
        const index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    // Remove all objects
    clearAll() {
        // Remove all objects
        [...this.objects].forEach(obj => {
            this.removeObject(obj);
        });

        // Clear physics bodies
        this.physicsEngine.clearAllBodies();
    }

    // Get object count
    getCount() {
        return this.objects.length;
    }

    // Spawn object at random position above ground
    spawnRandom(type) {
        const position = {
            x: (Math.random() - 0.5) * 10,
            y: 10 + Math.random() * 5,
            z: (Math.random() - 0.5) * 10,
        };

        const size = 1.5 + Math.random() * 1.5;
        return this.createObject(type, position, size);
    }

    // Spawn object at specific position
    spawnAtPosition(type, position) {
        // Spawn a bit above the position to avoid ground collision
        const spawnPos = {
            x: position.x,
            y: position.y + 2,
            z: position.z,
        };

        const size = 1.5 + Math.random() * 0.5;
        return this.createObject(type, spawnPos, size);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectManager;
}
