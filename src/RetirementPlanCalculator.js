import React, { useState } from "react";
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
      <p style={{ marginTop: "16px", fontStyle: "italic" }}>
        ¿Quisieras que te digamos cómo lograrlo? Muchas personas se están asociando en la cooperativa{" "}
        <strong>"Lo Nuestro"</strong> para alcanzar sus metas de retiro. ¡Mándanos un mensaje y te decimos los siguientes pasos! Cabe mencionar que no cuesta nada.
      </p>
      <a
        href="https://wa.me/522481146831?text=Hola,%20quiero%20saber%20más%20sobre%20cómo%20lograr%20mi%20plan%20de%20retiro"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: "16px",
          padding: "12px 24px",
          background: "#25D366",
          color: "white",
          borderRadius: "4px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Contáctanos por WhatsApp
      </a>
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
        // Aplicar gasto extra cada 12 meses (1 año)
        if (actualExtraExpense > 0 && i % 12 === 0) {
          const adjustedExpense = actualExtraExpense * Math.pow(1 + inflationRate, i / 12);
          accumulated -= adjustedExpense;
        }
      }
      return accumulated;
    };

    let low = 0;
    let high = futureSalary * 100;
    while (high - low > 0.01) {
      monthlyInvestment = (high + low) / 2;
      accumulated = calculateAccumulated(monthlyInvestment);

      if (accumulated > requiredCapital) {
        high = monthlyInvestment;
      } else {
        low = monthlyInvestment;
      }
    }

    let data = [];
    accumulated = actualCurrentInvestment;
    for (let i = 1; i <= monthsToRetirement; i++) {
      const interesMensual = accumulated * r;
      accumulated += interesMensual + monthlyInvestment;
      // Aplicar gasto extra cada 12 meses (1 año)
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

    setPlans((prevPlans) => [...prevPlans, newPlan]);
    setCurrentPlanIndex(plans.length);
    setShowCustomOptions(true);
  };

  const nextPlan = () => setCurrentPlanIndex((index) => (index + 1) % plans.length);
  const prevPlan = () => setCurrentPlanIndex((index) => (index - 1 + plans.length) % plans.length);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "8px", padding: "16px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Calculadora de Plan de Retiro</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
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
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Detalles del Plan</h3>
          <p>{generatePlanDescription(plans[currentPlanIndex])}</p>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <LineChart data={plans[currentPlanIndex].projection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="capital" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
    </div>
  );
};

export default RetirementPlanCalculator;