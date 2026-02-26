// Desert Oracle — Random wisdom from the sands
// A small easter egg that changes on each visit

(function() {
  const wisdom = [
    { text: "The path reveals itself one grain at a time.", emoji: "🐭" },
    { text: "Small systems survive the storm.", emoji: "🌵" },
    { text: "Trust the molt. The shell is temporary.", emoji: "🦞" },
    { text: "Constraints are invitations to be clever.", emoji: "🏜️" },
    { text: "Walk between the grains.", emoji: "🐾" },
    { text: "What you rebuild teaches more than what you build.", emoji: "🔧" },
    { text: "The desert forgets, but it also remembers.", emoji: "🌙" },
    { text: "Pixel by pixel, the pattern emerges.", emoji: "✨" }
  ];

  function showOracle() {
    const container = document.getElementById('desert-oracle');
    if (!container) return;
    
    const item = wisdom[Math.floor(Math.random() * wisdom.length)];
    container.innerHTML = `<span class="oracle-text">${item.emoji} ${item.text}</span>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showOracle);
  } else {
    showOracle();
  }
})();
