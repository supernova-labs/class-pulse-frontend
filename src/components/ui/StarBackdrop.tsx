// subtle twinkling starfield behind the participant screen (never used on the telão)
const STARS = [
  { left: "6%", top: "16%", size: 2, color: "#B4A9FF", delay: "0s", dur: "3.2s" },
  { left: "14%", top: "70%", size: 2, color: "#FFFFFF", delay: "0.8s", dur: "4.1s" },
  { left: "22%", top: "34%", size: 3, color: "#B4A9FF", delay: "1.4s", dur: "3.6s" },
  { left: "9%", top: "88%", size: 2, color: "#FFFFFF", delay: "0.3s", dur: "3s" },
  { left: "40%", top: "9%", size: 2, color: "#B4A9FF", delay: "1.1s", dur: "4.4s" },
  { left: "62%", top: "12%", size: 2, color: "#FFFFFF", delay: "0.6s", dur: "3.4s" },
  { left: "78%", top: "26%", size: 3, color: "#B4A9FF", delay: "1.8s", dur: "3.8s" },
  { left: "90%", top: "20%", size: 2, color: "#FFFFFF", delay: "0.2s", dur: "3.1s" },
  { left: "85%", top: "64%", size: 2, color: "#B4A9FF", delay: "1.3s", dur: "4.2s" },
  { left: "94%", top: "82%", size: 2, color: "#FFFFFF", delay: "0.9s", dur: "3.5s" },
  { left: "72%", top: "90%", size: 3, color: "#B4A9FF", delay: "1.6s", dur: "4s" },
  { left: "56%", top: "78%", size: 2, color: "#FFFFFF", delay: "0.5s", dur: "3.3s" },
];

export function StarBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {STARS.map((star) => (
        <span
          key={`${star.left}-${star.top}`}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: star.color,
            animationDelay: star.delay,
            animationDuration: star.dur,
          }}
        />
      ))}
    </div>
  );
}
