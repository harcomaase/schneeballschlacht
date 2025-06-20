/*
 * Audio
 * ************************
 */

//var audio_ffft = new Audio('./resources/audio/ffft.ogg');
//var audio_plopp = new Audio('./resources/audio/plopp.ogg');

/*
 * Images
 * ************************
 */
var image_counter = 2;
var image_loaded_callback = function() {
    image_counter -= 1;
    if (image_counter == 0) {
        show_first_thing();
    }
}

var IMAGE_BASE_PATH = './resources/images/';

var image_splash = new Bitmap(IMAGE_BASE_PATH + 'splash.png', 50, 50, image_loaded_callback);
var image_been_hit = new Bitmap(IMAGE_BASE_PATH + 'been_hit.png', 50, 50);
var image_snowball_stock_incomplete = new Bitmap(IMAGE_BASE_PATH + 'snowball_stock_incomplete.png', 50, 50);
var image_throw = new Bitmap(IMAGE_BASE_PATH + 'throw.png', 50, 50);
var image_enemy_throw = new Bitmap(IMAGE_BASE_PATH + 'enemy_throw.png', 50, 50);

var sprite_player = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'player_sprite2.png', 50, 50), 2, 1);
var sprite_player_idle = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'player_idle_sprite.png', 50, 50), 4, 1);
var sprite_player_restocking = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'player_restock_sprite.png', 50, 50), 3, 1);
var sprite_enemy = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'enemy_sprite2.png', 50, 50), 2, 1);
var sprite_enemy_restocking = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'enemy_restock_sprite.png', 50, 50), 3, 1);
var sprite_enemy_hit = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'enemy_hit_sprite.png', 50, 50), 4, 2);
var sprite_snowball = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'snowball_sprite.png', 50, 50), 3, 1);
var sprite_aim = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'aim_sprite.png', 50, 50), 4, 1);
var sprite_hitpoint = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'hitpoint_sprite.png', 50, 50), 4, 2);
var sprite_snowball_stock_complete = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'snowball_stock_complete_sprite.png', 50, 50), 3, 1);
var sprite_tree = new Sprite(new Bitmap(IMAGE_BASE_PATH + 'tree2.png', 50, 50, image_loaded_callback), 4, 1);

var spriteAimWrapper = new SpriteWrapper(sprite_aim, 5);
var spriteHitpointWrappers = [];
var spriteSnowballStockCompleteWrappers = [];


function Bitmap(url, width, height, callback) {
    this.image = load_image(url, callback);
    this.width = width;
    this.height = height;
}

function Sprite(bitmap, columns, rows) {
    this.bitmap = bitmap;
    this.columns = columns;
    this.rows = rows;
}

function SpriteWrapper(sprite, ticksPerFrame) {
    this.sprite = sprite;
    this.ticksPerFrame = ticksPerFrame;
    this.tickCounter = 0;
    this.currentFrame = 0;
}

function drawWrappedSpriteNotCentered(context, spriteWrapper, scale) {
    var sprite = spriteWrapper.sprite;
    var bitmap = sprite.bitmap;
    var sx = bitmap.width * (spriteWrapper.currentFrame % sprite.columns);
    var sy = bitmap.height * Math.floor(spriteWrapper.currentFrame / sprite.columns);

    context.drawImage(
        bitmap.image,
        sx, sy,
        bitmap.width, bitmap.height,
        0, 0,
        bitmap.width * scale, bitmap.height * scale
    );

    spriteWrapper.tickCounter += 1;
    if (spriteWrapper.tickCounter >= spriteWrapper.ticksPerFrame) {
        spriteWrapper.tickCounter = 0;
        spriteWrapper.currentFrame += 1;
        if (spriteWrapper.currentFrame >= sprite.columns * sprite.rows) {
            spriteWrapper.currentFrame = 0;
        }
    }
}

