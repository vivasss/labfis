// ===================================
// PHYSICS ENGINE - CANNON.JS
// ===================================

class PhysicsEngine {
    constructor() {
        this.world = null;
        this.timeStep = 1 / 60;
        this.maxSubSteps = 3;
        this.timeScale = 1.0;
        this.isPaused = false;

        // Material properties
        this.defaultMaterial = null;
        this.groundMaterial = null;
        this.contactMaterial = null;

        // Settings
        this.settings = {
            gravity: { x: 0, y: -9.8, z: 0 },
            restitution: 0.3,  // Bounce
            friction: 0.3,
            defaultMass: 5,
        };

        this.init();
    }

    init() {
        // Create physics world
        this.world = new CANNON.World();
        this.world.gravity.set(
            this.settings.gravity.x,
            this.settings.gravity.y,
            this.settings.gravity.z
        );

        // Broadphase makes detection faster
        this.world.broadphase = new CANNON.NaiveBroadphase();

        // Allow sleeping (objects at rest don't compute)
        this.world.allowSleep = true;

        // Create materials
        this.defaultMaterial = new CANNON.Material('default');
        this.groundMaterial = new CANNON.Material('ground');

        // Contact material (defines interaction between materials)
        this.contactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.groundMaterial,
            {
                friction: this.settings.friction,
                restitution: this.settings.restitution,
            }
        );

        this.world.addContactMaterial(this.contactMaterial);

        // Create ground plane
        this.createGround();
    }

    createGround() {
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0, // Static body
            material: this.groundMaterial,
        });
        groundBody.addShape(groundShape);

        // Rotate to be horizontal (plane faces up in Y direction)
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

        this.world.addBody(groundBody);
    }

    // Create a physics body for an object
    createBody(shape, mass, position) {
        let cannonShape;

        switch (shape.type) {
            case 'box':
                cannonShape = new CANNON.Box(new CANNON.Vec3(
                    shape.size / 2,
                    shape.size / 2,
                    shape.size / 2
                ));
                break;

            case 'sphere':
                cannonShape = new CANNON.Sphere(shape.radius);
                break;

            case 'cylinder':
                cannonShape = new CANNON.Cylinder(
                    shape.radiusTop,
                    shape.radiusBottom,
                    shape.height,
                    shape.segments
                );
                break;

            case 'cone':
                // Cannon.js doesn't have cone, use cylinder with radiusTop = 0
                cannonShape = new CANNON.Cylinder(
                    0.01,  // Small top radius
                    shape.radius,
                    shape.height,
                    shape.segments
                );
                break;

            default:
                // Default to sphere
                cannonShape = new CANNON.Sphere(1);
        }

        const body = new CANNON.Body({
            mass: mass,
            material: this.defaultMaterial,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            linearDamping: 0.1,
            angularDamping: 0.1,
        });

        body.addShape(cannonShape);

        // Add random initial rotation for variety
        body.angularVelocity.set(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );

        this.world.addBody(body);
        return body;
    }

    // Remove a body from the physics world
    removeBody(body) {
        this.world.removeBody(body);
    }

    // Update physics simulation
    update(deltaTime) {
        if (!this.isPaused) {
            const dt = deltaTime * this.timeScale;
            this.world.step(this.timeStep, dt, this.maxSubSteps);
        }
    }

    // Set gravity
    setGravity(x, y, z) {
        this.settings.gravity = { x, y, z };
        this.world.gravity.set(x, y, z);
    }

    // Update material properties
    updateMaterialProperties(restitution, friction) {
        this.settings.restitution = restitution;
        this.settings.friction = friction;

        // Update contact material
        this.contactMaterial.restitution = restitution;
        this.contactMaterial.friction = friction;
    }

    // Set time scale (slow motion / fast forward)
    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(2, scale));
    }

    // Pause/Resume physics
    setPaused(paused) {
        this.isPaused = paused;
    }

    // Clear all dynamic bodies (keep ground)
    clearAllBodies() {
        const bodiesToRemove = [];

        // Collect all non-static bodies
        this.world.bodies.forEach(body => {
            if (body.mass > 0) {  // Dynamic body
                bodiesToRemove.push(body);
            }
        });

        // Remove them
        bodiesToRemove.forEach(body => {
            this.world.removeBody(body);
        });
    }

    // Get statistics
    getStats() {
        const dynamicBodies = this.world.bodies.filter(b => b.mass > 0);
        return {
            bodyCount: dynamicBodies.length,
            isActive: !this.isPaused,
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}