import { useEffect, useRef, useState } from "react";
import { BotanicalCorners, Moli } from "./art.jsx";
import "./camera.css";

const INITIAL_POSITION = { x: 0.5, y: 0.62 };

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function loadSvg(svg) {
  const source = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () =>
        reject(new Error("The illustration could not load."));
      image.src = source;
    });
    return image;
  } finally {
    URL.revokeObjectURL(source);
  }
}

function drawBackdrop(context, width, height) {
  const light = context.createRadialGradient(
    width * 0.72,
    height * 0.12,
    1,
    width * 0.45,
    height * 0.45,
    height,
  );
  light.addColorStop(0, "#fff6cb");
  light.addColorStop(0.65, "#eef0d5");
  light.addColorStop(1, "#dbe5c3");
  context.fillStyle = light;
  context.fillRect(0, 0, width, height);
}

/** A local-only camera overlay. Permission is requested only by Start Camera. */
export default function CameraExperience({ onClose }) {
  const [status, setStatus] = useState("idle");
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [size, setSize] = useState(42);
  const [photo, setPhoto] = useState("");
  const [notice, setNotice] = useState("");
  const [capturing, setCapturing] = useState(false);
  const panel = useRef(null);
  const video = useRef(null);
  const stage = useRef(null);
  const moli = useRef(null);
  const botany = useRef(null);
  const stream = useRef(null);
  const active = useRef(false);
  const requestId = useRef(0);
  const photoUrl = useRef("");
  const drag = useRef(null);

  useEffect(() => {
    active.current = true;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      active.current = false;
      requestId.current += 1;
      stopStream(stream.current);
      stream.current = null;
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  async function startCamera() {
    if (status === "requesting" || status === "live") return;
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setStatus("unsupported");
      setNotice(
        "Your browser cannot open a camera here. Try a supported HTTPS browser, or choose a cozy backdrop.",
      );
      return;
    }
    setStatus("requesting");
    setNotice("");
    const currentRequest = ++requestId.current;
    let nextStream;
    try {
      nextStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      if (!active.current || currentRequest !== requestId.current) {
        stopStream(nextStream);
        return;
      }
      stopStream(stream.current);
      stream.current = nextStream;
      video.current.srcObject = nextStream;
      await video.current.play();
      if (!active.current || currentRequest !== requestId.current) {
        stopStream(nextStream);
        return;
      }
      setStatus("live");
    } catch (error) {
      stopStream(nextStream);
      if (!active.current || currentRequest !== requestId.current) return;
      stream.current = null;
      const denied = [
        "NotAllowedError",
        "PermissionDeniedError",
        "SecurityError",
      ].includes(error.name);
      setStatus(denied ? "denied" : "unavailable");
      setNotice(
        denied
          ? "No worries—MOLI can still keep you company. Camera access was not allowed."
          : "Your camera is unavailable right now. A cozy illustrated backdrop is ready for you instead.",
      );
    }
  }

  function useBackdrop() {
    requestId.current += 1;
    stopStream(stream.current);
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setStatus("backdrop");
    setNotice("A little corner of calm, ready to make your own.");
  }

  function clampPosition(next, nextSize = size) {
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds.height) return next;
    const halfWidth = nextSize / 200;
    const halfHeight =
      (bounds.width * nextSize * 220) / (100 * 240 * bounds.height * 2);
    return {
      x: Math.max(halfWidth, Math.min(1 - halfWidth, next.x)),
      y: Math.max(halfHeight, Math.min(1 - halfHeight, next.y)),
    };
  }

  function beginDrag(event) {
    if (event.button !== 0) return;
    const bounds = stage.current.getBoundingClientRect();
    drag.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left - position.x * bounds.width,
      offsetY: event.clientY - bounds.top - position.y * bounds.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (drag.current?.pointerId !== event.pointerId) return;
    const bounds = stage.current.getBoundingClientRect();
    setPosition(
      clampPosition({
        x: (event.clientX - bounds.left - drag.current.offsetX) / bounds.width,
        y: (event.clientY - bounds.top - drag.current.offsetY) / bounds.height,
      }),
    );
  }

  function finishDrag(event) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }

  function moveByKeyboard(event) {
    const changes = {
      ArrowLeft: [-0.025, 0],
      ArrowRight: [0.025, 0],
      ArrowUp: [0, -0.025],
      ArrowDown: [0, 0.025],
    };
    if (!changes[event.key]) return;
    event.preventDefault();
    const [x, y] = changes[event.key];
    setPosition((current) =>
      clampPosition({ x: current.x + x, y: current.y + y }),
    );
  }

  async function capturePhoto() {
    if (!["live", "backdrop"].includes(status) || capturing) return;
    setCapturing(true);
    setNotice("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1440;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser cannot create an image.");
      if (status === "live") {
        const source = video.current;
        if (
          !source.videoWidth ||
          !source.videoHeight ||
          source.readyState < 2
        ) {
          throw new Error(
            "Your camera is still getting ready. Please try again.",
          );
        }
        const ratio = Math.max(
          canvas.width / source.videoWidth,
          canvas.height / source.videoHeight,
        );
        const cropWidth = canvas.width / ratio;
        const cropHeight = canvas.height / ratio;
        context.drawImage(
          source,
          (source.videoWidth - cropWidth) / 2,
          (source.videoHeight - cropHeight) / 2,
          cropWidth,
          cropHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      } else {
        drawBackdrop(context, canvas.width, canvas.height);
        const backdropSvg = botany.current.querySelector("svg").outerHTML;
        const backdropImage = await loadSvg(backdropSvg);
        context.drawImage(backdropImage, 0, 0, canvas.width, canvas.height);
        const captionSize = (17 * canvas.width) / stage.current.clientWidth;
        context.font = `italic ${captionSize}px Georgia, serif`;
        context.textAlign = "center";
        context.fillStyle = "#7e8c5a";
        context.fillText(
          "a little corner of calm",
          canvas.width / 2,
          canvas.height * 0.12 + captionSize * 0.9,
        );
      }
      const illustration = await loadSvg(
        moli.current.querySelector("svg").outerHTML,
      );
      const moliWidth = (canvas.width * size) / 100;
      const moliHeight = (moliWidth * 220) / 240;
      context.drawImage(
        illustration,
        position.x * canvas.width - moliWidth / 2,
        position.y * canvas.height - moliHeight / 2,
        moliWidth,
        moliHeight,
      );
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (image) =>
            image
              ? resolve(image)
              : reject(new Error("Your image could not be created.")),
          "image/png",
        ),
      );
      if (!active.current) return;
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      photoUrl.current = URL.createObjectURL(blob);
      setPhoto(photoUrl.current);
      setNotice(
        "Your photo is ready. It stays on your device unless you choose to share it.",
      );
    } catch (error) {
      if (active.current)
        setNotice(
          error.message || "Your photo could not be created. Please try again.",
        );
    } finally {
      if (active.current) setCapturing(false);
    }
  }

  function handleDialogKeys(event) {
    if (event.key === "Escape") onClose();
    if (event.key !== "Tab") return;
    const controls = [
      ...panel.current.querySelectorAll(
        "button:not(:disabled), a[href], input:not(:disabled)",
      ),
    ];
    if (!controls.length) return;
    if (
      event.shiftKey &&
      [controls[0], panel.current].includes(document.activeElement)
    ) {
      event.preventDefault();
      controls.at(-1).focus();
    } else if (
      !event.shiftKey &&
      [controls.at(-1), panel.current].includes(document.activeElement)
    ) {
      event.preventDefault();
      controls[0].focus();
    }
  }

  const ready = ["live", "backdrop"].includes(status);
  return (
    <div
      className="cam-backdrop"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="cam-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cam-title"
        tabIndex={-1}
        ref={panel}
        onKeyDown={handleDialogKeys}
      >
        <button
          className="cam-close"
          aria-label="Close camera experience"
          onClick={onClose}
        >
          ×
        </button>
        <p className="eyebrow">A TINY FRIEND, IN YOUR WORLD</p>
        <h2 id="cam-title">Bring MOLI Home</h2>
        <p className="cam-description">
          Let a little mossy magic into your day. Your camera and photos stay on
          your device.
        </p>
        <div
          className={`cam-stage ${status === "live" ? "cam-is-live" : ""}`}
          ref={stage}
        >
          <video
            ref={video}
            autoPlay
            playsInline
            muted
            className="cam-video"
            aria-label="Your live camera view"
          />
          <div className="cam-botanicals" ref={botany} aria-hidden="true">
            <BotanicalCorners />
          </div>
          {status !== "live" && (
            <span className="cam-stage-caption" aria-hidden="true">
              a little corner of calm
            </span>
          )}
          <button
            className="cam-moli"
            ref={moli}
            aria-label="Move MOLI"
            aria-describedby="cam-move-help"
            style={{
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
              width: `${size}%`,
            }}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onLostPointerCapture={finishDrag}
            onKeyDown={moveByKeyboard}
          >
            <Moli state="happy" />
          </button>
        </div>
        <p id="cam-move-help" className="cam-help">
          Drag MOLI to move, or use the arrow keys when selected.
        </p>
        <label className="cam-size" htmlFor="cam-size">
          <span>MOLI size</span>
          <input
            id="cam-size"
            type="range"
            min="25"
            max="65"
            value={size}
            onChange={(event) => {
              const next = Number(event.target.value);
              setSize(next);
              setPosition((current) => clampPosition(current, next));
            }}
          />
          <span>{size}%</span>
        </label>
        <div className="cam-actions">
          {status !== "live" && (
            <button
              className="button primary"
              disabled={status === "requesting"}
              onClick={startCamera}
            >
              {status === "requesting" ? "Waiting for camera…" : "Start Camera"}
            </button>
          )}
          {!ready && (
            <button className="button secondary" onClick={useBackdrop}>
              Use a cozy backdrop
            </button>
          )}
          {status === "live" && (
            <button className="button secondary" onClick={useBackdrop}>
              Use a cozy backdrop
            </button>
          )}
          {ready && (
            <button
              className="button primary"
              disabled={capturing}
              onClick={capturePhoto}
            >
              {capturing ? "Making your keepsake…" : "Capture My MOLI"}
            </button>
          )}
        </div>
        <p className="cam-notice" role="status">
          {notice ||
            (status === "idle"
              ? "Camera access is optional. We will only ask when you tap Start Camera."
              : "")}
        </p>
        {photo && (
          <div className="cam-photo">
            <h3>Your little keepsake</h3>
            <img
              src={photo}
              width="1080"
              height="1440"
              alt="Your captured photo with MOLI"
            />
            <a
              className="button secondary"
              href={photo}
              download="moli-at-home.png"
            >
              Download photo <span aria-hidden="true">↓</span>
            </a>
            <p className="cam-help">
              On iPhone, you can also press and hold the image to save it.
            </p>
          </div>
        )}
        <button className="cam-back-to-game" onClick={onClose}>
          Back to my lucky day
        </button>
      </section>
    </div>
  );
}