function drawWrappedSprite(context, spriteWrapper, scale) {
    var sprite = spriteWrapper.sprite;
    var bitmap = sprite.bitmap;
    var sx = bitmap.width * (spriteWrapper.currentFrame % sprite.columns);
    var sy = bitmap.height * Math.floor(spriteWrapper.currentFrame / sprite.columns);

    context.drawImage(
        bitmap.image,
        sx, sy,
        bitmap.width, bitmap.height,
        -bitmap.width * scale / 2, -bitmap.height * scale / 2,
        bitmap.width * scale, bitmap.height * scale
    );

    spriteWrapper.tickCounter += 1;
    if (spriteWrapper.tickCounter >= spriteWrapper.ticksPerFrame) {
        spriteWrapper.tickCounter = 0;
        spriteWrapper.currentFrame += 1;
        if (spriteWrapper.currentFrame >= sprite.columns * sprite.rows) {
            spriteWrapper.currentFrame = 0;
        }
    }
}

function drawBitmap(context, bitmap, scale) {
    context.drawImage(bitmap.image, -bitmap.width * scale / 2, -bitmap.height * scale / 2, bitmap.width * scale, bitmap.height * scale);
}

function load_image(url, callback) {
    var image = new Image();
    image.src = url;
    if (callback) {
        image.onload = callback;
    }
    return image;
}

/*
 * Prototypes
 * ************************
 */

function Position(x, y) {
    this.x = x;
    this.y = y;
}

function Player(position, spriteWrapper, idleSpriteWrapper, restockingSpriteWrapper, speed, hitpoints, snowballThrowDelayInMs) {
    this.position = position;
    this.spriteWrapper = spriteWrapper;
    this.idleSpriteWrapper = idleSpriteWrapper;
    this.restockingSpriteWrapper = restockingSpriteWrapper;
    this.speed = speed;
    this.hitpoints = hitpoints;
    this.snowballThrowDelayInMs = snowballThrowDelayInMs;
    this.snowballLastThrow = 0;
    this.snowballCurrentStock = 3;
    this.snowballMaxStock = 5;
    this.snowballRestockFrequency = 0.1;
    this.snowballRestocking = false;
    this.moving = false;
    this.throwImageTicks = 0;
}

function Snowball(startPosition, currentPosition, targetPosition, dx, dy, wayToGo, angle, spriteWrapper) {
    this.startPosition = startPosition;
    this.currentPosition = currentPosition;
    this.targetPosition = targetPosition;
    this.dx = dx;
    this.dy = dy;
    this.wayToGo = wayToGo;
    this.canBeCaught = false;
    this.wayGone = 0;
    this.wayGonePercentage = 0;
    this.angle = angle;
    this.spriteWrapper = spriteWrapper;
}

function Enemy(position, targetPosition, spriteWrapper, restockingSpriteWrapper, speed, snowballThrowLikeliness, snowballThrowDelayInMs, throwAtPlayerLikeliness) {
    this.position = position;
    this.targetPosition = targetPosition;
    this.speed = speed;
    this.angle = 0;
    this.spriteWrapper = spriteWrapper;
    this.restockingSpriteWrapper = restockingSpriteWrapper;
    this.snowballThrowLikeliness = snowballThrowLikeliness;
    this.snowballThrowDelayInMs = snowballThrowDelayInMs;
    this.snowballLastThrow = 0;
    this.snowballMaxStock = 4;
    this.snowballCurrentStock = Math.round(this.snowballMaxStock * Math.random());
    this.snowballRestockFrequency = 0.05;
    this.snowballRestocking = false;
    this.throwAtPlayerLikeliness = throwAtPlayerLikeliness;
    this.throwImageTicks = 0;
}

function HitEnemy(position, spriteWrapper, scale, angle) {
    this.position = position;
    this.spriteWrapper = spriteWrapper;
    this.scale = scale;
    this.angle = angle;
}

function HitEffect(position, bitmap, scale) {
    this.position = position;
    this.bitmap = bitmap;
    this.scale = scale;
}

function Obstacle(position, spriteWrapper, radius) {
    this.position = position;
    this.spriteWrapper = spriteWrapper;
    this.radius = radius;
}

