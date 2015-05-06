var debug = true;

// GameObject represent objects on the screen
var GameObject = function () {
    //initialize at 0, 0
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
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
    if(debug)
    {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x + this.collStartX, this.y + this.collStartY, this.collEndX - this.collStartX, this.collEndY - this.collStartY);
        ctx.restore();
    }
    
}

GameObject.prototype.getXLocByTileX = function(tileX) {
    return tileX * this.tileWidth;
}

GameObject.prototype.getYLocByTileY = function(tileY){
    return (tileY * this.tileHeight) - 15;
}

// Enemies our player must avoid
var Enemy = function(tileX, tileY, speed) {
    GameObject.call(this);
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.collStartY = 85;
    this.collEndY = 140;
    this.x = this.getXLocByTileX(tileX);
    this.y = this.getYLocByTileY(tileY);
    this.dx = speed;
    this.sprite = 'images/enemy-bug.png';
}
Enemy.prototype = Object.create(GameObject.prototype);
Enemy.prototype.constructor = Enemy;

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    GameObject.call(this);
    this.x = this.getXLocByTileX(2);
    this.y = this.getYLocByTileY(4);

    //If the character is moving, then these serve as the character's destination
    //If the character is not moving, then these serve as the character's location
    this.tileX = 2;
    this.tileY = 4;
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
var allEnemies = [new Enemy(-1,2,100), new Enemy(0, 4, 50), new Enemy(1, 3, 25)];
var player = new Player();


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
