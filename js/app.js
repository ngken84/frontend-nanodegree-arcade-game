// This variable is set to true turns on debug functionality
// which will draw the collision boxes and enable console.log
var debug = false;

// GameObject represent objects on the screen
var GameObject = function () {
    // X and Y variable determines where the image is drawn on the canvas
    this.x = 0;
    this.y = 0;

    // dx and dy determine the direction of the object.
    this.dx = 0;
    this.dy = 0;

    // Collision Box variables. Determines the bounds of where the box
    // where the object can collide with other objects
    this.collStartX = 0;
    this.collEndX = 101;
    this.collStartY = 0;
    this.collEndY = 83;
    this.tileHeight = 83;
    this.tileWidth = 101;
    //default have bug image;
    this.sprite = 'images/enemy-bug.png';
}
// Update the object's position, required method for game
// Parameter: dt, a time delta between ticks
GameObject.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + (this.dx * dt);
    this.y = this.y + (this.dy * dt);
}

//Draws the GameObject on the screen
GameObject.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    this.drawCollisionBox();
}

// Draws a red collision box if debug is turned on
GameObject.prototype.drawCollisionBox = function() {
    if(debug) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x + this.collStartX,
            this.y + this.collStartY,
            this.collEndX - this.collStartX,
            this.collEndY - this.collStartY);
        ctx.restore();
    }
}

// translates a horizontal tile location to a location on the canvas
// Parameter: tileX, horizontal tile location
GameObject.prototype.getXLocByTileX = function(tileX) {
    return tileX * this.tileWidth;
}

// translates a vertical tile location to a location on the canvas
// Parameter: tileY, vertical tile location
GameObject.prototype.getYLocByTileY = function(tileY){
    return (tileY * this.tileHeight) - 15;
}

// Determines if an object has collided with another object
// Parameter : another GameObject that you want to know if is collided.
GameObject.prototype.isCollided = function(object2) {

    //Calculate the left, right, top and bottom points of the collision box
    var leftPoint = this.x + this.collStartX;
    var rightPoint = this.x + this.collEndX;
    var topPoint = this.y + this.collStartY;
    var bottomPoint = this.y + this.collEndY;

    //Calculate the left, right, top and bottom points of the other object's collision box
    var objLeft = object2.x + object2.collStartX;
    var objRight = object2.x + object2.collEndX;
    var objTop = object2.y + object2.collStartY;
    var objBottom = object2.y + object2.collEndY;

    //Easy test to see if it is even in the same area
    return !(leftPoint > objRight || rightPoint < objLeft || topPoint > objBottom || bottomPoint < objTop);
}

// Generate random number between two values
// Parameter : low, low value
//             high, high value
GameObject.prototype.getRand = function(low, high) {
    return Math.floor((Math.random() * (high - low + 1)) + low);
}

// Enemies our player must avoid
var Enemy = function(tileX, tileY, speed) {
    GameObject.call(this);

    this.collStartY = 85;
    this.collEndY = 140;

    //Sets the location of enemy based on tile location
    this.x = this.getXLocByTileX(tileX);
    this.y = this.getYLocByTileY(tileY);
    this.dx = speed;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}
Enemy.prototype = Object.create(GameObject.prototype);
Enemy.prototype.constructor = Enemy;

//Render enemy, if speed(this.dx) is negative, draw the image backwards
Enemy.prototype.render = function() {
    if(this.dx < 0) {
        //Draw the image backwards
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(Resources.get(this.sprite), (-1 * this.x) - 101, this.y);
        ctx.restore();
        this.drawCollisionBox();
    } else {
        GameObject.prototype.render.call(this);
    }
}

// Updated so that if the enemy goes off screen, is respawned in a random location.
Enemy.prototype.update = function(dt) {
    if(this.x > 550 || this.x < -130) {
        this.findNewPositionAndSpeed();
    }
    GameObject.prototype.update.call(this, dt);

}

// Randomly gives an enemy a new speed and new starting location
// Depending on what row the enemy spawns, will either be moving left or right
Enemy.prototype.findNewPositionAndSpeed = function() {
    // Define what row the enemy will spawn
    var tileY = this.getRand(1,5);
    // Get pixel location of that row;
    var yLoc = this.getYLocByTileY(tileY);
    // Define speed will be, random value between 100 and 300
    var speed = this.getRand(100, 300);
    // Determine starting position based on row number.
    // Even rows have negative speeds and start to the right
    var startingLoc = -130;
    if(tileY % 2 == 0) {
        speed *= -1;
        startingLoc = 530;
    }
    this.y = yLoc;
    this.x = startingLoc;
    this.dx = speed;
}