function Level(enemyQuantity, enemyMinSpeed, enemyMaxSpeed, playerHitpoints, snowballThrowLikeliness, snowballThrowDelayInMs, throwAtPlayerLikeliness, backgroundImage, obstacleQuantity) {
    this.enemyQuantity = enemyQuantity;
    this.enemyMinSpeed = enemyMinSpeed;
    this.enemyMaxSpeed = enemyMaxSpeed;
    this.playerHitpoints = playerHitpoints;
    this.snowballThrowLikeliness = snowballThrowLikeliness;
    this.snowballThrowDelayInMs = snowballThrowDelayInMs;
    this.throwAtPlayerLikeliness = throwAtPlayerLikeliness;
    this.backgroundImage = new Bitmap(IMAGE_BASE_PATH + backgroundImage, 50, 50);
    this.obstacleQuantity = obstacleQuantity;
}

/*
 * Main
 * ************************
 */

//TODO: obstacles!
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var levels = [];
levels.push(new Level(2, 0.5, 1, 3, 0.01, 5000, 0.75, 'level1.png', 1));
levels.push(new Level(10, 1, 4, 5, 0.05, 3000, 0.25, 'level1.png', 2));
levels.push(new Level(20, 1.5, 5, 5, 0.1, 2000, 0.5, 'level1.png', 3));
levels.push(new Level(5, 1.5, 5, 5, 0.1, 2000, 0.75, 'level1.png', 2));
levels.push(new Level(15, 1.5, 5, 5, 0.1, 2000, 0.75, 'level1.png', 3));
levels.push(new Level(10, 1.5, 5, 5, 0.1, 2000, 0.9, 'level1.png', 2));
levels.push(new Level(30, 1.5, 5, 5, 0.1, 2000, 0.5, 'level1.png', 3));
levels.push(new Level(10, 1.5, 5, 5, 0.1, 1500, 0.9, 'level1.png', 1));
levels.push(new Level(25, 2.5, 6, 5, 0.1, 1500, 0.75, 'level1.png', 2));
levels.push(new Level(25, 2.5, 6, 5, 0.1, 1500, 0.9, 'level1.png', 3));
levels.push(new Level(15, 3, 6, 5, 0.1, 1000, 1, 'level1.png', 4));
levels.push(new Level(30, 3, 6, 5, 0.1, 1000, 1, 'level1.png', 3));
var current_level = 0;

var player;
var mouse_position;

var position_padding = 50;
var snowball_hit_radius = 25;

var enemies = [];
var hit_enemies = [];
var hit_effects = [];
var obstacles = [];
var snowballs = [];

var game_started = Date.now();

var snowball_step = 10;
var show_restock_message;

var GAME_RUNNING = 'running';
var GAME_PAUSED = 'paused';
var GAME_WON = 'game_won';
var GAME_OVER = 'game_over';
var LEVEL_START = 'level_start';
var LEVEL_WON = 'level_won';
var game_state;

//input stuff
var key_map = {};
var mouse_key = 'mouse';


function show_first_thing() {
    resize_canvas();
    show_main_menu();
}
var main_loop_thread;

function show_main_menu() {
    context.drawImage(image_splash.image, 0, 0);
    context.fillStyle = '#0000ff';
    context.font = '48pt monospace';
    context.fillText('Schneeballschlacht!', 30, 100);
    context.font = '24pt monospace';
    context.fillText('Ein Spass für die ganze Familie', 80, 150);
    context.fillStyle = '#000000';
    context.font = '16pt monospace';
    context.fillText('- zielen mit der Maus', 50, 250);
    context.fillText('- laufen mit WASD oder den Pfeiltasten', 50, 280);
    context.fillText('- Schneeballvorrat auffüllen mit "r"', 50, 310);
    context.fillStyle = '#ff0000';
    context.font = '24pt monospace';
    context.fillText('Zum Starten klicken!', 200, 410);
    context.font = '12pt monospace';
    context.fillStyle = '#0000ff';
    context.fillText('Zur Info: es gibt aktuell ' + levels.length + ' Level zu bewältigen ;-)', 140, 450);

    context.fillStyle = '#e0e0e0';
    context.font = '20pt monospace bold';
    context.fillText('Hindernis', 530, 500);
    context.fillText('(ein Baum)', 530, 525);
    context.drawImage(sprite_tree.bitmap.image, 0, 0, 50, 50, 720, 530, 50, 50);
    canvas.onclick = start_game;
}

