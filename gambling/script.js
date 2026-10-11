const symbols = ["7", "BAR", "CHERRY", "LEMON", "GEM", "STAR"];
const state = {
  balance: 100,
  bet: 10,
};

const balanceEl = document.getElementById('balance');
const betValueEl = document.getElementById('bet-value');
const resultEl = document.getElementById('result');
const betSelectEl = document.getElementById('bet-select');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const reels = [
  document.getElementById('reel-1'),
  document.getElementById('reel-2'),
  document.getElementById('reel-3'),
];

function updateBalance() {
  balanceEl.textContent = state.balance;
  betValueEl.textContent = state.bet;
}

function setResult(message, tone = 'neutral') {
  resultEl.textContent = message;
  resultEl.style.color = tone === 'win' ? '#44d29b' : tone === 'lose' ? '#ef476f' : '#f5f7ff';
}

function randomSymbol() {
  const idx = Math.floor(Math.random() * symbols.length);
  return symbols[idx];
}

function rollReels() {
  return reels.map(() => randomSymbol());
}

function evaluateSpin(values) {
  const [a, b, c] = values;

  if (a === '7' && b === '7' && c === '7') {
    return { payout: state.bet * 25, message: 'Jackpot! Three 7s!', tone: 'win' };
  }

  if (a === b && b === c) {
    return { payout: state.bet * 10, message: `Three ${a}s!`, tone: 'win' };
  }

  if (a === b || b === c || a === c) {
    return { payout: state.bet * 2, message: 'Two matching symbols!', tone: 'win' };
  }

  return { payout: 0, message: 'No match. Better luck next round.', tone: 'lose' };
}

function spin() {
  if (state.balance < state.bet) {
    setResult('Not enough credits. Reset or lower your bet.', 'lose');
    return;
  }

  state.balance -= state.bet;
  updateBalance();

  const values = rollReels();

  values.forEach((value, index) => {
    reels[index].textContent = value;
    reels[index].style.transform = 'scale(0.92)';
    setTimeout(() => {
      reels[index].style.transform = 'scale(1)';
    }, 120);
  });

  const result = evaluateSpin(values);
  state.balance += result.payout;
  updateBalance();
  setResult(result.message, result.tone);

  if (state.balance <= 0) {
    spinBtn.disabled = true;
    setResult('You are out of credits. Hit reset to play again.', 'lose');
  } else {
    spinBtn.disabled = false;
  }
}

function resetGame() {
  state.balance = 100;
  state.bet = Number(betSelectEl.value);
  updateBalance();
  setResult('Fresh start. Ready to play.', 'neutral');
  spinBtn.disabled = false;
  reels.forEach((reel) => {
    reel.textContent = '7';
  });
}

betSelectEl.addEventListener('change', (event) => {
  state.bet = Number(event.target.value);
  updateBalance();
  setResult(`Bet set to ${state.bet}.`, 'neutral');
});

spinBtn.addEventListener('click', spin);
resetBtn.addEventListener('click', resetGame);

updateBalance();
setResult('Ready to play.', 'neutral');
