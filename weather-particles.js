/**
 * WeatherParticles - HTML5 Canvas Weather Animation Engine
 * Dynamically renders particle effects based on weather code and time of day.
 */
class WeatherParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.weatherType = 'clear-day'; // clear-day, clear-night, rain, snow, clouds, thunderstorm
        this.animId = null;
        this.lightningTimer = 0;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.initParticles();
    }

    setWeather(weatherCode, isDay = true) {
        // Map WMO Weather Codes (Open-Meteo) to visual particle types
        let type = isDay ? 'clear-day' : 'clear-night';

        if (weatherCode === 0 || weatherCode === 1) {
            type = isDay ? 'clear-day' : 'clear-night';
        } else if (weatherCode === 2 || weatherCode === 3) {
            type = isDay ? 'clouds-day' : 'clouds-night';
        } else if ([45, 48].includes(weatherCode)) {
            type = 'fog';
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
            type = 'rain';
        } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            type = 'snow';
        } else if ([95, 96, 99].includes(weatherCode)) {
            type = 'thunderstorm';
        }

        if (this.weatherType !== type) {
            this.weatherType = type;
            this.initParticles();
        }
    }

    initParticles() {
        this.particles = [];
        let count = 60;

        if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
            count = 140;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    length: Math.random() * 22 + 10,
                    speed: Math.random() * 12 + 10,
                    opacity: Math.random() * 0.4 + 0.3,
                    tilt: Math.random() * 2 - 1
                });
            }
        } else if (this.weatherType === 'snow') {
            count = 90;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 4 + 1.5,
                    speedY: Math.random() * 1.5 + 0.8,
                    speedX: Math.random() * 1 - 0.5,
                    step: Math.random() * 100,
                    stepSize: Math.random() * 0.02 + 0.01,
                    opacity: Math.random() * 0.7 + 0.3
                });
            }
        } else if (this.weatherType === 'clear-night' || this.weatherType === 'clouds-night') {
            count = 80;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * (this.height * 0.8),
                    radius: Math.random() * 1.8 + 0.5,
                    opacity: Math.random() * 0.8 + 0.2,
                    twinkleSpeed: Math.random() * 0.03 + 0.005,
                    twinkleDir: Math.random() > 0.5 ? 1 : -1
                });
            }
        } else if (this.weatherType === 'clear-day') {
            count = 35;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 6 + 2,
                    speedY: Math.random() * -0.6 - 0.2,
                    speedX: Math.random() * 0.6 - 0.3,
                    opacity: Math.random() * 0.35 + 0.1
                });
            }
        } else { // clouds or fog
            count = 25;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 80 + 40,
                    speedX: Math.random() * 0.4 + 0.1,
                    opacity: Math.random() * 0.12 + 0.03
                });
            }
        }
    }

    start() {
        if (!this.canvas) return;
        const loop = () => {
            this.update();
            this.draw();
            this.animId = requestAnimationFrame(loop);
        };
        if (this.animId) cancelAnimationFrame(this.animId);
        loop();
    }

    update() {
        if (!this.width || !this.height) return;

        if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
            this.particles.forEach(p => {
                p.y += p.speed;
                p.x += p.tilt;
                if (p.y > this.height) {
                    p.y = -20;
                    p.x = Math.random() * this.width;
                }
            });
        } else if (this.weatherType === 'snow') {
            this.particles.forEach(p => {
                p.step += p.stepSize;
                p.y += p.speedY;
                p.x += Math.sin(p.step) + p.speedX;
                if (p.y > this.height) {
                    p.y = -10;
                    p.x = Math.random() * this.width;
                }
            });
        } else if (this.weatherType.includes('night')) {
            this.particles.forEach(p => {
                p.opacity += p.twinkleSpeed * p.twinkleDir;
                if (p.opacity >= 0.95) p.twinkleDir = -1;
                if (p.opacity <= 0.15) p.twinkleDir = 1;
            });
        } else if (this.weatherType === 'clear-day') {
            this.particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                if (p.y < -10) {
                    p.y = this.height + 10;
                    p.x = Math.random() * this.width;
                }
            });
        } else {
            this.particles.forEach(p => {
                p.x += p.speedX;
                if (p.x - p.radius > this.width) {
                    p.x = -p.radius * 2;
                    p.y = Math.random() * this.height;
                }
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.weatherType === 'thunderstorm') {
            // Random lightning flash
            if (Math.random() < 0.008) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        }

        if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
            this.ctx.strokeStyle = 'rgba(180, 220, 255, 0.65)';
            this.ctx.lineWidth = 1.5;
            this.ctx.lineCap = 'round';
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.tilt, p.y + p.length);
                this.ctx.stroke();
            });
        } else if (this.weatherType === 'snow') {
            this.ctx.fillStyle = '#ffffff';
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1;
        } else if (this.weatherType.includes('night')) {
            this.ctx.fillStyle = '#ffffff';
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1;
        } else if (this.weatherType === 'clear-day') {
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 225, 130, ${p.opacity})`;
                this.ctx.fill();
            });
        } else {
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                this.ctx.fill();
            });
        }
    }
}