function start_game() {
    canvas.onclick = null;
    canvas.style.cursor = 'none';
    clearInterval(main_loop_thread);
    reset();
    main_loop_thread = setInterval(mainLoop, 50);

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
    //window.addEventListener('resize', resize_canvas, false);
    window.onmousemove = updateMouseCoords;
    canvas.onmousedown = handleMousedown;
    canvas.onmouseup = handleMouseup;
}

function reset() {
    var level = levels[current_level];
    game_state = LEVEL_START;

    snowballs.length = 0;
    hit_enemies.length = 0;
    hit_effects.length = 0;
    enemies.length = 0;
    obstacles.length = 0;

    show_restock_message = false;

    enemies = createEnemies(level);
    obstacles = createObstacles(level);

    player = initPlayer(level);
    spriteHitpointWrappers.length = 0;
    for (var i = 0; i < player.hitpoints; i++) {
        spriteHitpointWrappers.push(new SpriteWrapper(sprite_hitpoint, 5));
    }
    spriteSnowballStockCompleteWrappers.length = 0;
    for (var i = 0; i < player.snowballMaxStock; i++) {
        spriteSnowballStockCompleteWrappers.push(new SpriteWrapper(sprite_snowball_stock_complete, 5));
    }
    mouse_position = new Position(player.position.x - 50, player.position.y - 100);
}

function initPlayer(level) {
    return new Player(
        new Position(canvas.width / 2, canvas.height - 100),
        new SpriteWrapper(sprite_player, 10),
        new SpriteWrapper(sprite_player_idle, 10),
        new SpriteWrapper(sprite_player_restocking, 3),
        5,
        level.playerHitpoints,
        1000
    );
}

function resize_canvas() {
    //canvas.width = window.innerWidth - 20;
    //canvas.height = window.innerHeight - 20;
    canvas.width = 800;
    canvas.height = 600;
}

function mainLoop() {

    handleInput();
    if (game_state !== GAME_PAUSED && game_state !== LEVEL_START) {
        processEnemies();
        processSnowballs();
        processCollision();
        processHitEnemiesAndEffects();
    }

    handleGameState();

    draw();
}

function handleGameState() {
    if (game_state !== GAME_RUNNING) {
        return;
    }
    if (enemies.length === 0) {
        if (current_level + 1 < levels.length) {
            game_state = LEVEL_WON;
            setTimeout(proceedToNextLevel, 2000);
        } else {
            game_state = GAME_WON;
        }
    }
    if (player.hitpoints <= 0) {
        game_state = GAME_OVER;
    }
}

function proceedToNextLevel() {
    current_level += 1;
    reset();
}

function handleInput() {

    if (keyPressed(82)) {
        //r - restock
        player.snowballRestocking = true;
        show_restock_message = false;
        if (player.snowballCurrentStock < player.snowballMaxStock) {
            player.snowballCurrentStock += player.snowballRestockFrequency;
        }
    } else {
        player.snowballRestocking = false;
    }
    player.moving = false;
    if (!player.snowballRestocking) {
        if (keyPressed(32) || keyPressed(mouse_key)) {
            //space or mouse
            throwSnowball();
        }
        if (keyPressed(119) || keyPressed(87) || keyPressed(38)) {
            //w - up
            if (player.position.y > position_padding * 2) {
                player.position.y -= player.speed;
                player.moving = true;
            }
        }
        if (keyPressed(115) || keyPressed(83) || keyPressed(40)) {
            //s - down
            if (player.position.y < canvas.height - position_padding) {
                player.position.y += player.speed;
                player.moving = true;
            }
        }
        if (keyPressed(97) || keyPressed(65) || keyPressed(37)) {
            //a - left
            if (player.position.x > position_padding) {
                player.position.x -= player.speed;
                player.moving = true;
            }
        }
        if (keyPressed(100) || keyPressed(68) || keyPressed(39)) {
            //d - right
            if (player.position.x < canvas.width - position_padding) {
                player.position.x += player.speed;
                player.moving = true;
            }
        }
    }
    if ((game_state === GAME_OVER || game_state === GAME_WON) && keyPressed(78)) {
        //n - new game
        current_level = 0;
        reset();
    }
}

