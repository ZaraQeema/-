const countryInput = document.getElementById('country-input');
const startEndBtn = document.getElementById('start-end-btn');
const correctCount = document.getElementById('correct-count');
const totalCount = document.getElementById('total-count');
const countriesList = document.getElementById('countries-list');
const timerDisplay = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty-select');

const allCountries = {
    "日本": ["にほん", "にっぽん", "Japan"],
    "中国": ["ちゅうごく", "中華人民共和国", "China"],
    "タイ":["たい","Thailand"],
    "アメリカ合衆国": ["あめりかがっしゅうこく", "あめりか", "米国", "べいこく", "United States"],
    "ブラジル":["ぶらじる","Brazil"],
    "カナダ":["かなだ","Canada"],
    "イギリス": ["いぎりす", "英国", "えいこく", "United Kingdom"],
    "フランス": ["ふらんす", "仏国", "ふつこく", "France"],
    "ドイツ": ["どいつ", "独国", "どっこく", "Germany"],
    "エジプト":["えじぷと","Egypt"],
    "南アフリカ共和国":["みなみあふりか","みなみあふりかきょうわこく","South Africa"],
    "ナイジェリア":["ないじぇりあ","Nigeria"],
    "オーストラリア":["おーすとらりあ","Australia"],
    "ニュージーランド":["にゅーじーらんど","New Zealand"],
    "パプアニューギニア":["ぱぷあにゅーぎにあ","Papua New Guinea"],

    // ... 他の国々を追加 ...
};

const regionCountries = {
    asia: {
        "日本": ["にほん", "にっぽん", "Japan"],
        "中国": ["ちゅうごく", "中華人民共和国", "China"],
        "タイ":["たい","Thailand"],
        // ... アジアの他の国々 ...
    },
    europe: {
        "イギリス": ["いぎりす", "英国", "えいこく", "United Kingdom"],
        "フランス": ["ふらんす", "仏国", "ふつこく", "France"],
        "ドイツ": ["どいつ", "独国", "どっこく", "Germany"],
        // ... ヨーロッパの他の国々 ...
    },
    africa:{
        "エジプト":["えじぷと","Egypt"],
        "南アフリカ共和国":["みなみあふりか","みなみあふりかきょうわこく","South Africa"],
        "ナイジェリア":["ないじぇりあ","Nigeria"],
    },
    america:{
        "アメリカ合衆国": ["あめりかがっしゅうこく", "あめりか", "米国", "べいこく", "United States"],
        "ブラジル":["ぶらじる","Brazil"],
        "カナダ":["かなだ","Canada"],
    },
    oceania:{
        "オーストラリア":["おーすとらりあ","Australia"],
        "ニュージーランド":["にゅーじーらんど","New Zealand"],
        "パプアニューギニア":["ぱぷあにゅーぎにあ","Papua New Guinea"],
    }
    
};

let countries = allCountries;
let guessedCountries = new Set();
let flagUrls = {};
let startTime;
let timerInterval;
let isGameRunning = false;

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

async function init() {
    await fetchFlagUrls();
    resetGame();
}

async function fetchFlagUrls() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await response.json();
        data.forEach(country => {
            const englishName = country.name.common;
            for (const [japanName, aliases] of Object.entries(allCountries)) {
                if (aliases.includes(englishName)) {
                    flagUrls[japanName] = country.flags.svg;
                    break;
                }
            }
        });
    } catch (error) {
        console.error('国旗の取得に失敗しました:', error);
    }
}

function resetGame() {
    guessedCountries.clear();
    correctCount.textContent = '0';
    totalCount.textContent = Object.keys(countries).length;
    countryInput.value = '';
    countryInput.disabled = true;
    startEndBtn.textContent = '開始';
    isGameRunning = false;
    clearInterval(timerInterval);
    timerDisplay.textContent = '00:00';
}

function startGame() {
    resetGame();
    countryInput.disabled = false;
    startEndBtn.textContent = '終了';
    isGameRunning = true;
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
    updateCountriesList();

}



function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function saveScore(difficulty, timeTaken, guessedCount, totalCountries) {
    const currentScore = Math.round((guessedCount / totalCountries) * 100);
    const bestScore = getCookie(`bestScore_${difficulty}`);
    const bestGuessedCount = getCookie(`bestGuessedCount_${difficulty}`);
    const bestTime = getCookie(`bestTime_${difficulty}`);
    
    let isNewRecord = false;

    if (!bestScore || !bestGuessedCount || !bestTime) {
        // 初めてのスコア
        isNewRecord = true;
    } else if (parseInt(guessedCount) > parseInt(bestGuessedCount)) {
        // 正答数が多い場合
        isNewRecord = true;
    } else if (parseInt(guessedCount) === parseInt(bestGuessedCount) && parseFloat(timeTaken) < parseFloat(bestTime)) {
        // 正答数が同じで、タイムが早い場合
        isNewRecord = true;
    }

    if (isNewRecord) {
        setCookie(`bestScore_${difficulty}`, currentScore, 365);
        setCookie(`bestTime_${difficulty}`, timeTaken, 365);
        setCookie(`bestGuessedCount_${difficulty}`, guessedCount, 365);
        setCookie(`bestTotalCountries_${difficulty}`, totalCountries, 365);
    }

    return isNewRecord;
}