// Sub class for pick ups in game
// Parameter : tileX, gem's x location
//             tileY, gem's y location
//             duration, time gem will remain at that location
var PickUp = function(tileX, tileY, duration) {
    GameObject.call(this);

    // set pickup's draw location
    this.x = this.getXLocByTileX(tileX);
    this.y = this.getYLocByTileY(tileY);
    this.tileX = tileX;
    this.tileY = tileY;

    // set pickup's collision box
    this.collStartX = 40;
    this.collEndX = 61;
    this.collStartY = 95;
    this.collEndY = 130;

    // set pickup's life and age
    this.duration = duration;
    this.age = 0;

    // set point value of pickup
    this.points = 0;

    // Determines if the PickUp is on screen
    this.visible = false;
    // Seconds that it will be disabled
    this.coolDownDuration = 0;
}
PickUp.prototype = Object.create(GameObject.prototype);
PickUp.prototype.constructor = PickUp;
// New render function that draws the gem a little smaller than source image
PickUp.prototype.render = function() {
    if(this.visible) {
        ctx.drawImage(Resources.get(this.sprite), this.x + 27, this.y + 43, 50, 86);
    }
}

PickUp.prototype.pickedUpBy = function(player) {
    //do nothing
}

// New update function that ages the pickup by dt
PickUp.prototype.update = function(dt) {
    GameObject.prototype.update.call(this, dt);
    this.age += dt;
    if(!this.visible && this.age > this.coolDownDuration) {
        this.visible = true;
        this.age = 0;
    } else if(this.visible && this.age > this.duration) {
        this.findNewPosition();
    }
}

// Find a new position for the pick up that is not the current location
PickUp.prototype.findNewPosition = function() {
    var newX = this.getRand(0, 4);
    var newY = this.getRand(1, 4);

    // Make sure that position does not match current position
    while(newX == this.tileX && newY == this.tileY && Math.abs(newX - this.tileX) + Math.abs(newY - this.tileY) == 1) {
        newX = this.getRand(0, 4);
        newY = this.getRand(1, 4);
    }

    // Set new position
    this.x = this.getXLocByTileX(newX);
    this.y = this.getYLocByTileY(newY);
    this.tileX = newX;
    this.tileY = newY;

    // Reset pickup timer
    this.age = 0;
    this.visible = false;

    if(debug) {
        console.log("( " + newX + ", " + newY + ")");
    }
}

// Gems that player is trying to pick up
// Parameter : tileX, gem's x location
//             tileY, gem's y location
//             duration, time gem will remain at that location
var Gem = function(tileX, tileY, duration) {
    PickUp.call(this, tileX, tileY, duration);
    //set gem's sprite
    this.setUpGemImgScore(tileX);

}
Gem.prototype = Object.create(PickUp.prototype);
Gem.prototype.constructor = Gem;

// Sets up gem's sprite and point value based on it's horizontal tile position
// Parameter : newX, tile's X location. Gems on the outside of the screen are
//                   worth more.
Gem.prototype.setUpGemImgScore = function(newX) {
    switch (newX)
    {
        case 0:
        case 4:
            this.sprite = 'images/Gem Blue.png';
            this.points = 3;
            break;
        case 3:
        case 1:
            this.sprite = 'images/Gem Green.png';
            this.points = 2;
            break;
        default:
            this.sprite = 'images/Gem Orange.png';
            this.points = 1;
    }
}

// Find a new position for the gem that is not the current location
Gem.prototype.findNewPosition = function() {
    PickUp.prototype.findNewPosition.call(this);
    this.setUpGemImgScore(this.tileX);
}

// Star acts as a power up
var Star = function(tileX, tileY, duration) {
    PickUp.call(this, tileX, tileY, duration);
    this.coolDownDuration = 12;
    this.sprite = 'images/Star.png';
}
Star.prototype = Object.create(PickUp.prototype);
Star.prototype.constructor = Star;

Star.prototype.update = function(dt) {
    if(this.visible == true) {
        if((this.age < 3 && this.age > 2) || this.age < 1) {
            this.dy = 3;
        } else {
            this.dy = -3;
        }
    } else {
        this.dy = 0;
    }
    PickUp.prototype.update.call(this, dt);
}

