import { createAnimations } from "./animations.js";

//global Phaser config
const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 244,
    backgroundColor: '#049cd8',  //responde a hexadecimales
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload, //se ejecuta para precargar recursos
        create, // se ejecua cuando el juego comienza
        update, // se ejecuta para actualizar el juego
    }
}

new Phaser.Game(config);

function preload() {
    this.load.image(
        'cloud1',
        'assets/scenery/overworld/cloud1.png'
    )

    this.load.image(
        'floorbricks',
        'assets/scenery/overworld/floorbricks.png'
    )

    this.load.spritesheet(
        'mario',
        'assets/entities/mario.png',
        {frameWidth: 18, frameHeight: 16}
    )    
}

function create() {
    // image(x, y, id del asset)
   this.add.image(100, 50, 'cloud1')
   .setOrigin(0, 0)
   .setScale(0.15)

   this.floor = this.physics.add.staticGroup()

   this.floor
   .create(0, config.height - 16, 'floorbricks')
   .setOrigin(0, 0.5)
   //sincronizar fisicas
   .refreshBody()

   this.floor
   .create(150, config.height - 16, 'floorbricks')
   .setOrigin(0, 0.5)
   .refreshBody()
   
  //this.mario = this.add.sprite(50,210,'mario')

   this.mario = this.physics.add.sprite(50, 100,'mario')
   .setOrigin(0,1)
   .setGravityY(300)
   .setCollideWorldBounds(true)

   this.physics.world.setBounds(0, 0, 2000, config.height)
   this.physics.add.collider(this.mario, this.floor)

   this.cameras.main.setBounds(0, 0, 2000, config.height)
   this.cameras.main.startFollow(this.mario)
   
   createAnimations(this)

   this.keys = this.input.keyboard.createCursorKeys()
}

function update() {
    if (this.mario.isDead) return

    if (this.keys.left.isDown) {
        this.mario.setVelocityX(-100);
        this.mario.anims.play('mario-walk', true);
        this.mario.flipX = true; // Gira a Mario
    } else if (this.keys.right.isDown) {
        this.mario.setVelocityX(100); 
        this.mario.anims.play('mario-walk', true);
        this.mario.flipX = false; // 
    } else {
        this.mario.setVelocityX(0); // 
        this.mario.anims.play('mario-idle', true); // Cambia a la animación de inactividad
    }

    if (this.keys.up.isDown && this.mario.body.touching.down) {
        this.mario.setVelocityY(-300);
        this.mario.anims.play('mario-jump', true);
    }

    if(this.mario.y >= config.height) {
        this.mario.isDead = true
        this.mario.anims.play('mario-dead');
        this.mario.setCollideWorldBounds(false);      
    }
}
