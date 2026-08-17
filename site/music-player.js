const audio = document.getElementById("audio");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
const playButton = document.getElementById("play");
const chooseButton = document.getElementById("chooseMusic");
const progress = document.getElementById("progress");
const title = document.getElementById("title");
let audioContext, analyser, source, data;

function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function initAudio() {
    if (audioContext) return;
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
}

function setMusic(file) {
    if (!file?.src) return;
    audio.pause();
    audio.src = file.src;
    title.textContent = file.name || "Muzică";
    progress.value = 0;
    playButton.disabled = false;
    audio.load();
}

async function togglePlay() {
    if (!audio.src) return;
    initAudio();
    if (audioContext.state === "suspended") await audioContext.resume();
    if (audio.paused) await audio.play(); else audio.pause();
}

chooseButton.addEventListener("click", async () => {
    const result = await window.mediaLibrary.chooseMusic();
    if (!result?.canceled) {
        setMusic(result);
        await togglePlay();
    }
});

playButton.addEventListener("click", () => togglePlay().catch(() => {
    title.textContent = "Piesa nu a putut fi redată.";
}));

audio.addEventListener("play", () => {
    playButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
    playButton.setAttribute("aria-label", "Pauză");
});

audio.addEventListener("pause", () => {
    playButton.innerHTML = '<i class="bi bi-play-fill"></i>';
    playButton.setAttribute("aria-label", "Redă");
});

audio.addEventListener("timeupdate", () => {
    if (audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
});

audio.addEventListener("ended", () => { progress.value = 0; });

progress.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
});

function draw() {
    requestAnimationFrame(draw);

    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    if (!analyser || !data) return;

    analyser.getByteFrequencyData(data);

    const cx = width / 2;
    const cy = height * 0.442;
    const baseRadius = 89.5;

    const points = 2000;
    const bassSamples = 150;
    const repetitions = 4;

    let bass = 0;
    for (let i = 0; i < bassSamples; i++) {
        bass += data[i];
    }
    bass /= bassSamples;
    const globalBass = (bass / 255) * 15;

    function getSpectrumValue(position) {
        const scaledPosition = position * repetitions;
        const segment = Math.floor(scaledPosition);
        let repeatedPosition = scaledPosition - segment;

        if (segment % 2 === 1) {
            repeatedPosition = 1 - repeatedPosition;
        }

        const spectrumPosition = repeatedPosition * (bassSamples - 1);
        const index = Math.floor(spectrumPosition);
        const nextIndex = Math.min(index + 1, bassSamples - 1);
        const fraction = spectrumPosition - index;

        const a = data[index] / 255;
        const b = data[nextIndex] / 255;
        return a + (b - a) * fraction;
    }

    // ==========================================
    // LINIA 1 EXTERIOARĂ (Vârfuri mai mici - 55px)
    // ==========================================
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
        const position = i / points;
        const angle = position * Math.PI * 2;
        const value = getSpectrumValue(position);

        const spike = Math.pow(value, 0.7) * 55; // Se extinde spre exterior cu maxim 55px
        const radius = baseRadius + globalBass + spike;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgb(255 255 255)"; // Alb semitransparent
    ctx.lineJoin = "miter";
    ctx.stroke();

    // ==========================================
    // LINIA 2 EXTERIOARĂ (Vârfuri și mai mici - 25px)
    // ==========================================
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
        const position = i / points;
        const angle = position * Math.PI * 2;
        const value = getSpectrumValue(position);

        const spike = Math.pow(value, 0.7) * 25; // Se extinde spre exterior cu maxim 55px
        const radius = baseRadius + globalBass + spike;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgb(255 255 255)"; // Alb semitransparent
    ctx.lineJoin = "miter";
    ctx.stroke();

    // ==========================================
    // LINIA 3 EXTERIOARĂ (Vârfuri mai mari - 100px)
    // ==========================================
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
        const position = i / points;
        const angle = position * Math.PI * 2;
        const value = getSpectrumValue(position);

        const spike = Math.pow(value, 0.7) * 100; // Se extinde spre exterior cu maxim 100px
        const radius = baseRadius + globalBass + spike;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#ffffff"; // Alb intens
    ctx.lineJoin = "miter";
    ctx.stroke();
    // ==========================================
    // CERCUL CENTRAL DE BAZĂ
    // ==========================================
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.stroke();
    // ==========================================
// LINIA 4 — BASS CU LINII PUTERNICE
// ==========================================
    const lineCount = 120;
    const minLength = 5;
    const maxLength = 128;
    const lineWidth = 2;
    const lineBaseRadius = baseRadius + 8;

    ctx.save();

    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "butt";

    for (let i = 0; i < lineCount; i++) {
        const position = i / lineCount;
        const angle = position * Math.PI * 2;

        const value = getSpectrumValue(position);

        // Amplifică mult diferențele din bass
        const bassValue = Math.pow(value, 0.45);

        const dynamicLength =
            minLength + bassValue * (maxLength - minLength);

        const innerRadius = lineBaseRadius;
        const outerRadius = lineBaseRadius + dynamicLength;

        const x1 = cx + Math.cos(angle) * innerRadius;
        const y1 = cy + Math.sin(angle) * innerRadius;

        const x2 = cx + Math.cos(angle) * outerRadius;
        const y2 = cy + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.restore();

    // ==========================================
// LINIA 5 — BASS CU LINII PUTERNICE
// ==========================================
    const lineCount2 = 120;
    const minLength2 = 5;
    const maxLength2 = 64;
    const lineWidth2 = 2;
    const lineBaseRadius2 = baseRadius + 8;

    ctx.save();

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth2 = lineWidth2;
    ctx.lineCap2 = "butt";

    for (let i = 0; i < lineCount2; i++) {
        const position = i / lineCount2;
        const angle = position * Math.PI * 2;

        const value = getSpectrumValue(position);

        // Amplifică mult diferențele din bass
        const bassValue = Math.pow(value, 0.45);

        const dynamicLength =
            minLength2 + bassValue * (maxLength2 - minLength2);

        const innerRadius = lineBaseRadius2;
        const outerRadius = lineBaseRadius2 + dynamicLength;

        const x1 = cx + Math.cos(angle) * innerRadius;
        const y1 = cy + Math.sin(angle) * innerRadius;

        const x2 = cx + Math.cos(angle) * outerRadius;
        const y2 = cy + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.restore();
}

draw();

window.mediaLibrary?.getStartupMusic?.().then(async (file) => {
    if (file) {
        setMusic(file);
        try { await togglePlay(); } catch {}
    }
});