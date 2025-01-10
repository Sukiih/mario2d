import { createAnimations } from "./animations.js";

// Configuración global de Phaser
const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 244,
    backgroundColor: '#049cd8',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false,
        }
    },
    scene: {
        preload, //se ejecuta para precargar recursos
        create, // se ejecuta cuando el juego comienza
        update, // se ejecuta para actualizar el juego
    }
};

new Phaser.Game(config);

// Precarga de recursos
function preload() {
    this.load.image(
        'cloud1', 
        'assets/scenery/overworld/cloud1.png'
    );
    this.load.image(
        'floorbricks', 
        'assets/scenery/overworld/floorbricks.png'
    );
    this.load.spritesheet(
        'mario', 'assets/entities/mario.png', 
        { frameWidth: 18, frameHeight: 16 });
    this.load.audio(
        'gameover', 
        'assets/sound/music/gameover.mp3'
    );
}

// Creación de la escena
function create() {
    //imagen(x, y, id del asset)
    this.add.image(100, 50, 'cloud1')
    .setOrigin(0, 0)
    .setScale(0.15);

    this.floor = this.physics.add.staticGroup();

    this.floor.create
    (0, config.height - 16, 'floorbricks')
    .setOrigin(0, 0.5)
    .refreshBody();

    this.floor.create
    (150, config.height - 16, 'floorbricks')
    .setOrigin(0, 0.5)
    .refreshBody();

    // Mario
    this.mario = this.physics.add.sprite(50, 100, 'mario')
        .setOrigin(0, 1)
        .setGravityY(300)
        .setCollideWorldBounds(true);

    // Configuración del mundo
    this.physics.world.setBounds(0, 0, 2000, config.height);
    this.physics.add.collider(this.mario, this.floor);

    // Cámara
    this.cameras.main.setBounds(0, 0, 2000, config.height);
    this.cameras.main.startFollow(this.mario);

    // Animaciones
    createAnimations(this);

    // Mov teclado
    this.keys = this.input.keyboard.createCursorKeys();

    // Controles táctiles
    this.leftTouchArea = this.add.zone(0, config.height - 80, config.width / 2, 80).setOrigin(0, 0).setInteractive();
    this.rightTouchArea = this.add.zone(config.width / 2, config.height - 80, config.width / 2, 80).setOrigin(0, 0).setInteractive();
    this.jumpTouchArea = this.add.zone(config.width - 60, config.height - 120, 60, 60).setOrigin(0, 0).setInteractive();

    // Detectar toque izquierdo/derecho
    this.leftTouchArea.on('pointerdown', () => {
        this.mario.isMovingLeft = true; 
    });
    this.rightTouchArea.on('pointerdown', () => {
        this.mario.isMovingRight = true;
    });

    // Detener movimiento cuando se deja de tocar
    this.leftTouchArea.on('pointerup', () => {
        this.mario.isMovingLeft = false;
    });
    this.rightTouchArea.on('pointerup', () => {
        this.mario.isMovingRight = false;
    });

    // Control de salto
    this.jumpTouchArea.on('pointerdown', () => {
        if (this.mario.body.touching.down) {
            this.mario.setVelocityY(-300);
            this.mario.anims.play('mario-jump', true);
        }
    });

    // muerte de Mario
    this.events.once('mario-dead', () => {
        this.mario.isDead = true;
        this.mario.anims.play('mario-dead');
        this.mario.setCollideWorldBounds(false);
        this.mario.setVelocity(-350); // brinco al morir
        this.sound.add('gameover', { volume: 0.3 }).play();

        this.time.delayedCall(2000, () => {
            this.scene.restart();
        });
    });
}

function update() {
    if (this.mario.isDead) return;

    let moveX = 0;

    if (this.keys.left.isDown) {
        moveX = -100;
        this.mario.flipX = true;
    } else if (this.keys.right.isDown) {
        moveX = 100;
        this.mario.flipX = false;
    }

    // Movimiento táctil
    if (this.mario.isMovingLeft) {
        moveX = -100;
        this.mario.flipX = true;
    } else if (this.mario.isMovingRight) {
        moveX = 100;
        this.mario.flipX = false;
    }

    // Aplicar el movimiento
    this.mario.setVelocityX(moveX);

    if (moveX !== 0) {
        this.mario.anims.play('mario-walk', true);
    } else {
        this.mario.anims.play('mario-idle', true);
    }

    // Salto con teclado
    if (this.keys.up.isDown && this.mario.body.touching.down) {
        this.mario.setVelocityY(-300);
        this.mario.anims.play('mario-jump', true);
    }

    // Detectar muerte
    if (this.mario.y >= config.height) {
        this.events.emit('mario-dead');
    }
}