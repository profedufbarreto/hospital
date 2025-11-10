// dosage-calculator.js - Funções da calculadora de dosagens

async function calculateMgToMl() {
  const mg = parseFloat(document.getElementById('calcMg').value);
  const concentration = parseFloat(document.getElementById('calcConcentration').value);

  if (!mg || !concentration) {
    showNotification('Preencha todos os campos', 'warning');
    return;
  }

  try {
    const result = await api.calculateDosage('mg-to-ml', { mg, concentration });
    displayResult('resultMgToMl', `${mg} mg = <strong>${result.result} ml</strong>`);
  } catch (error) {
    showNotification('Erro ao calcular: ' + error.message, 'error');
  }
}

async function calculateMlToDrops() {
  const ml = parseFloat(document.getElementById('calcMlDrops').value);
  const dropsPerMl = parseFloat(document.getElementById('calcDropsPerMl').value) || 20;

  if (!ml) {
    showNotification('Preencha todos os campos', 'warning');
    return;
  }

  try {
    const result = await api.calculateDosage('ml-to-drops', { ml, dropsPerMl });
    displayResult('resultMlToDrops', `${ml} ml = <strong>${result.result} gotas</strong> (com ${dropsPerMl} gotas/ml)`);
  } catch (error) {
    showNotification('Erro ao calcular: ' + error.message, 'error');
  }
}

async function calculateDropsPerMinute() {
  const totalVolume = parseFloat(document.getElementById('calcTotalVolume').value);
  const totalTime = parseFloat(document.getElementById('calcTotalTime').value);
  const dropsPerMl = parseFloat(document.getElementById('calcDropsMin').value) || 20;

  if (!totalVolume || !totalTime) {
    showNotification('Preencha todos os campos', 'warning');
    return;
  }

  try {
    const result = await api.calculateDosage('drops-per-minute', { totalVolume, totalTime, dropsPerMl });
    displayResult('resultDropsPerMinute', `<strong>${result.result} gotas/min</strong> (Volume: ${totalVolume}ml em ${totalTime}min)`);
  } catch (error) {
    showNotification('Erro ao calcular: ' + error.message, 'error');
  }
}

async function calculateDoseByWeight() {
  const weight = parseFloat(document.getElementById('calcWeight').value);
  const dosePerKg = parseFloat(document.getElementById('calcDosePerKg').value);

  if (!weight || !dosePerKg) {
    showNotification('Preencha todos os campos', 'warning');
    return;
  }

  try {
    const result = await api.calculateDosage('dose-by-weight', { weight, dosePerKg });
    displayResult('resultDoseByWeight', `Dose Total: <strong>${result.result}</strong> (${weight}kg × ${dosePerKg})`);
  } catch (error) {
    showNotification('Erro ao calcular: ' + error.message, 'error');
  }
}

async function calculateBMI() {
  const weight = parseFloat(document.getElementById('calcBmiWeight').value);
  const height = parseFloat(document.getElementById('calcBmiHeight').value);

  if (!weight || !height) {
    showNotification('Preencha todos os campos', 'warning');
    return;
  }

  try {
    const result = await api.calculateDosage('bmi', { weight, height });
    const bmi = parseFloat(result.result);
    let category = '';

    if (bmi < 18.5) category = 'Abaixo do peso';
    else if (bmi < 25) category = 'Peso normal';
    else if (bmi < 30) category = 'Sobrepeso';
    else category = 'Obesidade';

    displayResult('resultBMI', `IMC: <strong>${result.result}</strong> - ${category}`);
  } catch (error) {
    showNotification('Erro ao calcular: ' + error.message, 'error');
  }
}

function displayResult(elementId, resultHTML) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = resultHTML;
    element.classList.add('show');
  }
}