function throwSnowball() {
    var now = Date.now();
    if (player.snowballCurrentStock < 1) {
        show_restock_message = true;
        return;
    }
    if (player.snowballLastThrow + player.snowballThrowDelayInMs > now) {
        return;
    }
    player.snowballLastThrow = now;
    player.snowballCurrentStock -= 1;
    player.throwImageTicks = 5;

    var dx = mouse_position.x - player.position.x;
    var dy = mouse_position.y - player.position.y;
    var l = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dx, -dy);

    dx = dx / l * snowball_step;
    dy = dy / l * snowball_step;

    var snowball = new Snowball(
        new Position(player.position.x, player.position.y),
        new Position(player.position.x, player.position.y),
        new Position(mouse_position.x + dx, mouse_position.y + dy),
        dx,
        dy,
        l,
        angle,
        new SpriteWrapper(sprite_snowball, 3)
    );
    snowballs.push(snowball);

    //  audio_ffft.play();
}

function processEnemies() {
    var now = Date.now();
    for (var index_enemy = 0; index_enemy < enemies.length; index_enemy++) {
        var enemy = enemies[index_enemy];

        if (enemy.snowballRestocking) {
            if (enemy.snowballCurrentStock < enemy.snowballMaxStock) {
                var oldStock = enemy.snowballCurrentStock;
                enemy.snowballCurrentStock += enemy.snowballRestockFrequency;
                if (Math.floor(oldStock) !== Math.floor(enemy.snowballCurrentStock)) {
                    //75% chance to stop restocking on completing a snowball
                    enemy.snowballRestocking = Math.random() > 0.25;
                }
            } else {
                enemy.snowballRestocking = false;
            }
            continue;
        }
        var dx = enemy.targetPosition.x - enemy.position.x;
        var dy = enemy.targetPosition.y - enemy.position.y;
        var l = Math.sqrt(dx * dx + dy * dy);

        enemy.position.x += dx * enemy.speed / l;
        enemy.position.y += dy * enemy.speed / l;

        //target reached? new target!
        if (l < enemy.speed * 2) {
            enemy.targetPosition = createRandomEnemyTargetPosition();
            enemy.angle = calculateEnemyAngle(enemy);
        }

        //throw a snowball?
        if (enemy.snowballLastThrow + enemy.snowballThrowDelayInMs > now) {
            continue;
        }
        if (Math.random() > enemy.snowballThrowLikeliness) {
            continue;
        }

        if (enemy.snowballCurrentStock < 1) {
            enemy.snowballRestocking = true;
            continue;
        }

        enemy.snowballLastThrow = now;
        enemy.snowballCurrentStock -= 1;
        enemy.throwImageTicks = 5;

        var xDeviation = -50 + (Math.random() * 100);
        var yDeviation = -50 + (Math.random() * 100);

        var targetPosition = new Position(player.position.x, player.position.y);
        if (enemies.length > 1 && enemy.throwAtPlayerLikeliness < Math.random()) {
            var targetEnemy = enemies[Math.floor(Math.random() * enemies.length)];
            if (targetEnemy.position.x !== enemy.position.x && targetEnemy.position.y !== enemy.position.y) {
                targetPosition = new Position(targetEnemy.position.x, targetEnemy.position.y);
            }
        }

        targetPosition.x += xDeviation;
        targetPosition.y += yDeviation;

        var dx = targetPosition.x - enemy.position.x;
        var dy = targetPosition.y - enemy.position.y;
        var l = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dx, -dy);

        dx = dx / l * snowball_step;
        dy = dy / l * snowball_step;

        var snowball = new Snowball(
            new Position(enemy.position.x, enemy.position.y),
            new Position(enemy.position.x, enemy.position.y),
            new Position(targetPosition.x + dx, targetPosition.y + dy),
            dx,
            dy,
            l,
            angle,
            new SpriteWrapper(sprite_snowball, 3)
        );
        snowballs.push(snowball);

        //    audio_ffft.play();
    }
}

function calculateEnemyAngle(enemy) {
    return calculateAngle(enemy.targetPosition, enemy.position);
}

