import React, { useState, useRef, useEffect } from "react"; // Importa useRef y useEffect
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const RetirementPlanCalculator = () => {
  const [age, setAge] = useState(43);
  const [retirementAge, setRetirementAge] = useState(65);
  const [desiredIncome, setDesiredIncome] = useState(9000);
  const [extraExpense, setExtraExpense] = useState(0);
  const [currentInvestment, setCurrentInvestment] = useState(0);

  const [customRetirementAge, setCustomRetirementAge] = useState(retirementAge);
  const [customDesiredIncome, setCustomDesiredIncome] = useState(desiredIncome);
  const [customExtraExpense, setCustomExtraExpense] = useState(extraExpense);
  const [customCurrentInvestment, setCustomCurrentInvestment] = useState(currentInvestment);

  const [plans, setPlans] = useState([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [error, setError] = useState("");

  const inflationRate = 0.04;
  const returnRate = 0.20;

  // Referencia al contenedor del plan
  const planRef = useRef(null);

  // Función para formatear cantidades con comas
  const formatNumber = (number) => {
    const parsedNumber = parseFloat(number);
    if (isNaN(parsedNumber)) {
      return "0.00";
    }
    return parsedNumber.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Función para generar el párrafo descriptivo del plan
  const generatePlanDescription = (plan) => {
    const {
      retirementAge,
      desiredIncome,
      extraExpense,
      currentInvestment,
      futureSalary,
      requiredCapital,
      monthlyInvestment,
    } = plan;

    return (
      <div style={{ fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
        <p>
          Para poder retirarte a los <strong>{retirementAge} años</strong> con un ingreso mensual que te alcance para{" "}
          <strong>${formatNumber(desiredIncome)} pesos</strong> de productos a precio de hoy, necesitarás en ese futuro:
        </p>
        <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
          <li>
            Un ingreso mensual futuro de{" "}
            <strong>${formatNumber(futureSalary)} pesos</strong> (ajustado por inflación).
          </li>
          <li>
            Un capital requerido de aproximadamente{" "}
            <strong>${formatNumber(requiredCapital)} pesos</strong>.
          </li>
        </ul>
        <p style={{ marginTop: "16px" }}>
          Y desde hoy, para poder lograrlo, deberás invertir{" "}
          <strong>${formatNumber(monthlyInvestment)} pesos mensuales</strong> con un rendimiento anual de al menos{" "}
          <strong>20%</strong>.
        </p>
      </div>
    );
  };

  const validateInputs = (actualRetirementAge, actualAge) => {
    if (actualRetirementAge <= actualAge) {
      setError("La edad de retiro debe ser mayor que la edad actual.");
      return false;
    }
    setError("");
    return true;
  };

  const calculatePlan = (custom = false) => {
    const actualRetirementAge = custom ? customRetirementAge : retirementAge;
    const actualAge = age;

    if (!validateInputs(actualRetirementAge, actualAge)) {
      return;
    }

    const actualDesiredIncome = custom ? customDesiredIncome : desiredIncome;
    const actualExtraExpense = custom ? customExtraExpense : extraExpense;
    const actualCurrentInvestment = custom ? customCurrentInvestment : currentInvestment;

    const yearsToRetirement = actualRetirementAge - actualAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const futureSalary = actualDesiredIncome * Math.pow(1 + inflationRate, yearsToRetirement);

    const r = returnRate / 12;

    let monthlyInvestment = 0;
    let accumulated = actualCurrentInvestment;
    let requiredCapital = (futureSalary * 12) / returnRate;

    const calculateAccumulated = (investment) => {
      accumulated = actualCurrentInvestment;
      for (let i = 1; i <= monthsToRetirement; i++) {
        accumulated = accumulated * (1 + r) + investment;
        if (actualExtraExpense > 0 && i % 12 === 0) {
          const adjustedExpense = actualExtraExpense * Math.pow(1 + inflationRate, i / 12);
          accumulated -= adjustedExpense;
        }
      }
      return accumulated;
    };

    let low = 0;
    let high = futureSalary * 100;
    let iterationCount = 0;
    const maxIterations = 1000;

    while (high - low > 0.01 && iterationCount < maxIterations) {
      monthlyInvestment = (high + low) / 2;
      accumulated = calculateAccumulated(monthlyInvestment);

      if (accumulated > requiredCapital) {
        high = monthlyInvestment;
      } else {
        low = monthlyInvestment;
      }
      iterationCount++;
    }

    if (iterationCount >= maxIterations) {
      setError("No se pudo calcular la inversión mensual. Por favor, revisa los valores ingresados.");
      return;
    }

    let data = [];
    accumulated = actualCurrentInvestment;
    for (let i = 1; i <= monthsToRetirement; i++) {
      const interesMensual = accumulated * r;
      accumulated += interesMensual + monthlyInvestment;
      if (actualExtraExpense > 0 && i % 12 === 0) {
        const adjustedExpense = actualExtraExpense * Math.pow(1 + inflationRate, i / 12);
        accumulated -= adjustedExpense;
      }
      if (i % 12 === 0 || i === monthsToRetirement) {
        data.push({ year: actualAge + i / 12, capital: parseFloat(accumulated.toFixed(2)) });
      }
    }

    const newPlan = {
      age: actualAge,
      retirementAge: actualRetirementAge,
      desiredIncome: actualDesiredIncome,
      futureSalary: futureSalary.toFixed(2),
      requiredCapital: requiredCapital.toFixed(2),
      monthlyInvestment: monthlyInvestment.toFixed(2),
      extraExpense: actualExtraExpense,
      currentInvestment: actualCurrentInvestment,
      projection: data,
    };

    setPlans((prevPlans) => {
      const updatedPlans = [...prevPlans, newPlan];
      setCurrentPlanIndex(updatedPlans.length - 1);
      return updatedPlans;
    });
    setShowCustomOptions(true);

    // Desplazar la pantalla al contenedor del plan
    if (planRef.current) {
      planRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const nextPlan = () => setCurrentPlanIndex((index) => (index + 1) % plans.length);
  const prevPlan = () => setCurrentPlanIndex((index) => (index - 1 + plans.length) % plans.length);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "8px", padding: "16px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Calculadora de Plan de Retiro</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "16px", color: "#333" }}>
            Para generar tu plan de retiro, primero necesitamos saber tu <strong>edad actual</strong>.
            Esto nos ayudará a calcular cuánto tiempo tienes para ahorrar antes de retirarte.
          </p>
        </div>
        <label style={{ display: "block", fontSize: "14px", marginBottom: "8px" }}>Tu edad</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(parseInt(e.target.value))}
          min={18}
          max={64}
          style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <button
          onClick={() => calculatePlan(false)}
          style={{ width: "100%", marginTop: "16px", background: "#3b82f6", color: "white", padding: "8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
        >
          Generar Plan Estándar
        </button>
      </div>

      {plans.length > 0 && (
        <div ref={planRef} style={{ marginTop: "24px" }}> {/* Referencia al contenedor del plan */}
          <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Detalles del Plan</h3>
          {generatePlanDescription(plans[currentPlanIndex])}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={plans[currentPlanIndex].projection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="capital" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
            <button
              onClick={prevPlan}
              style={{ background: "#6b7280", color: "white", padding: "8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            >
              Anterior
            </button>
            <button
              onClick={nextPlan}
              style={{ background: "#6b7280", color: "white", padding: "8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {showCustomOptions && (
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Ajusta tu plan</h3>
          <p style={{ fontSize: "16px", color: "#333", marginBottom: "16px" }}>
            ¿Quieres explorar diferentes escenarios? Ajusta los siguientes datos para ver cómo cambia tu plan de retiro:
          </p>
          <label>Edad de retiro</label>
          <input
            type="number"
            value={customRetirementAge}
            onChange={(e) => setCustomRetirementAge(parseInt(e.target.value))}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
          />
          <label>Ingreso mensual deseado</label>
          <input
            type="number"
            value={customDesiredIncome}
            onChange={(e) => setCustomDesiredIncome(parseInt(e.target.value))}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
          />
          <label>Gasto extra cada año</label>
          <input
            type="number"
            value={customExtraExpense}
            onChange={(e) => setCustomExtraExpense(parseInt(e.target.value))}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
          />
          <label>Inversión actual</label>
          <input
            type="number"
            value={customCurrentInvestment}
            onChange={(e) => setCustomCurrentInvestment(parseInt(e.target.value))}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
          />
          <button
            onClick={() => calculatePlan(true)}
            style={{ width: "100%", marginTop: "16px", background: "#3b82f6", color: "white", padding: "8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
          >
            Crear Nuevo Plan
          </button>
        </div>
      )}

      {plans.length > 0 && (
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", marginBottom: "16px" }}>
            ¿Quisieras que te digamos cómo lograrlo? Muchas personas se están asociando en la cooperativa{" "}
            <strong>"Lo Nuestro"</strong> para alcanzar sus metas de retiro. ¡Mándanos un mensaje y te decimos los siguientes pasos! Cabe mencionar que no cuesta nada.
          </p>
          <a
            href={`https://wa.me/522481146831?text=${encodeURIComponent(
              plans.length > 0
                ? `Hola, quiero saber más sobre cómo lograr mi plan de retiro. Aquí están los detalles de mi plan:\n\n` +
                  `- Edad de retiro: ${plans[currentPlanIndex].retirementAge} años\n` +
                  `- Ingreso mensual deseado: $${formatNumber(plans[currentPlanIndex].desiredIncome)} pesos\n` +
                  `- Inversión mensual necesaria: $${formatNumber(plans[currentPlanIndex].monthlyInvestment)} pesos\n` +
                  `- Capital requerido: $${formatNumber(plans[currentPlanIndex].requiredCapital)} pesos\n`
                : "Hola, quiero saber más sobre cómo lograr mi plan de retiro."
            )}`}
            style={{ background: "#25D366", color: "white", padding: "8px", borderRadius: "4px", textDecoration: "none", display: "inline-block", marginTop: "16px" }}
          >
            Enviar mensaje por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
};

export default RetirementPlanCalculator;