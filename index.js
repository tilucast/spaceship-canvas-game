import Player from './player.js'
import Projectile from './projectile.js'
import Enemy from './enemy.js'
import Particle from './particle.js'

const canvas = document.querySelector('canvas')
const value = document.querySelector('#value')
const startGame = document.querySelector('#start-game')
const modalPoints = document.querySelector('#points')

let accumulator = 0
canvas.width = innerWidth
canvas.height = innerHeight

const playerXPosition = canvas.width / 2
const playerYPositon = canvas.height / 2

const context = canvas.getContext('2d')

let player = new Player(playerXPosition, playerYPositon, 18, 'white')

let projectiles = []
let enemies = []
let particles = []

function initGame(){
    player = new Player(playerXPosition, playerYPositon, 18, 'white')
    projectiles = []
    enemies = []
    particles = []

    accumulator = 0
    value.innerHTML = accumulator
    modalPoints.innerHTML = accumulator
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4

        let x
        let y

        if(Math.random() < .5){
            x = Math.random() < .5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else{
            x = Math.random() * canvas.width
            y = Math.random() < .5 ? 0 - radius : canvas.height + radius
        }

        const angle = Math.atan2(canvas.height / 2 - y, 
            canvas.width / 2 - x)
    
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        enemies.push(new Enemy(x, y, radius, color, velocity))

    }, 1000)
}

let animationId

function animateProjectile(){
    animationId = requestAnimationFrame(animateProjectile)

    context.fillStyle = 'rgba(0, 0, 0, .1)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    player.drawPlayer(context)

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        } else{
            particle.update(context)
        }
        
    })

    projectiles.forEach((projectile, index) => {
        projectile.update(context)

        if(projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height){
            projectiles.splice(index, 1)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update(context)

        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if(distance - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)

            document.querySelector('#modal').style.display = 'grid'
            modalPoints.innerHTML = accumulator
        }

        projectiles.forEach((projectile, index2) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            if(distance - enemy.radius - projectile.radius < 1){

                for (let index = 0; index < enemy.radius * 2; index++) {
                    particles.push(new Particle(projectile.x, projectile.y, 
                        Math.random() * 3, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }

                if(enemy.radius - 10 > 5){
                    accumulator += 100
                    value.innerHTML = accumulator

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    projectiles.splice(index, 1)
                } else{
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(index2, 1)

                        accumulator += 150
                        value.innerHTML = accumulator
                    }, 0)
                }

            }
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, 
        event.clientX - canvas.width / 2)

    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

startGame.addEventListener('click', () => {
    initGame()
    spawnEnemies()
    animateProjectile()

    document.querySelector('#modal').style.display = 'none'
})