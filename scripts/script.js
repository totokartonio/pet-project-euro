let countriesSet = document.getElementsByClassName('country');
let groups = document.querySelectorAll('.groups-container table');
let matchesGroup = document.querySelectorAll('.group-stage-container .match tbody tr');
let resultsGroup = document.querySelectorAll('.group-stage-container .match tbody tr td input');
let points = document.getElementsByClassName('points-team');
let played = document.getElementsByClassName('played-team');
let goals = document.getElementsByClassName('goals-team');
let stTeams = document.getElementsByClassName('sixteen-team');
let countries = {};
let previousResultsPaired ={};
let resultsPaired = {};
let comparedValues;

// Функция для сохранения данных в localStorage
let saveResultsToLocalStorage = function() {
    let results = [];
    for (let i = 0; i < resultsGroup.length; i++) {
        results.push({ id: resultsGroup[i].id, value: resultsGroup[i].value });
    }
    localStorage.setItem('matchResults', JSON.stringify(results));
};

// Функция для загрузки данных из localStorage
let loadResultsFromLocalStorage = function() {
    let storedResults = localStorage.getItem('matchResults');
    if (storedResults) {
        storedResults = JSON.parse(storedResults);
        for (let i = 0; i < storedResults.length; i++) {
            let input = document.getElementById(storedResults[i].id);
            if (input) {
                input.value = storedResults[i].value;
            }
        }
    }
};


// Мапа со странами
for (let i = 0; i < countriesSet.length; i++) {
    countries[countriesSet[i].dataset.number] = countriesSet[i].textContent
};

// Записываю изначальные данные в ячейках input
for (let i = 0; i < matchesGroup.length; i++) {
    previousResultsPaired[i] = { values: ['', ''], teams: ['', ''] };
};

// Функция для записи новых значений в исходные
let settingPreviousResults = function () {
    let l = 0;
    for (let i = 0; i < resultsGroup.length; i+=2) {
        previousResultsPaired[l] = { 
            values: [resultsGroup[i].value, resultsGroup[i + 1].value],
            teams: [resultsGroup[i].className, resultsGroup[i + 1].className]
        };
        l++;
    }
};

// Фунция для поиска значения по ключу
let getKeyByValue = function(obj, value) {
    return Object.keys(obj)
           .filter(key => obj[key] === value);
};

// Функция для поиска матчей между двумя командами
let findValuesByTeams = function(team1, team2) {
    for (let key in resultsPaired) {
        let entry = resultsPaired[key];
        if (entry.teams.includes(team1) && entry.teams.includes(team2)) {
            let index1 = entry.teams.indexOf(team1);
            let index2 = entry.teams.indexOf(team2);
            if ((index1 === 0 && index2 === 1) || (index1 === 1 && index2 === 0)) {
                return [Number(entry.values[index1]), Number(entry.values[index2])];
            }
        }
    }
    return [0, 0];
};

// Сколько голов забила команда
let scored = function(teamName) {
    let gs = 0;
    for (let key in resultsPaired) {
        let entry = resultsPaired[key];
        let index = entry.teams.indexOf(teamName);
        if (index !== -1) {
            gs += Number(entry.values[index]);
        }
    }
    return gs;
};

// Ранжирований команд внутри группы
let rankTeams = function(groupTeams) {
    groupTeams.sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
        if (a.goalsScored !== b.goalsScored) return b.goalsScored - a.goalsScored;
        let headToHead = findValuesByTeams(a.team, b.team);
        if (headToHead[0] !== headToHead[1]) return headToHead[1] - headToHead[0];
        return 0;
    });
};

// Сортировка команд согласно ранжированию
let sortGroups = function() {
    for (let i = 0; i < groups.length; i++) {
        let group = groups[i];
        let rows = group.rows;
        let groupRanking = [];
        
        // Сбор информации
        for (let j = 1; j < rows.length; j++) {
            groupRanking.push({
                team: rows[j].getElementsByTagName('td')[0].textContent,
                points: Number(rows[j].getElementsByTagName('td')[3].textContent),
                goalDifference: Number(rows[j].getElementsByTagName('td')[2].textContent),
                goalsScored: scored(rows[j].getElementsByTagName('td')[0].textContent)
            });
        }

        // Ранжирование
        rankTeams(groupRanking);

        // Сортировка
        for (let l = 0; l < groupRanking.length; l++) {
            let teamName = groupRanking[l].team;
            for (let m = 1; m < rows.length; m++) {
                if (rows[m].getElementsByTagName('td')[0].textContent === teamName) {
                    rows[0].parentNode.appendChild(rows[m]);
                    break;
                }
            }
        }
    }
};                             
        