function calculateAngle(pos1, pos2) {
    return Math.atan2(pos1.y - pos2.y, pos1.x - pos2.x) + Math.PI / 2;
}

function processSnowballs() {
    for (var i = snowballs.length - 1; i >= 0; i--) {
        var snowball = snowballs[i];

        snowball.currentPosition.x += snowball.dx;
        snowball.currentPosition.y += snowball.dy;

        snowball.wayGone += snowball_step;

        snowball.wayGonePercentage = snowball.wayGone / snowball.wayToGo;
        if (snowball.wayGonePercentage > 0.8) {
            snowball.canBeCaught = true;
        }

        if (snowball.currentPosition.x < -position_padding || snowball.currentPosition.x > canvas.width + position_padding
            || snowball.currentPosition.y < -position_padding || snowball.currentPosition.y > canvas.height + position_padding
            || snowball.wayGonePercentage > 1.05) {
            snowballs.splice(i, 1);
        }
    }
}

function processCollision() {
    for (var index_snowball = snowballs.length - 1; index_snowball >= 0; index_snowball--) {
        var snowball = snowballs[index_snowball];

        for (var index_obstacle = 0; index_obstacle < obstacles.length; index_obstacle++) {
            var obstacle = obstacles[index_obstacle];
            if (positionsCloserThan(obstacle.position, snowball.currentPosition, obstacle.radius)) {
                snowballs.splice(index_snowball, 1);
                var hitEffect = new HitEffect(snowball.currentPosition, image_been_hit, 1);
                hit_effects.push(hitEffect);
                //        audio_plopp.play();
                continue;
            }
        }

        if (!snowball.canBeCaught) {
            continue;
        }
        for (var index_enemy = enemies.length - 1; index_enemy >= 0; index_enemy--) {
            var enemy = enemies[index_enemy];

            if (positionsCloserThan(enemy.position, snowball.currentPosition, snowball_hit_radius)) {
                //collision
                snowballs.splice(index_snowball, 1);
                enemies.splice(index_enemy, 1);

                var hitEnemy = new HitEnemy(enemy.position, new SpriteWrapper(sprite_enemy_hit, 3), 1, enemy.angle);
                hit_enemies.push(hitEnemy);
                var hitEffect = new HitEffect(enemy.position, image_been_hit, 1);
                hit_effects.push(hitEffect);
                //        audio_plopp.play();
            }
        }

        if (positionsCloserThan(player.position, snowball.currentPosition, snowball_hit_radius)) {
            snowballs.splice(index_snowball, 1);
            var hitEffect = new HitEffect(player.position, image_been_hit, 1);
            hit_effects.push(hitEffect);
            //      audio_plopp.play();
            if (player.hitpoints > 0) {
                player.hitpoints -= 1;
            }
        }
    }
}

function positionsCloserThan(pos1, pos2, closerThan) {
    var a = pos1.x - pos2.x;
    var b = pos1.y - pos2.y;

    return a * a + b * b < closerThan * closerThan;
}

function processHitEnemiesAndEffects() {
    for (var i = hit_effects.length - 1; i >= 0; i--) {
        var hitEffect = hit_effects[i];
        hitEffect.scale += 0.1;

        if (hitEffect.scale > 1.5) {
            hit_effects.splice(i, 1);
        }
    }
    for (var i = hit_enemies.length - 1; i >= 0; i--) {
        var hitEnemy = hit_enemies[i];


        if (hitEnemy.spriteWrapper.currentFrame >= hitEnemy.spriteWrapper.sprite.rows * hitEnemy.spriteWrapper.sprite.columns - 1) {
            hit_enemies.splice(i, 1);
        }
    }
}

