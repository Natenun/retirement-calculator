import React, { useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const RetirementPlanCalculator = () => {
  const [age, setAge] = useState(43);
  const [retirementAge] = useState(65); // Eliminado setRetirementAge
  const [desiredIncome] = useState(9000); // Eliminado setDesiredIncome
  const [extraExpense] = useState(0); // Eliminado setExtraExpense
  const [currentInvestment] = useState(0); // Eliminado setCurrentInvestment

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

  // Referencias para desplazamiento
  const planRef = useRef(null);
  const whatsappRef = useRef(null);

  // Función para formatear cantidades con comas
  const formatNumber = (number) => {
    const parsedNumber = parseFloat(number);
    if (isNaN(parsedNumber)) {
      return "0.00";
    }
    return parsedNumber.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Función para formatear los valores del eje Y
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`; // Convertir a millones (ej: 8M)
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`; // Convertir a miles (ej: 700k)
    }
    return value; // Dejar valores pequeños como están
  };

  const generatePlanDescription = (plan) => {
    const {
      retirementAge,
      desiredIncome,
      extraExpense,
      currentInvestment,
      requiredCapital,
      monthlyInvestment,
    } = plan;

    return (
      <div style={{ fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
        <p>
          Para alcanzar tu meta, sólo necesitas invertir{" "}
          <strong>${formatNumber(monthlyInvestment)} pesos al mes</strong> desde ahora.
        </p>
        <p>
          Con eso, podrías tener un ingreso de{" "}
          <strong>${formatNumber(desiredIncome)} pesos mensuales (en valor de hoy)</strong> cuando llegues a los{" "}
          <strong>{retirementAge} años</strong>.
        </p>

        {extraExpense > 0 && (
          <p>
            Además, estamos considerando un gasto adicional cada año de{" "}
            <strong>${formatNumber(extraExpense)} pesos</strong>, que irá subiendo con el tiempo (porque todo sube, ¿verdad?). Pero no te preocupes, ¡ya está incluido en el plan!
          </p>
        )}

        {currentInvestment > 0 && (
          <p>
            <strong>👉 Este plan ya considera que empiezas con una inversión inicial de{" "}
            ${formatNumber(currentInvestment)} pesos.</strong>
            Eso le da un buen impulso a tu dinero desde el principio y te ayuda a alcanzar tu meta más rápido y con menos esfuerzo mes a mes.
          </p>
        )}

        <p style={{ marginTop: "16px" }}>
          <strong>🧾 ¿Qué significa esto?</strong>
        </p>
        <p>
          Tu dinero crecería hasta formar un fondo de alrededor de{" "}
          <strong>${formatNumber(requiredCapital)} pesos</strong>.
        </p>
        
        <p style={{ marginTop: "16px" }}>
          <strong>💡 💡 Ya calculamos todo por ti (inflación, rendimiento, etc).</strong>
        </p>
        

        {/* Gráfica */}
        <div style={{ marginTop: "24px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={plan.projection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatYAxis} /> {/* Formatear eje Y */}
              <Tooltip formatter={(value) => `$${formatNumber(value)}`} />
              <Line type="monotone" dataKey="capital" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Nuevo cierre */}
        <div style={{ marginTop: "24px", background: "#f9f9f9", padding: "16px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
            <strong>📊 Tu plan, a tu manera</strong>
          </p>
          <p style={{ marginBottom: "12px" }}>
           Te gusta el plan? sigue en el circulo azul y mandanos mensaje para ayudarte a contunuar o.
          </p>
          <p style={{ marginBottom: "12px" }}>
            ¿Te gustaría probar otras combinaciones? Puedes cambiar lo que necesites:
          </p>
          <ul style={{ marginLeft: "20px", marginBottom: "12px" }}>
            <li>✅ Retirarte antes o después...</li>
            <li>✅ Quisieras tener mejores ingresos</li>
            <li>✅ ¿Ya cuentas con inversión en <strong>Lo Nuestro</strong>?</li>
            <li>✅ Dinero extra para disfrutar la vida desde ¡ya! Como para vacaciones anuales o gastos en caprichos (nuevo celular, comidas en restaurantes, etc.).</li>
          </ul>
          <p>
            Ve cómo se transforma tu futuro con solo mover algunos datos.
          </p>
        </div>
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
      requiredCapital: requiredCapital.toFixed(2),
      monthlyInvestment: monthlyInvestment.toFixed(2),
      extraExpense: actualExtraExpense,
      currentInvestment: actualCurrentInvestment,
      projection: data,
    };

    setPlans((prevPlans) => {
      const updatedPlans = [...prevPlans, newPlan];
      setCurrentPlanIndex(updatedPlans.length - 1); // Actualizar el índice del plan actual
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

  // Función para desplazar a la sección de WhatsApp
  const scrollToWhatsApp = () => {
    if (whatsappRef.current) {
      whatsappRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "8px", padding: "16px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Vamos paso a paso hacia una vida financiera más clara.</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "16px", color: "#333" }}>
            Empecemos por lo básico: <strong>¿cuántos años tienes? </strong>.
            Con eso podemos ayudarte a trazar un plan financiero que se adapte a tu vida.
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
        <div ref={planRef} style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button
              onClick={prevPlan}
              style={{ background: "#6b7280", color: "white", padding: "8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            >
              Anterior
            </button>
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0" }}>
              {currentPlanIndex === 0 ? "Plan Estándar" : `Plan ${currentPlanIndex}`}
            </h3>
            <button
              onClick={nextPlan}
              style={{ background: "#6b7280", color: "white", padding: "8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            >
              Siguiente
            </button>
          </div>
          {generatePlanDescription(plans[currentPlanIndex])}
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

      {/* Sección de WhatsApp */}
      {plans.length > 0 && (
        <div ref={whatsappRef} style={{ marginTop: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", marginBottom: "16px" }}>
            <strong>🌟 Ya nos imaginamos ese futuro ... ahora toca hacerlo real.</strong>
          </p>
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", marginBottom: "16px" }}>
            Hay dos cosas que suelen hacer difícil alcanzar estas metas:
          </p>
          <ul style={{ textAlign: "left", marginLeft: "20px", marginBottom: "16px" }}>
            <li>Conseguir rendimientos altos, como ese 20% anual.</li>
            <li>Y además, vivimos en una cultura donde no se habla de finanzas, ni se promueve la idea de crecer en colectivo.</li>
          </ul>
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", marginBottom: "16px" }}>
            Sabemos que hacerlo solo es complicado.
            Por eso nació <strong>“Lo Nuestro”</strong>, una comunidad donde unimos fuerzas, sumamos talentos y logramos lo que, por separado, tomaría mucho más tiempo.
          </p>
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", marginBottom: "16px" }}>
            ¿Te gustaría sumarte? Mándanos un mensajito y te contamos cómo empezar.
          </p>
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", marginBottom: "16px" }}>
            <strong>✨ No cuesta nada, pero puede hacer toda la diferencia.</strong>
          </p>
          <a
            href={`https://wa.me/522481146831?text=${encodeURIComponent(
              `Hola, quiero saber más sobre cómo lograr mi plan de retiro. Aquí están los detalles de mi plan:\n\n` +
              `- Edad actual: ${plans[currentPlanIndex].age} años\n` + // Agregado: Edad actual
              `- Edad de retiro: ${plans[currentPlanIndex].retirementAge} años\n` +
              `- Ingreso mensual deseado: $${formatNumber(plans[currentPlanIndex].desiredIncome)} pesos\n` +
              `- Gasto extra anual: $${formatNumber(plans[currentPlanIndex].extraExpense)} pesos\n` + // Agregado: Gasto extra anual
              `- Inversión inicial: $${formatNumber(plans[currentPlanIndex].currentInvestment)} pesos\n` + // Agregado: Inversión inicial
              `- Inversión mensual necesaria: $${formatNumber(plans[currentPlanIndex].monthlyInvestment)} pesos\n` +
              `- Capital requerido: $${formatNumber(plans[currentPlanIndex].requiredCapital)} pesos\n`
            )}`}
            style={{
              background: "#25D366",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "16px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Enviar mensaje por WhatsApp
          </a>
        </div>
      )}

      {/* Botón circular "Continuar" */}
      {plans.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <button
            onClick={scrollToWhatsApp}
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "12px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "50px",
              height: "50px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RetirementPlanCalculator;