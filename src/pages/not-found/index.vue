<template>
  <v-app>
    <!-- Animated alienscape background -->
    <div class="alienscape">
      <div class="stars"></div>
      <div class="stars stars--mid"></div>
      <div class="stars stars--near"></div>

      <!-- distant planets -->
      <div class="planet planet--a"></div>
      <div class="planet planet--b"></div>
      <div class="planet planet--c"></div>

      <!-- ufo that keeps trying to escape 404 -->
      <div class="ufo">
        <div class="ufo__dome"></div>
        <div class="ufo__body"></div>
        <div class="ufo__beam"></div>
      </div>

      <!-- an alien or two, obviously confused -->
      <div class="alien alien--one">
        <div class="alien__head"><span class="alien__eye"></span><span class="alien__eye"></span></div>
        <div class="alien__body"></div>
      </div>
      <div class="alien alien--two">
        <div class="alien__head"><span class="alien__eye"></span><span class="alien__eye"></span></div>
        <div class="alien__body"></div>
      </div>
    </div>

    <!-- Content card -->
    <v-main class="fill-height d-flex align-center justify-center">
      <v-card
        class="pa-8 text-center rounded-xl"
        max-width="560"
        elevation="16"
        style="
          background: rgba(10, 20, 40, 0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(120, 200, 255, 0.28);
          color: #eaf6ff;
        "
      >
        <div class="glitch mb-2" data-text="404">404</div>

        <h2 class="text-h5 font-weight-bold mb-3" style="color: #9fdcff">
          Houston, we lost this page 🛸
        </h2>
        <p class="text-body-2 mb-6" style="color: #cfe8ff">
          Our alien navigator took a wrong wormhole. This page does not exist
          (yet). It is probably off abducting crop circles somewhere.
        </p>

        <div class="d-flex ga-3 justify-center flex-wrap">
          <v-btn
            color="#9fdcff"
            variant="flat"
            prepend-icon="mdi-home"
            @click="goHome"
          >
            Beam me home
          </v-btn>
          <v-btn
            color="#9fdcff"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
          >
            Go back
          </v-btn>
        </div>

        <div class="text-caption mt-6" style="color: #7fb4d8; letter-spacing: .08em">
          ERROR 404 · SECTOR 7G · SIGNAL LOST
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => router.push("/welcome");
const goBack = () => {
  if (window.history.length > 1) router.back();
  else router.push("/welcome");
};
</script>

<style scoped>
/* ------------------------------------------------------------ */
/* Base alienscape */
/* ------------------------------------------------------------ */
.alienscape {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 10%, #1b2a5c 0%, transparent 60%),
    radial-gradient(ellipse at 80% 90%, #2a1b5c 0%, transparent 55%),
    linear-gradient(180deg, #05070f 0%, #0a1330 55%, #03040a 100%);
}

/* ------------------------------------------------------------ */
/* Stars (3 parallax layers) */
/* ------------------------------------------------------------ */
.stars,
.stars--mid,
.stars--near {
  position: absolute;
  inset: -50%;
  background-image:
    radial-gradient(1.5px 1.5px at 20% 30%, #fff 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 80% 10%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 50% 60%, #cfe8ff 50%, transparent 51%),
    radial-gradient(1px 1px at 15% 80%, #fff 50%, transparent 51%),
    radial-gradient(2px 2px at 65% 40%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 35% 55%, #cfe8ff 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 90% 70%, #fff 50%, transparent 51%);
  background-size: 400px 400px;
  animation: drift 120s linear infinite;
  opacity: 0.8;
}

.stars--mid {
  background-size: 260px 260px;
  animation-duration: 80s;
  opacity: 0.9;
  animation-direction: reverse;
}

.stars--near {
  background-size: 180px 180px;
  animation-duration: 50s;
  opacity: 1;
}

@keyframes drift {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-200px, -120px, 0); }
}

/* ------------------------------------------------------------ */
/* Planets */
/* ------------------------------------------------------------ */
.planet {
  position: absolute;
  border-radius: 50%;
  filter: blur(0.5px);
}

.planet--a {
  width: 160px;
  height: 160px;
  top: 12%;
  right: 8%;
  background: radial-gradient(circle at 30% 30%, #ff9a6b, #7a2b1a 70%, #2a0f08 100%);
  box-shadow: 0 0 60px rgba(255, 120, 80, 0.35);
  animation: float 18s ease-in-out infinite;
}

.planet--b {
  width: 90px;
  height: 90px;
  bottom: 18%;
  left: 10%;
  background: radial-gradient(circle at 30% 30%, #7fd4ff, #1a5c8a 70%, #081a2a 100%);
  box-shadow: 0 0 40px rgba(80, 180, 255, 0.35);
  animation: float 24s ease-in-out infinite reverse;
}

.planet--c {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 25%;
  background: radial-gradient(circle at 30% 30%, #d0b3ff, #4b2a8a 70%, #160a2a 100%);
  box-shadow: 0 0 24px rgba(180, 140, 255, 0.45);
  animation: float 30s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-24px); }
}

/* ------------------------------------------------------------ */
/* UFO */
/* ------------------------------------------------------------ */
.ufo {
  position: absolute;
  top: 22%;
  left: 12%;
  width: 120px;
  height: 80px;
  animation: ufoFly 14s ease-in-out infinite;
}

.ufo__dome {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 26px;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(180deg, #cfe8ff, #6fb6e6);
  box-shadow: 0 0 18px rgba(160, 220, 255, 0.7);
}

.ufo__body {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(180deg, #9aa7c7, #3b4a6b 70%, #1a2340);
  box-shadow: 0 0 24px rgba(160, 220, 255, 0.35);
}

.ufo__beam {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 80px;
  background: linear-gradient(180deg, rgba(160, 220, 255, 0.55), transparent);
  clip-path: polygon(30% 0, 70% 0, 100% 100%, 0 100%);
  filter: blur(2px);
  animation: beamPulse 2.4s ease-in-out infinite;
}

@keyframes beamPulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.9; }
}

@keyframes ufoFly {
  0%   { transform: translate(0, 0) rotate(-6deg); }
  25%  { transform: translate(60vw, 30px) rotate(8deg); }
  50%  { transform: translate(80vw, -40px) rotate(-4deg); }
  75%  { transform: translate(30vw, 40px) rotate(6deg); }
  100% { transform: translate(0, 0) rotate(-6deg); }
}

/* ------------------------------------------------------------ */
/* Aliens (wobbling, obviously lost) */
/* ------------------------------------------------------------ */
.alien {
  position: absolute;
  width: 44px;
  height: 80px;
  animation: bob 3s ease-in-out infinite;
}

.alien--one { bottom: 12%; left: 18%; animation-delay: 0.2s; }
.alien--two { bottom: 8%;  right: 20%; animation-delay: 1.1s; transform: scale(0.8); }

.alien__head {
  position: relative;
  width: 44px;
  height: 40px;
  border-radius: 50% 50% 45% 45%;
  background: radial-gradient(circle at 50% 40%, #b7ff9a, #4fae3f 70%, #1f5a1a 100%);
  box-shadow: 0 0 16px rgba(140, 255, 120, 0.5);
}

.alien__eye {
  position: absolute;
  top: 40%;
  width: 10px;
  height: 14px;
  border-radius: 50%;
  background: #0a0a0a;
  box-shadow: inset 0 0 4px #9dff8a;
}
.alien__eye:first-child { left: 22%; }
.alien__eye:last-child  { right: 22%; }

.alien__body {
  width: 26px;
  height: 34px;
  margin: -4px auto 0;
  border-radius: 40% 40% 30% 30%;
  background: linear-gradient(180deg, #9dff8a, #4fae3f 70%, #1f5a1a);
  box-shadow: 0 0 16px rgba(140, 255, 120, 0.4);
}

@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50%      { transform: translateY(-10px) rotate(3deg); }
}

/* ------------------------------------------------------------ */
/* Glitchy 404 heading */
/* ------------------------------------------------------------ */
.glitch {
  position: relative;
  font-size: clamp(4rem, 12vw, 7rem);
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #eaf6ff;
  text-shadow: 0 0 24px rgba(120, 200, 255, 0.6);
  display: inline-block;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.glitch::before {
  color: #ff5c8a;
  transform: translate(2px, -1px);
  clip-path: inset(0 0 60% 0);
  animation: glitchA 2.4s infinite linear alternate;
  opacity: 0.85;
}

.glitch::after {
  color: #5cc8ff;
  transform: translate(-2px, 1px);
  clip-path: inset(60% 0 0 0);
  animation: glitchB 1.9s infinite linear alternate;
  opacity: 0.85;
}

@keyframes glitchA {
  0%   { transform: translate(2px, -1px); clip-path: inset(0 0 60% 0); }
  20%  { transform: translate(-3px, 1px); clip-path: inset(10% 0 50% 0); }
  40%  { transform: translate(1px, -2px); clip-path: inset(30% 0 20% 0); }
  60%  { transform: translate(3px, 1px);  clip-path: inset(0 0 70% 0); }
  80%  { transform: translate(-1px, 0);   clip-path: inset(20% 0 40% 0); }
  100% { transform: translate(2px, -1px); clip-path: inset(0 0 60% 0); }
}

@keyframes glitchB {
  0%   { transform: translate(-2px, 1px); clip-path: inset(60% 0 0 0); }
  25%  { transform: translate(3px, -1px); clip-path: inset(40% 0 10% 0); }
  50%  { transform: translate(-1px, 2px); clip-path: inset(70% 0 0 0); }
  75%  { transform: translate(2px, 0);    clip-path: inset(50% 0 20% 0); }
  100% { transform: translate(-2px, 1px); clip-path: inset(60% 0 0 0); }
}

/* Respect reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .stars, .stars--mid, .stars--near,
  .planet, .ufo, .alien, .glitch::before, .glitch::after,
  .ufo__beam {
    animation: none !important;
  }
}
</style>