// Определение команд в 1/16
let lastSixteen = function() {
    for (let i = 0; i < groups.length; i++) {
        let group = groups[i];
        let stTeam = document.getElementsByClassName('sixteen-team ' + group.className);
        let firstPlace = group.rows[1].getElementsByTagName('td')[0];
        let secondPlace = group.rows[2].getElementsByTagName('td')[0];
        for (let j = 0; j < stTeam.length; j++) {
            if (stTeam[j].dataset.position === 'first') {
                stTeam[j].textContent = firstPlace.textContent;
            } else if (stTeam[j].dataset.position === 'second') {
                stTeam[j].textContent = secondPlace.textContent;
            }
        }
    }
};

// Когда закончен групповой этап рассчитать выход в 1/16
let checkLastSixteen = function () {
    let games = 0
    for (let i = 0; i < played.length; i++) {
        games += Number(played[i].textContent)
    }
    if (games === 72) {
        lastSixteen()
    }
};

let addScore = function() {

    // Пары input, чтобы сравнивать забитые мячи
    let l = 0;
    for (let i = 0; i < resultsGroup.length; i+=2) {
        resultsPaired[l] = { 
            values: [resultsGroup[i].value, resultsGroup[i + 1].value],
            teams: [resultsGroup[i].className, resultsGroup[i + 1].className]
        };
        l++;
    };

    // Начисление очков
    for (let i = 0; i < matchesGroup.length; i++) {

        let firstResult = points[getKeyByValue(countries, resultsPaired[i].teams[0])];
        let secondResult = points[getKeyByValue(countries, resultsPaired[i].teams[1])];
        let firstPlay = played[getKeyByValue(countries, resultsPaired[i].teams[0])];
        let secondPlay = played[getKeyByValue(countries, resultsPaired[i].teams[1])];
        let firstGoal = goals[getKeyByValue(countries, resultsPaired[i].teams[0])];
        let secondGoal = goals[getKeyByValue(countries, resultsPaired[i].teams[1])];

        if (previousResultsPaired[i].values[0] !== '' && previousResultsPaired[i].values[1] !== '') {
            if (Number(previousResultsPaired[i].values[0]) > Number(previousResultsPaired[i].values[1])) {
                firstResult.textContent = Number(firstResult.textContent) - 3;
            } else if (Number(previousResultsPaired[i].values[0]) < Number(previousResultsPaired[i].values[1])) {
                secondResult.textContent = Number(secondResult.textContent) - 3;
            } else {
                firstResult.textContent = Number(firstResult.textContent) - 1;
                secondResult.textContent = Number(secondResult.textContent) - 1;
            }
            firstPlay.textContent --;
            secondPlay.textContent --;
            firstGoal.textContent -= Number(previousResultsPaired[i].values[0]) - Number(previousResultsPaired[i].values[1]);
            secondGoal.textContent -= Number(previousResultsPaired[i].values[1]) - Number(previousResultsPaired[i].values[0]);

        };

        if (isNaN(firstResult.textContent)) {
            firstResult.textContent = 0;
        };
        if (isNaN(secondResult.textContent)) {
            secondResult.textContent = 0;
        };
        if (isNaN(firstPlay.textContent)) {
            firstPlay.textContent = 0;
        };
        if (isNaN(secondPlay.textContent)) {
            secondPlay.textContent = 0;
        };
        if (isNaN(firstGoal.textContent)) {
            firstGoal.textContent = 0;
        };
        if (isNaN(secondGoal.textContent)) {
            secondGoal.textContent = 0;
        };

        if (resultsPaired[i].values[0] !== '' && resultsPaired[i].values[1] !== '') {
            if (Number(resultsPaired[i].values[0]) > Number(resultsPaired[i].values[1])) {
                firstResult.textContent = Number(firstResult.textContent) + 3;
            } else if (Number(resultsPaired[i].values[0]) < Number(resultsPaired[i].values[1])) {
                secondResult.textContent = Number(secondResult.textContent) + 3;
            } else {
                firstResult.textContent = Number(firstResult.textContent) + 1;
                secondResult.textContent = Number(secondResult.textContent) + 1;
            };

            firstPlay.textContent ++;
            secondPlay.textContent ++;
            firstGoal.textContent = Number(firstGoal.textContent) + Number(resultsPaired[i].values[0]) - Number(resultsPaired[i].values[1]);
            secondGoal.textContent = Number(secondGoal.textContent) + Number(resultsPaired[i].values[1]) - Number(resultsPaired[i].values[0]);
        }
    };
    settingPreviousResults();
    sortGroups();
    lastSixteen();
};

// Для срабатывания функций при изиенении input
for (let i = 0; i < resultsGroup.length; i++) {
    resultsGroup[i].addEventListener('input', function() {
        addScore();
        saveResultsToLocalStorage();
    });
};

// Вызов функции для загрузки данных при загрузке страницы
loadResultsFromLocalStorage();
addScore();