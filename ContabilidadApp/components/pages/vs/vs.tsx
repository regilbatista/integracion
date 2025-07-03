import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PieChart = () => {
    const [pieChart, setPieChart] = useState({
        series: [],
        options: {
            chart: {
                type: "pie",
                height: 300,
            },
            labels: [],
            colors: ["#4361ee", "#805dca", "#00ab55", "#e7515a", "#e2a03f"],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200,
                        },
                    },
                },
            ],
            legend: {
                position: "bottom",
            },
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/masrentados");
                const data = await response.json();

                setPieChart({
                    series: data.map((item) => item.cantidad_rentas),
                    options: {
                        ...pieChart.options,
                        labels: data.map((item) => item.nombre_vehiculo || `Vehículo ${item.vehiculo_Id}`),
                    },
                });
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="rounded-lg bg-white dark:bg-black p-4">
            {pieChart.series.length > 0 ? (
                <ReactApexChart
                    series={pieChart.series}
                    options={pieChart.options}
                    type="pie"
                    height={300}
                    width="100%"
                />
            ) : (
                <p>Cargando datos...</p>
            )}
        </div>
    );
};

export default PieChart;