function draw() {
    //clear canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    //level background
    context.drawImage(levels[current_level].backgroundImage.image, 0, 0);

    //player
    var angleToMouse = calculateAngle(mouse_position, player.position);
    context.translate(player.position.x, player.position.y);
    context.rotate(angleToMouse);
    if (player.snowballRestocking) {
        drawWrappedSprite(context, player.restockingSpriteWrapper, 1);
    } else if (player.moving) {
        drawWrappedSprite(context, player.spriteWrapper, 1);
    } else {
        drawWrappedSprite(context, player.idleSpriteWrapper, 1);
    }
    if (player.throwImageTicks > 0) {
        player.throwImageTicks -= 1;
        drawBitmap(context, image_throw, 1);
    }
    context.rotate(-angleToMouse);
    context.translate(-player.position.x, -player.position.y);

    //aim
    context.translate(mouse_position.x, mouse_position.y);
    drawWrappedSprite(context, spriteAimWrapper, 1);
    context.translate(-mouse_position.x, -mouse_position.y);

    context.translate(10, 10);
    var completeSnowballs = Math.floor(player.snowballCurrentStock);
    for (var i = 0; i < completeSnowballs; i++) {
        drawWrappedSpriteNotCentered(context, spriteSnowballStockCompleteWrappers[i], 1);
        context.translate(sprite_snowball_stock_complete.bitmap.width, 0);
    }
    var remaining = player.snowballCurrentStock - completeSnowballs;
    if (remaining > 0) {
        context.drawImage(image_snowball_stock_incomplete.image,
            0, 0,
            image_snowball_stock_incomplete.width * remaining, image_snowball_stock_incomplete.height,
            0, 0,
            image_snowball_stock_incomplete.width * remaining, image_snowball_stock_incomplete.height
        );
    }
    if (show_restock_message) {
        context.translate(50, 20);
        context.fillStyle = '#ff0000';
        context.font = '16pt monospace';
        context.fillText('Halte "r" gedrückt, um deinen', 0, 0);
        context.translate(0, 25);
        context.fillText('Schneeballvorrat aufzufüllen!', 0, 0);
        context.translate(-50, -45);
    }
    context.translate(-completeSnowballs * sprite_snowball_stock_complete.bitmap.width, 0);
    context.translate(-10, -10);

    context.translate(canvas.width - 10, 10);
    for (var i = 0; i < player.hitpoints; i++) {
        context.translate(-sprite_hitpoint.bitmap.width, 0);
        drawWrappedSpriteNotCentered(context, spriteHitpointWrappers[i], 1);
    }
    context.translate(player.hitpoints * sprite_hitpoint.bitmap.width, 0);
    context.translate(-(canvas.width - 10), -10);

    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        context.translate(enemy.position.x, enemy.position.y);
        context.rotate(enemy.angle);
        if (enemy.snowballRestocking || game_state === LEVEL_START) {
            drawWrappedSprite(context, enemy.restockingSpriteWrapper, 1);
        } else {
            drawWrappedSprite(context, enemy.spriteWrapper, 1);
        }
        if (enemy.throwImageTicks > 0) {
            enemy.throwImageTicks -= 1;
            drawBitmap(context, image_enemy_throw, 1);
        }
        context.rotate(-enemy.angle);
        context.translate(-enemy.position.x, -enemy.position.y);
    }

    for (var i = 0; i < snowballs.length; i++) {
        var snowball = snowballs[i];
        var scale = 1.0 - 1.5 * Math.abs(0.5 - snowball.wayGonePercentage);
        context.translate(snowball.currentPosition.x, snowball.currentPosition.y);
        context.rotate(snowball.angle);
        drawWrappedSprite(context, snowball.spriteWrapper, scale);
        context.rotate(-snowball.angle);
        context.translate(-snowball.currentPosition.x, -snowball.currentPosition.y);
    }

    for (var i = 0; i < hit_effects.length; i++) {
        var hitEffect = hit_effects[i];
        context.translate(hitEffect.position.x, hitEffect.position.y);
        drawBitmap(context, hitEffect.bitmap, hitEffect.scale);
        context.translate(-hitEffect.position.x, -hitEffect.position.y);
    }

    for (var i = 0; i < hit_enemies.length; i++) {
        var hitEnemy = hit_enemies[i];
        context.translate(hitEnemy.position.x, hitEnemy.position.y);
        context.rotate(hitEnemy.angle);
        drawWrappedSprite(context, hitEnemy.spriteWrapper, 1);
        context.rotate(-hitEnemy.angle);
        context.translate(-hitEnemy.position.x, -hitEnemy.position.y);
    }

    for (var i = 0; i < obstacles.length; i++) {
        var obstacle = obstacles[i];
        context.translate(obstacle.position.x, obstacle.position.y);
        drawWrappedSprite(context, obstacle.spriteWrapper, 1);
        context.translate(-obstacle.position.x, -obstacle.position.y);
    }

    if (game_state === LEVEL_START) {
        context.translate(330, 310);
        context.fillStyle = '#0000ff';
        context.font = '32pt monospace';
        context.fillText('Level ' + (current_level + 1), 0, 0);
        context.translate(-30, 30);
        context.font = '16pt monospace';
        context.fillText('Zum Starten klicken!', 0, 0);
        context.translate(-300, -340);
    }

    if (game_state === LEVEL_WON) {
        context.translate(150, 310);
        context.fillStyle = '#0000ff';
        context.font = '32pt monospace';
        context.fillText('Level ' + (current_level + 1) + ' überstanden!', 0, 0);
        context.translate(-150, -310);
    }

    if (game_state === GAME_OVER || game_state === GAME_WON) {
        context.translate(180, canvas.height / 2);
        context.fillStyle = '#FF0000';
        context.font = '72pt monospace';
        if (game_state === GAME_OVER) {
            context.fillText('Verloren :-(', -110, 0);
        } else {
            context.fillText('Gewonnen!', -40, 0);
        }
        context.translate(30, 50);
        context.font = '24pt monospace';
        context.fillStyle = '#0000ff';
        context.fillText('Geschaffte Level: ' + current_level, 0, 0);
        context.translate(-80, 50);
        context.fillStyle = '#000000';
        context.fillText('"n" drücken für ein neues Spiel', 0, 0);
        context.translate(80, -50);
        context.translate(-30, -50);
        context.translate(-180, -canvas.height / 2);
    }
}