function endGame(isCleared = false) {
    clearInterval(timerInterval);
    countryInput.disabled = true;
    startEndBtn.textContent = '開始';
    isGameRunning = false;
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000; // 秒単位
    const guessedCount = guessedCountries.size;
    const totalCountries = Object.keys(countries).length;
    
    const currentDifficulty = difficultySelect.value;
    const isNewRecord = saveScore(currentDifficulty, timeTaken, guessedCount, totalCountries);
    showResultModal(currentDifficulty, timeTaken, guessedCount, totalCountries, isCleared, isNewRecord);
}

function showResultModal(difficulty, timeTaken, guessedCount, totalCountries, isCleared, isNewRecord) {
    const minutes = Math.floor(timeTaken / 60);
    const seconds = Math.floor(timeTaken % 60);
    const score = ((guessedCount / totalCountries) * 100).toFixed(2);

    let currentResultHTML = `
        <h3>今回の結果 (${getDifficultyName(difficulty)})</h3>
        <p>正解数: ${guessedCount} / ${totalCountries}</p>
        <p>時間: ${minutes}分 ${seconds}秒</p>
        <p>スコア: ${score}%</p>
    `;

    if (isCleared) {
        currentResultHTML = `
            <h3 style="color: #4CAF50; font-size: 24px;">クリアおめでとう！🎉</h3>
            ${currentResultHTML}
        `;
    }

    document.getElementById('current-result').innerHTML = currentResultHTML;
    displayBestScore(difficulty, isNewRecord);

    const modal = document.getElementById('result-modal');
    modal.style.display = 'block';
}

function displayBestScore(difficulty, isNewRecord) {
    const bestScore = getCookie(`bestScore_${difficulty}`);
    const bestTime = getCookie(`bestTime_${difficulty}`);
    const bestGuessedCount = getCookie(`bestGuessedCount_${difficulty}`);
    const bestTotalCountries = getCookie(`bestTotalCountries_${difficulty}`);

    let bestScoreHTML = '';

    if (bestScore) {
        const minutes = Math.floor(bestTime / 60);
        const seconds = Math.floor(bestTime % 60);
        bestScoreHTML = `
            <h3>自己ベスト記録 (${getDifficultyName(difficulty)})</h3>
            <p>正解数: ${bestGuessedCount} / ${bestTotalCountries}</p>
            <p>時間: ${minutes}分 ${seconds}秒</p>
            <p>スコア: ${bestScore}%</p>
        `;
        
        if (isNewRecord) {
            bestScoreHTML = `
                <h3 style="color: #FFD700; font-size: 24px;">新記録達成！🏆</h3>
                ${bestScoreHTML}
            `;
        }
    } else {
        bestScoreHTML = `<p>まだ難易度「${getDifficultyName(difficulty)}」のベスト記録はありません。</p>`;
    }
    
    document.getElementById('best-score').innerHTML = bestScoreHTML;
}

function getDifficultyName(difficulty) {
    const difficultyNames = {
        'all': 'すべての国',
        'asia': 'アジア',
        'europe': 'ヨーロッパ',
        'africa': 'アフリカ',
        'america': '南北アメリカ',
        'oceania': 'オセアニア'
    };
    return difficultyNames[difficulty] || difficulty;
}

function normalizeInput(input) {
    return input.replace(/[\s　]/g, "").toLowerCase();
}

function checkCountry() {
    if (!isGameRunning) return;
    const input = normalizeInput(countryInput.value.trim());
    for (const [country, aliases] of Object.entries(countries)) {
        if ((normalizeInput(country) === input || aliases.some(alias => normalizeInput(alias) === input)) && !guessedCountries.has(country)) {
            guessedCountries.add(country);
            correctCount.textContent = guessedCountries.size;
            updateCountriesList();
            countryInput.value = '';
            
            // 全ての国名が入力されたかチェック
            if (guessedCountries.size === Object.keys(countries).length) {
                endGame(true);  // trueはゲームクリアを意味します
            }
            
            return;
        }
    }
}

function updateCountriesList() {
    const sortedCountries = Object.keys(countries).sort((a, b) => a.localeCompare(b, 'ja'));
    countriesList.innerHTML = sortedCountries
        .map(country => {
            const isGuessed = guessedCountries.has(country);
            const flagUrl = flagUrls[country];
            return `
                <div class="country-item ${isGuessed ? 'guessed' : ''}">
                    ${isGuessed && flagUrl ? `<img src="${flagUrl}" class="country-flag" alt="${country}の国旗">` : ''}
                    ${isGuessed ? country : (isGameRunning ? '　' : country)}
                </div>
            `;
        })
        .join('');
}

startEndBtn.addEventListener('click', () => {
    if (isGameRunning) {
        endGame();
    } else {
        startGame();
    }
});

countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkCountry();
    }
});

difficultySelect.addEventListener('change', (e) => {
    const selectedDifficulty = e.target.value;
    if (selectedDifficulty === 'all') {
        countries = allCountries;
    } else {
        countries = regionCountries[selectedDifficulty];
    }
    resetGame();
});

document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('result-modal').style.display = 'none';
});

window.onclick = function(event) {
    const modal = document.getElementById('result-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}



init();