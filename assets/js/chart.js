// Función para obtener los datos históricos de una moneda
async function getHistoricalData(currency) {
    try {
        console.log(`Obteniendo datos históricos para la moneda ${currency}...`);
        const response = await fetch(`https://mindicador.cl/api/${currency}`);
        if (!response.ok) {
            console.error(`Error al obtener los datos históricos de ${currency}: ${response.statusText}`);
            throw new Error(`No se pudieron obtener los datos históricos de ${currency}.`);
        }
        const data = await response.json();

        if (!data.serie || data.serie.length === 0) {
            console.warn(`La moneda ${currency} no tiene datos históricos válidos.`);
            return [];
        }

        console.log(`Datos históricos obtenidos para ${currency}:`, data.serie);
        return data.serie; // Devuelve el historial
    } catch (error) {
        console.error(`Error al obtener los datos históricos de ${currency}:`, error);
        throw error;
    }
}

// Función para actualizar el gráfico
async function updateChart(currency) {
    const ctx = document.getElementById('chart').getContext('2d');

    try {
        const historicalData = await getHistoricalData(currency);

        // Validar que haya datos históricos
        if (!historicalData || historicalData.length === 0) {
            console.warn(`No hay datos históricos disponibles para la moneda ${currency}.`);
            document.getElementById('error').textContent = 'No hay datos históricos disponibles para esta moneda.';
            return;
        }

        // Procesar los últimos 10 días de datos
        const last10Days = historicalData.slice(0, 10).reverse();
        const labels = last10Days.map(item => {
            const date = new Date(item.fecha);
            return date.toLocaleDateString('es-CL');
        });
        const values = last10Days.map(item => item.valor);

        console.log('Datos procesados para el gráfico:', { labels, values });

        // Limpiar el gráfico existente
        if (window.myChart) {
            window.myChart.destroy();
            console.log('Gráfico anterior destruido.');
        }

        // Crear un nuevo gráfico
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Historial de los últimos 10 días (${currency.toUpperCase()})`,
                        data: values,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 1,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Valor: ${context.raw.toFixed(2)} CLP`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        console.log('Gráfico generado correctamente.');
    } catch (error) {
        console.error('Error al generar el gráfico:', error);
        document.getElementById('error').textContent = 'Error al generar el gráfico.';
    }
}