Star.prototype.pickedUpBy = function(player) {
    player.power = 'invincible';
    player.powerDuration = 7;
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    GameObject.call(this);

    //Player starting location is always set.
    this.x = this.getXLocByTileX(2);
    this.y = this.getYLocByTileY(4);

    //If the character is moving, then these serve as the character's destination
    //If the character is not moving, then these serve as the character's location
    this.tileX = 2;
    this.tileY = 4;

    // moving variable is null when the character is not moving. If he is moving, then
    // variable contains a string of the direction that he is moving
    // "up", "down", "left", "right"
    this.moving = null;
    this.moveRate = 6;

    this.collStartX = 30;
    this.collEndX = 71;
    this.collStartY = 85;
    this.collEndY = 140

    this.sprite = 'images/char-boy.png';

    this.power = null;
    this.powerDuration = 0;
    this.effectCounter = 0;

}
Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function(dt) {
    //If player has a power up update duration;
    if(this.power != null) {
        this.powerDuration -= dt;
        if(this.powerDuration <= 0) {
            this.power = null;
            this.powerDuration = 0;
        }
    }

    //If moving is null, then the Player is not moving and does not need to be updated
    if(this.moving != null)
    {
        if(this.moving == 'up')
        {
            this.y -= (dt * this.tileHeight * this.moveRate);
            var target = this.getYLocByTileY(this.tileY);
            if(this.y < target) {
                this.y = target;
            }
            if(this.y == target)
            {
                this.moving = null;
            }
        } else if(this.moving == 'down')
        {
            this.y += (dt * this.tileHeight * this.moveRate);
            var target = this.getYLocByTileY(this.tileY);
            if(this.y > target) {
                this.y = target;
            }
            if(this.y == target)
            {
                this.moving = null;
            }
        } else if(this.moving == 'left')
        {
            this.x -= (dt * this.tileWidth * this.moveRate);
            var target = this.getXLocByTileX(this.tileX);
            if(this.x < target) {
                this.x = target;
            }
            if(this.x == target)
            {
                this.moving = null;
            }
        } else if(this.moving == 'right')
        {
            this.x += (dt * this.tileWidth * this.moveRate);
            var target = this.getXLocByTileX(this.tileX);
            if(this.x > target) {
                this.x = target;
            }
            if(this.x == target)
            {
                this.moving = null;
            }
        }
    }
}
Player.prototype.handleInput = function(direction)
{
    //Determine if the character is already moving
    if(this.moving == null)
    {
        //Determine if the character is able to make the move,
        //Then set their state to moving
        if(direction == 'up')
        {
            var target = this.tileY - 1;
            if(target >= 1) {
                this.tileY = target;
                this.moving = direction;
            }
        } else if(direction == 'down')
        {
            var target = this.tileY + 1;
            if(target <= 5)
            {
                this.tileY = target;
                this.moving = direction;
            }
        } else if(direction == 'left')
        {
            var target = this.tileX - 1;
            if(target >= 0)
            {
                this.tileX = target;
                this.moving = direction;
            }
        } else if(direction == 'right')
        {
            var target = this.tileX + 1;
            if(target <= 4)
            {
                this.tileX++;
                this.moving = direction;
            }
        }
    }
}

Player.prototype.render = function() {
    if(this.power == "invincible"  && (this.powerDuration >= 2 || (this.powerDuration < 2 && this.getRand(0,2) % 2 == 0))) {
        this.sprite = 'images/char-horn-girl.png';
    } else {
        this.sprite = 'images/char-boy.png';
    }
    GameObject.prototype.render.call(this);
}

//UI element for the score display
var ScoreDisplay = function() {
    GameObject.call(this);

    this.x = 20;
    this.y = 40;

    this.score = 0;
    this.high = 0;
}
ScoreDisplay.prototype = Object.create(GameObject.prototype);
ScoreDisplay.prototype.constructor = ScoreDisplay;
ScoreDisplay.prototype.render = function() {
    ctx.save();
    // Draw white box to clear out existing text
    ctx.fillStyle = "White";
    ctx.fillRect(0,0, 500, 40);

    //Draw the text, both high score and current score;
    var scoreText = "SCORE : " + this.score;
    var highText = "HIGH : " + this.high;
    ctx.font = "24px Impact";
    ctx.fillStyle = "Black";
    ctx.fillText(scoreText, this.x, this.y);
    ctx.fillText(highText, this.x + 250, this.y);
    ctx.restore();
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var player;
var allPickUps;
var score = new ScoreDisplay();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
