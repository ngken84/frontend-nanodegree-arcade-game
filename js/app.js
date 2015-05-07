// This variable is set to true turns on debug functionality
// which will draw the collision boxes and enable console.log
var debug = true;

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
    //if debug is on draw the collision box
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

// Gems that player is trying to pick up
// Parameter : tileX, gem's x location
//             tileY, gem's y location
//             duration, time gem will remain at that location
var Gem = function(tileX, tileY, duration) {
    GameObject.call(this);

    // set gem's draw location
    this.x = this.getXLocByTileX(tileX);
    this.y = this.getYLocByTileY(tileY);

    // set gem's collision box
    this.collStartX = 40;
    this.collEndX = 61;
    this.collStartY = 95;
    this.collEndY = 130;

    //set gem's sprite
    this.setUpGemImgScore(tileY);

    // set gem's life and age
    this.duration = duration;
    this.age = 0;
}
Gem.prototype = Object.create(GameObject.prototype);
Gem.prototype.constructor = Gem;
// New render function that draws the gem a little smaller than source image
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x + 27, this.y + 43, 50, 86);
}

// New update function that ages the gem by dt
Gem.prototype.update = function(dt) {
    GameObject.prototype.update.call(this, dt);
    this.age += dt;
    if(this.age > this.duration)
    {

    }
}

// Sets up gem's sprite and point value based on it's vertical tile position
// Parameter : tileY, tile's Y location
Gem.prototype.setUpGemImgScore = function(tileY) {
    switch (tileY)
    {
        case 1:
            this.sprite = 'images/Gem Blue.png';
            this.points = 3;
            break;
        case 2:
            this.sprite = 'images/Gem Green.png';
            this.points = 2;
            break;
        default:
            this.sprite = 'images/Gem Orange.png';
            this.points = 1;
    }
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
    this.moveRate = 4;

    this.collStartX = 30;
    this.collEndX = 71;
    this.collStartY = 85;
    this.collEndY = 140

    this.sprite = 'images/char-boy.png';
    
}
Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function(dt) {
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


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var player;
var allGems = [];

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