function createRandomEnemyTargetPosition() {
    return new Position(
        position_padding + ((canvas.width - position_padding) * Math.random()),
        position_padding * 2 + ((canvas.height - position_padding * 2) * Math.random())
    );
}

function createRandomEnemyStartPosition() {
    return new Position(
        position_padding + ((canvas.width - position_padding) * Math.random()),
        position_padding * 2 + ((canvas.height - position_padding * 2) / 2 * Math.random())
    );
}

function createEnemies(level) {
    var list = [];
    for (var i = 0; i < level.enemyQuantity; i++) {
        var speed = level.enemyMinSpeed + (Math.random() * (level.enemyMaxSpeed - level.enemyMinSpeed));
        var enemy = new Enemy(
            createRandomEnemyStartPosition(),
            createRandomEnemyTargetPosition(),
            new SpriteWrapper(sprite_enemy, 20 - Math.round(speed) * 2),
            new SpriteWrapper(sprite_enemy_restocking, 3),
            speed,
            level.snowballThrowLikeliness,
            level.snowballThrowDelayInMs,
            level.throwAtPlayerLikeliness
        );
        enemy.angle = calculateEnemyAngle(enemy);
        list.push(enemy);
    }
    return list;
}

function createObstacles(level) {
    var list = [];
    for (var i = 0; i < level.obstacleQuantity; i++) {
        var obstacle = new Obstacle(
            createRandomEnemyTargetPosition(),
            new SpriteWrapper(sprite_tree, 5),
            25
        );
        list.push(obstacle);
    }
    return list;
}

function keyPressed(keyCode) {
    return key_map[keyCode] === 1;
}

function handleKeydown(event) {
    key_map[event.keyCode] = 1;

    if (game_state === LEVEL_START) {
        game_state = GAME_RUNNING;
    }
}

function handleKeyup(event) {
    key_map[event.keyCode] = 0;
}

function handleMousedown() {
    var obj = {};
    obj.keyCode = mouse_key;
    handleKeydown(obj);
}

function handleMouseup() {
    var obj = {};
    obj.keyCode = mouse_key;
    handleKeyup(obj);
}

function updateMouseCoords(e) {
    if (e.pageX || e.pageY) {
        mouse_position.x = e.pageX;
        mouse_position.y = e.pageY;
    } else {
        mouse_position.x = e.clientX;
        mouse_position.y = e.clientY;
    }
}
