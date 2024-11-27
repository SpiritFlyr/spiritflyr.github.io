
const engine = Matter.Engine.create();
const world = engine.world;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const pumpkinCategory = Matter.Body.nextCategory();
let pumpkins = [];
let score = 0; 

function createPumpkin() {
    const startX = Math.random() * (window.innerWidth - 100) + 50;
    const startY = window.innerHeight + 40;

    const pumpkinGroup = Matter.Body.nextGroup(true); 

    const circleOptions = {
        restitution: 0.6, 
        density: 0.002,   
        collisionFilter: {
            category: pumpkinCategory,
            group: pumpkinGroup 
        }
    };

    const leftPart = Matter.Bodies.circle(startX - 30, startY, 20, { ...circleOptions, collisionFilter: { category: pumpkinCategory, mask: pumpkinCategory } });
    const centerPart = Matter.Bodies.circle(startX, startY, 25, circleOptions);
    const rightPart = Matter.Bodies.circle(startX + 30, startY, 20, { ...circleOptions, collisionFilter: { category: pumpkinCategory, mask: pumpkinCategory } });

    
    const leftConstraint = Matter.Constraint.create({
        bodyA: leftPart,
        pointA: { x: 5, y: 0 },
        bodyB: centerPart,
        pointB: { x: -15, y: 0 },
        length: 0,
        stiffness: 1 
    });

    const rightConstraint = Matter.Constraint.create({
        bodyA: rightPart,
        pointA: { x: -5, y: 0 },
        bodyB: centerPart,
        pointB: { x: 15, y: 0 },
        length: 0,
        stiffness: 1 
    });

    const pumpkin = [leftPart, centerPart, rightPart];
    Matter.World.add(world, pumpkin);
    Matter.World.add(world, [leftConstraint, rightConstraint]);
    pumpkins.push(pumpkin);

    
    const randomForceX = () => (Math.random() - 0.5) * 0.1;
    const upwardForceY = -0.8; 
    Matter.Body.applyForce(centerPart, { x: centerPart.position.x, y: centerPart.position.y }, { x: randomForceX(), y: upwardForceY });
}

function explodePumpkin(pumpkin) {
    console.log("Explode function called");
    const [leftPart, centerPart, rightPart] = pumpkin;

    
    Matter.Composite.remove(world, world.constraints.filter(constraint =>
        (constraint.bodyA === leftPart || constraint.bodyA === centerPart || constraint.bodyA === rightPart)));

    
    Matter.Body.applyForce(leftPart, leftPart.position, { x: -0.05, y: -0.1 });
    Matter.Body.applyForce(centerPart, centerPart.position, { x: 0, y: -0.15 });
    Matter.Body.applyForce(rightPart, rightPart.position, { x: 0.05, y: -0.1 });

    
    Matter.Body.setAngularVelocity(leftPart, 0.2);
    Matter.Body.setAngularVelocity(centerPart, 0.3);
    Matter.Body.setAngularVelocity(rightPart, -0.2);
}

function drawPumpkin(ctx, body, isCenter = false) {
    const pos = body.position;
    const angle = body.angle;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

   
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    const radiusX = isCenter ? body.circleRadius : body.circleRadius * 0.8;
    const radiusY = isCenter ? body.circleRadius * 1.6 : body.circleRadius * 1.4;
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    
    if (isCenter) {
        ctx.fillStyle = 'green';
        ctx.fillRect(-5, -body.circleRadius * 1.6, 10, 10); 
    }

    ctx.restore();
}

function isMouseOnPumpkin(mousePosition, pumpkin) {
    return pumpkin.some(part => Matter.Bounds.contains(part.bounds, mousePosition));
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score.toString().padStart(4, '0')}`, 20, 30); 
}

function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Matter.Engine.update(engine);

    pumpkins.forEach(pumpkin => {
        drawPumpkin(ctx, pumpkin[0], false);
        drawPumpkin(ctx, pumpkin[1], true);
        drawPumpkin(ctx, pumpkin[2], false);
    });

    drawScore();

    pumpkins = pumpkins.filter(pumpkin => pumpkin.some(part => part.position.y < window.innerHeight + 100));

    requestAnimationFrame(renderLoop);
}

setInterval(createPumpkin, 300);

canvas.addEventListener('mousedown', function (event) {
    const mousePosition = { x: event.clientX, y: event.clientY };
    pumpkins.forEach((pumpkin, index) => {
        if (isMouseOnPumpkin(mousePosition, pumpkin)) {
            explodePumpkin(pumpkin);
            score += 10; 
            console.log(`Pumpkin ${index} exploded on click!`);
        }
    });
});

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

renderLoop();
Matter.Engine.run(engine);
