(function () {
  if (window.__mouseTrailInjected) return;
  window.__mouseTrailInjected = true;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let trail = [];
  const maxTrailLength = 20;

  let color = "#ff0000";
  let maxWidth = 8;
  let isEnabled = true;
  let lastMoveTime = Date.now();

  const setCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  setCanvasSize();
  window.addEventListener("resize", setCanvasSize);

  chrome.storage.sync.get(["trailColor", "trailWidth", "trailEnabled", "trailSmoothness"], (data) => {
    color = data.trailColor || "#ff0000";
    maxWidth = data.trailWidth || 8;
    isEnabled = data.trailEnabled ?? true;
    smoothness = data.trailSmoothness || 8;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.trailColor) color = changes.trailColor.newValue;
    if (changes.trailWidth) maxWidth = changes.trailWidth.newValue;
    if (changes.trailEnabled) {
      isEnabled = changes.trailEnabled.newValue;
      if (!isEnabled) {
        trail = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    if (changes.trailSmoothness) {
      smoothness = changes.trailSmoothness.newValue;
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!isEnabled) return;
    trail.push({ x: e.clientX, y: e.clientY });
    if (trail.length > maxTrailLength) trail.shift();
    lastMoveTime = Date.now();
  });

  // Catmull-Rom 曲线插值函数
  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x: 0.5 * ((2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * ((2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    };
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isEnabled) return;

    if (Date.now() - lastMoveTime > 80 && trail.length > 0) {
      trail.shift();
    }

    if (trail.length < 4) return;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const steps = smoothness; // 每段插值数量，越大越平滑

    for (let i = 0; i < trail.length - 3; i++) {
      for (let j = 0; j < steps; j++) {
        const t1 = j / steps;
        const t2 = (j + 1) / steps;

        const pA = catmullRom(trail[i], trail[i + 1], trail[i + 2], trail[i + 3], t1);
        const pB = catmullRom(trail[i], trail[i + 1], trail[i + 2], trail[i + 3], t2);

        const indexRatio = (i + t1) / trail.length; // 保留原始粗细/透明逻辑
        const width = maxWidth * indexRatio;
        const alpha = indexRatio;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.globalAlpha = alpha;
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  animate();
})();
