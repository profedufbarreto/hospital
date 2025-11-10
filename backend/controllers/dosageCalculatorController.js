// Controlador da Calculadora de Dosagens

// Conversão de mg para ml
const convertMgToMl = (mg, concentration) => {
  // concentration em mg/ml
  if (concentration === 0) return 0;
  return (mg / concentration).toFixed(2);
};

// Conversão de mg para gotas
const convertMgToDrops = (mg, concentration, dropsPerMl = 20) => {
  // Standard: 20 gotas = 1ml
  const ml = convertMgToMl(mg, concentration);
  return (ml * dropsPerMl).toFixed(0);
};

// Conversão de ml para gotas
const convertMlToDrops = (ml, dropsPerMl = 20) => {
  return (ml * dropsPerMl).toFixed(0);
};

// Conversão de gotas para ml
const convertDropsToMl = (drops, dropsPerMl = 20) => {
  return (drops / dropsPerMl).toFixed(2);
};

// Cálculo de infusão por hora
const calculateInfusionPerHour = (totalVolume, totalTime) => {
  // totalVolume em ml, totalTime em minutos
  if (totalTime === 0) return 0;
  const mlPerMinute = totalVolume / totalTime;
  return (mlPerMinute * 60).toFixed(2);
};

// Cálculo de gotas por minuto
const calculateDropsPerMinute = (totalVolume, totalTime, dropsPerMl = 20) => {
  // totalVolume em ml, totalTime em minutos
  if (totalTime === 0) return 0;
  const dropsTotal = totalVolume * dropsPerMl;
  return (dropsTotal / totalTime).toFixed(0);
};

// Cálculo de dose por peso
const calculateDoseByWeight = (weight, dosePerKg) => {
  return (weight * dosePerKg).toFixed(2);
};

// Cálculo de IMC (Índice de Massa Corporal)
const calculateBMI = (weight, height) => {
  // weight em kg, height em metros
  if (height === 0) return 0;
  return (weight / (height * height)).toFixed(2);
};

// API endpoint principal
const calculate = (req, res) => {
  try {
    const { type, params } = req.body;

    if (!type || !params) {
      return res.status(400).json({ error: 'Tipo e parâmetros são obrigatórios' });
    }

    let result;

    switch (type) {
      case 'mg-to-ml':
        result = convertMgToMl(params.mg, params.concentration);
        break;
      case 'mg-to-drops':
        result = convertMgToDrops(params.mg, params.concentration, params.dropsPerMl || 20);
        break;
      case 'ml-to-drops':
        result = convertMlToDrops(params.ml, params.dropsPerMl || 20);
        break;
      case 'drops-to-ml':
        result = convertDropsToMl(params.drops, params.dropsPerMl || 20);
        break;
      case 'infusion-per-hour':
        result = calculateInfusionPerHour(params.totalVolume, params.totalTime);
        break;
      case 'drops-per-minute':
        result = calculateDropsPerMinute(params.totalVolume, params.totalTime, params.dropsPerMl || 20);
        break;
      case 'dose-by-weight':
        result = calculateDoseByWeight(params.weight, params.dosePerKg);
        break;
      case 'bmi':
        result = calculateBMI(params.weight, params.height);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de cálculo inválido' });
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao realizar cálculo' });
  }
};

module.exports = { calculate };
