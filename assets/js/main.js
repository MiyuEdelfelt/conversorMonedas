// Función para obtener los datos desde la API
async function getExchangeRates() {
    try {
        console.log('Intentando obtener datos desde la API...');
        const response = await fetch('https://mindicador.cl/api'); // Solicitud a la API real

        if (!response.ok) {
            console.error(`Error en la respuesta de la API: ${response.statusText}`);
            throw new Error('No se pudo obtener los datos de la API.');
        }

        const data = await response.json();
        console.log('Datos obtenidos de la API:', data); // Log para verificar los datos
        return data;
    } catch (error) {
        console.error('Error al obtener los datos desde la API:', error);
        document.getElementById('error').textContent = error.message;
        throw error;
    }
}

// Función para cargar las monedas en el select
async function loadCurrencies() {
    try {
        console.log('Cargando monedas en el select...');
        const data = await getExchangeRates();
        const currencySelect = document.getElementById('currency');

        // Filtrar monedas que tienen valores válidos
        const currencies = Object.keys(data).filter(
            key => data[key].valor && typeof data[key].valor === 'number'
        );

        if (currencies.length === 0) {
            console.warn('No se encontraron monedas con valores válidos.');
            document.getElementById('error').textContent = 'No se encontraron monedas disponibles.';
            return;
        }

        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = data[currency].nombre || currency.toUpperCase();
            currencySelect.appendChild(option);
        });

        console.log(`Se cargaron ${currencies.length} monedas en el select:`, currencies);
        console.log('Contenido actual del select:', currencySelect.innerHTML);
    } catch (error) {
        console.error('Error al cargar las monedas en el select:', error);
        document.getElementById('error').textContent = 'Error al cargar las monedas. Revisa la consola para más detalles.';
    }
}

// Evento para convertir la moneda
document.getElementById('convert').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currency').value;

    console.log(`Cantidad ingresada: ${amount}, Moneda seleccionada: ${currency}`);

    // Validar entrada del usuario
    if (isNaN(amount) || amount <= 0) {
        console.warn('Cantidad inválida ingresada por el usuario.');
        document.getElementById('error').textContent = 'Por favor, ingresa una cantidad válida.';
        return;
    }

    try {
        const data = await getExchangeRates();
        if (!data[currency]) {
            console.warn(`Moneda seleccionada (${currency}) no disponible en los datos de la API.`);
            document.getElementById('error').textContent = `La moneda seleccionada (${currency}) no está disponible en los datos de la API.`;
            return;
        }

        // Obtenemos el valor actual de la moneda
        const rate = data[currency].valor;
        if (!rate) {
            console.warn(`Valor no encontrado para la moneda ${currency}.`);
            document.getElementById('error').textContent = 'Tipo de cambio no encontrado.';
            return;
        }

        // Realizamos la conversión
        const result = (amount / rate).toFixed(2);
        console.log(`Resultado de la conversión: ${result} ${currency.toUpperCase()}`);
        document.getElementById('result').textContent = `Resultado: ${result} ${currency.toUpperCase()}`;

        // Actualizamos el gráfico con el historial
        await updateChart(currency); // Llamamos a la función en chart.js
    } catch (error) {
        console.error('Error al realizar la conversión:', error);
    }
});

// Cargar las monedas cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada. Iniciando carga de monedas...');
    loadCurrencies();
});
